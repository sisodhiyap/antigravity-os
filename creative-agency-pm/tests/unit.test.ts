import assert from "assert";
import { db } from "../src/db/database";
import { AuthService } from "../src/auth/auth";
import { RBAC } from "../src/auth/rbac";

console.log("\n==========================================");
console.log("UNIT TESTS: Aura Studio OS Core Engine");
console.log("==========================================\n");

// 1. Database Operations & ACID Persistence
console.log("▶ [Test 1] SQLite Atomic Persistence & CRUD");
const initialClientCount = db.count("clients");
const newClient = db.insert("clients", {
  name: "Unit Test Client",
  company: "Unit Corp",
  contact_email: "unit@test.com",
  phone: "123456",
  tier: "Standard",
  status: "active",
  notes: "Test note"
});
assert(newClient.id, "Client insertion failed");
assert.strictEqual(db.count("clients"), initialClientCount + 1, "Count mismatch after insert");

const fetched = db.findById("clients", newClient.id);
assert.strictEqual(fetched?.name, "Unit Test Client", "Client lookup mismatch");

const updated = db.update("clients", newClient.id, { company: "Unit Corp Global" });
assert.strictEqual(updated?.company, "Unit Corp Global", "Client update failed");

const deleted = db.delete("clients", newClient.id);
assert(deleted, "Client deletion failed");
assert.strictEqual(db.findById("clients", newClient.id), null, "Deleted client still exists");
console.log("  ✓ Database CRUD & Atomic Persistence: PASS");

// 2. Cryptographic Password Hashing & Timing-Safe Verification
console.log("▶ [Test 2] PBKDF2-SHA512 Cryptography (100k rounds, 32-byte salt)");
const password = "SuperSecretCreativePassword2026!";
const { hash, salt } = AuthService.hashPassword(password);
assert(hash && hash.length === 128, "Invalid SHA512 hash length");
assert(salt && salt.length === 64, "Invalid 32-byte hex salt length");

const isValid = AuthService.verifyPassword(password, hash, salt);
assert.strictEqual(isValid, true, "Valid password verification failed");

const isInvalid = AuthService.verifyPassword("WrongPassword123", hash, salt);
assert.strictEqual(isInvalid, false, "Invalid password incorrectly accepted");
console.log("  ✓ PBKDF2 Cryptographic Verification: PASS");

// 3. JWT Session Creation & HMAC Signature
console.log("▶ [Test 3] JWT Session Token HMAC Verification");
const mockUser = {
  id: "usr_mock",
  name: "Mock User",
  email: "mock@aura.design",
  password_hash: hash,
  salt,
  role: "lead" as const,
  title: "Art Lead",
  avatar_url: "",
  status: "active" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const token = AuthService.createSessionToken(mockUser);
const session = AuthService.verifySessionToken(token);
assert(session, "Failed to decode valid session token");
assert.strictEqual(session?.userId, "usr_mock", "Session user ID mismatch");
assert.strictEqual(session?.role, "lead", "Session role mismatch");

const tamperedToken = token.slice(0, -5) + "abcde";
const invalidSession = AuthService.verifySessionToken(tamperedToken);
assert.strictEqual(invalidSession, null, "Tampered signature was not rejected");
console.log("  ✓ JWT HMAC Signature & Tamper Defense: PASS");

// 4. Role-Based Access Control Matrix
console.log("▶ [Test 4] RBAC Matrix & Role Boundaries");
assert(RBAC.hasPermission("admin", "team:manage"), "Admin missing team:manage permission");
assert(RBAC.hasPermission("director", "approvals:review"), "Director missing approvals:review");
assert(RBAC.hasPermission("designer", "files:upload"), "Designer missing files:upload");
assert(!RBAC.hasPermission("designer", "team:manage"), "Designer improperly granted team:manage");
assert(!RBAC.hasPermission("client", "tasks:delete"), "Client improperly granted tasks:delete");
console.log("  ✓ RBAC Permissions & Hierarchies: PASS");

console.log("\n==========================================");
console.log("ALL UNIT TESTS PASSED (4/4 PASS)");
console.log("==========================================\n");
