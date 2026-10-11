import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signInUser,
  signUpUser,
  provisionOwnerAccount,
  authenticateRequest,
  invalidateSession,
} from "@/server/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "signin", email, username, userId, identifier: rawId, password, role } = body;
    const identifier = (rawId || username || userId || email || "").trim();
    const cookieStore = await cookies();

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (action === "provision_owner") {
      const adminSecret = req.headers.get("x-admin-secret") || body.adminSecret;
      if (!adminSecret) {
        return NextResponse.json(
          { success: false, error: "Administrative secret is required for owner provisioning" },
          { status: 403 }
        );
      }
      if (!identifier || !password) {
        return NextResponse.json(
          { success: false, error: "Identifier and password are required" },
          { status: 400 }
        );
      }
      const result = await provisionOwnerAccount(identifier, password, adminSecret, ipAddress);
      return NextResponse.json({
        success: true,
        user: result.user,
        message: "Sovereign owner account provisioned successfully",
      });
    }

    if (action === "signup" || action === "register") {
      if (!identifier) {
        return NextResponse.json(
          { success: false, error: "Operator identifier is required for registration" },
          { status: 400 }
        );
      }

      const result = await signUpUser(identifier, password, role, ipAddress);

      cookieStore.set("omnicraft_session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: result.expiresAt,
      });

      return NextResponse.json({
        success: true,
        user: result.user,
      });
    }

    if (action === "signin" || action === "login") {
      if (!identifier) {
        return NextResponse.json(
          { success: false, error: "Operator identifier or email is required" },
          { status: 400 }
        );
      }

      const result = await signInUser(identifier, password, ipAddress);

      cookieStore.set("omnicraft_session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: result.expiresAt,
      });

      return NextResponse.json({
        success: true,
        user: result.user,
      });
    }

    if (action === "logout") {
      const token = cookieStore.get("omnicraft_session")?.value;
      if (token) {
        await invalidateSession(token);
      }
      cookieStore.delete("omnicraft_session");

      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    return NextResponse.json({ success: true, authenticated: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: error.message },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omnicraft_session")?.value;
    if (token) {
      await invalidateSession(token);
    }
    cookieStore.delete("omnicraft_session");
    return NextResponse.json({ success: true, message: "Session cleared" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
