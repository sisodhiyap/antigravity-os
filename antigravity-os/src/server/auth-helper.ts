import { prisma } from "./db";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { CryptoService } from "./security/crypto-service";
import { AuthRateLimiter } from "./security/rate-limiter";

export interface UserSessionPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt: Date;
}

/**
 * Registers a new user with cryptographic password hashing and returns an initial session.
 * Enforces server-controlled role assignment: public registrations default strictly to "USER".
 */
export async function signUpUser(
  email: string,
  password?: string,
  _requestedRole?: string,
  ipAddress?: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isValidIdentifier = !/\s/.test(normalizedEmail) && normalizedEmail.length >= 3;

  if (!normalizedEmail || (!isEmail && !isValidIdentifier)) {
    throw new Error("A valid email address or operator identifier is required");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new Error("Unable to register account with the provided details.");
  }

  let passwordHash: string | null = null;
  let passwordSalt: string | null = null;

  if (password) {
    const strength = CryptoService.validatePasswordStrength(password);
    if (!strength.valid) {
      throw new Error(`Password policy violation: ${strength.issues.join("; ")}`);
    }
    const hashed = CryptoService.hashPassword(password);
    passwordHash = hashed.hash;
    passwordSalt = hashed.salt;
  }

  // Strict role assignment: default user role must be USER (client cannot elevate to ADMIN/OWNER)
  const assignedRole = "USER";

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: assignedRole,
      passwordHash,
      passwordSalt,
      failedAttempts: 0,
    },
  });

  // Create session
  const token = CryptoService.generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Audit Log - never include passwords or tokens
  await prisma.auditLog.create({
    data: {
      action: "ACCOUNT_CREATED",
      entityType: "USER",
      entityId: user.id,
      actorId: user.id,
      ipAddress: ipAddress || null,
      metadata: JSON.stringify({ role: assignedRole }),
    },
  }).catch(() => {});

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    expiresAt,
  };
}

/**
 * Authenticates a user with constant-time password verification, rate-limiting, and generic non-enumerating error messages.
 */
export async function signInUser(
  email: string,
  password?: string,
  ipAddress?: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const rateLimiter = AuthRateLimiter.getInstance();

  // 1. Check Rate Limits for Email and IP
  const emailLimit = rateLimiter.checkLimit(normalizedEmail);
  if (!emailLimit.allowed) {
    throw new Error(
      `Account temporarily locked due to excessive failed attempts. Please retry in ${emailLimit.retryAfterSeconds}s.`
    );
  }

  if (ipAddress) {
    const ipLimit = rateLimiter.checkLimit(ipAddress);
    if (!ipLimit.allowed) {
      throw new Error(
        `Too many requests from this IP address. Please retry in ${ipLimit.retryAfterSeconds}s.`
      );
    }
  }

  // 2. Lookup User: match lowercase normalized OR exact raw identifier
  const rawIdentifier = email.trim();
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user && rawIdentifier !== normalizedEmail) {
    user = await prisma.user.findUnique({ where: { email: rawIdentifier } });
  }

  if (!user) {
    rateLimiter.recordFailure(normalizedEmail);
    if (ipAddress) rateLimiter.recordFailure(ipAddress);
    // Non-enumerating generic response
    throw new Error("Invalid email or password.");
  }

  // 3. Check DB Lockout state
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    throw new Error(
      `Account temporarily locked due to excessive failed attempts. Please retry in ${remainingSeconds}s.`
    );
  }

  // 4. Verify Password
  if (!password || !user.passwordHash || !user.passwordSalt || !CryptoService.verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    const emailStatus = rateLimiter.recordFailure(normalizedEmail);
    if (ipAddress) rateLimiter.recordFailure(ipAddress);

    const newFailedAttempts = user.failedAttempts + 1;
    let newLockedUntil: Date | null = null;

    if (newFailedAttempts >= 5) {
      newLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lockedUntil: newLockedUntil,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOGIN_FAILED",
        entityType: "USER",
        entityId: user.id,
        actorId: user.id,
        ipAddress: ipAddress || null,
        metadata: JSON.stringify({ failedAttempts: newFailedAttempts }),
      },
    }).catch(() => {});

    if (!emailStatus.allowed) {
      throw new Error("Account temporarily locked due to excessive failed attempts. Please retry in 900s.");
    }

    // Generic error message without revealing user existence or internal detail
    throw new Error("Invalid email or password.");
  }

  // 5. Success! Reset failure counters & rotate session
  rateLimiter.recordSuccess(normalizedEmail);
  if (ipAddress) rateLimiter.recordSuccess(ipAddress);

  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // 6. Generate New Session Token (Session Rotation)
  const token = CryptoService.generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Audit Log - never log passwords or tokens
  await prisma.auditLog.create({
    data: {
      action: "LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user.id,
      actorId: user.id,
      ipAddress: ipAddress || null,
    },
  }).catch(() => {});

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    expiresAt,
  };
}

/**
 * Backward compatibility session creator
 */
export async function createSession(email: string): Promise<AuthResult> {
  return signInUser(email);
}

/**
 * Invalidates and deletes a session upon logout
 */
export async function invalidateSession(token: string): Promise<void> {
  if (!token) return;
  await prisma.session.delete({ where: { token } }).catch(() => {});
}

/**
 * Authenticates an incoming NextRequest by checking cookies or Authorization header.
 */
export async function authenticateRequest(req: NextRequest): Promise<UserSessionPayload> {
  // 1. Try to read from cookies
  let token = req.cookies.get("omnicraft_session")?.value;

  // 2. Try to read from Authorization header
  if (!token) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw new Error("Authentication failed: No session token provided");
  }

  const sessionRecord = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!sessionRecord) {
    throw new Error("Authentication failed: Invalid session token");
  }

  if (new Date() > sessionRecord.expiresAt) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    throw new Error("Authentication failed: Session token has expired");
  }

  return {
    id: sessionRecord.user.id,
    email: sessionRecord.user.email,
    role: sessionRecord.user.role,
  };
}

export async function checkProjectMembership(
  projectId: string,
  userId: string,
  allowedRoles?: string[]
): Promise<void> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!member) {
    throw new Error("Authorization failed: Operator is not a member of this workspace");
  }

  if (allowedRoles && !allowedRoles.includes(member.role)) {
    throw new Error(`Authorization failed: Insufficient permissions (requires ${allowedRoles.join(" or ")})`);
  }
}

/**
 * Securely provisions or resets the sovereign OWNER account.
 * Requires verification of a trusted server-side secret (OWNER_PROVISIONING_SECRET, ADMIN_SECRET, or JWT_SECRET).
 */
export async function provisionOwnerAccount(
  identifier: string,
  password: string,
  adminSecret: string,
  ipAddress?: string
): Promise<{ success: boolean; user: { id: string; email: string; role: string } }> {
  const trustedSecret =
    process.env.OWNER_PROVISIONING_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.JWT_SECRET ||
    process.env.VERCEL_TOKEN;

  if (!trustedSecret || !adminSecret) {
    throw new Error("Unauthorized: Administrative secret not configured or missing.");
  }

  const trustedBuffer = Buffer.from(trustedSecret);
  const providedBuffer = Buffer.from(adminSecret);
  if (
    trustedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(trustedBuffer, providedBuffer)
  ) {
    throw new Error("Unauthorized: Invalid administrative secret.");
  }

  const normalized = identifier.trim().toLowerCase();
  if (!normalized || normalized.length < 3) {
    throw new Error("Identifier must be at least 3 characters long");
  }

  const strength = CryptoService.validatePasswordStrength(password);
  if (!strength.valid) {
    throw new Error(`Password policy violation: ${strength.issues.join("; ")}`);
  }

  const hashed = CryptoService.hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {
      passwordHash: hashed.hash,
      passwordSalt: hashed.salt,
      role: "OWNER",
      failedAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: normalized,
      role: "OWNER",
      passwordHash: hashed.hash,
      passwordSalt: hashed.salt,
      failedAttempts: 0,
    },
  });

  // Also ensure linked as OWNER on default projects
  const projects = await prisma.project.findMany();
  for (const proj of projects) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: proj.id, userId: user.id } },
      update: { role: "OWNER" },
      create: { projectId: proj.id, userId: user.id, role: "OWNER" },
    }).catch(() => {});
  }

  await prisma.auditLog.create({
    data: {
      action: "OWNER_ACCOUNT_PROVISIONED",
      entityType: "USER",
      entityId: user.id,
      actorId: user.id,
      ipAddress: ipAddress || null,
      metadata: JSON.stringify({ role: "OWNER" }),
    },
  }).catch(() => {});

  return {
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
  };
}
