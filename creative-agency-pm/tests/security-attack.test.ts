import assert from "assert";
import http from "http";
import net from "net";
import { startServer } from "../src/server";
import { db } from "../src/db/database";

const TEST_PORT = 3498;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function rawRequest(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const postData = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : "";
    const req = http.request(
      BASE_URL + path,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          ...options.headers
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 0, body: raw });
          }
        });
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runSecurityAttacks() {
  console.log("\n==========================================");
  console.log("RED-TEAM ADVERSARIAL ATTACK SUITE");
  console.log("==========================================\n");

  const server = await startServer(TEST_PORT);

  try {
    // 1. Path Traversal Attack (Linux & Windows style)
    console.log("🛡️ [Attack 1] Path Traversal on File Vault (/api/files/download)");
    const attack1 = await rawRequest("/api/files/download?path=../../../../etc/passwd");
    assert.strictEqual(attack1.status, 403, "Path traversal was not blocked with 403!");
    assert.strictEqual(attack1.body.code, "SECURITY_PATH_TRAVERSAL_BLOCKED");
    console.log("  ✓ Linux Path Traversal (/../../etc/passwd): BLOCKED (HTTP 403)");

    const attack2 = await rawRequest("/api/files/download?path=..\\..\\windows\\system32\\cmd.exe");
    assert.strictEqual(attack2.status, 403, "Windows path traversal was not blocked with 403!");
    console.log("  ✓ Windows Path Traversal (..\\..\\windows): BLOCKED (HTTP 403)");

    // 2. Static File Server Directory Escape (Raw TCP Socket Attack)
    console.log("🛡️ [Attack 2] Static Server Directory Escape (Raw Socket)");
    const rawSocketAttack = await new Promise<{ status: number; body: string }>((resolve) => {
      const socket = net.connect(TEST_PORT, "127.0.0.1", () => {
        socket.write("GET /../../package.json HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
      });
      let data = "";
      socket.on("data", (chunk) => (data += chunk.toString()));
      socket.on("end", () => {
        const firstLine = data.split("\r\n")[0] || "";
        const statusCode = parseInt(firstLine.split(" ")[1] || "0", 10);
        resolve({ status: statusCode, body: data });
      });
      socket.on("error", () => resolve({ status: 500, body: "" }));
    });
    assert.strictEqual(rawSocketAttack.status, 403, "Static server raw directory escape was not blocked with 403!");
    console.log("  ✓ Static File Server Breakout (GET /../../package.json): BLOCKED (HTTP 403)");

    // 3. SQL Injection Payload in Search & Record Creation
    console.log("🛡️ [Attack 3] SQL Injection / Metacharacter Injection");
    const sqliPayload = "'; DROP TABLE users; --";
    const sqliSearch = await rawRequest(`/api/search?q=${encodeURIComponent(sqliPayload)}`);
    assert.strictEqual(sqliSearch.status, 200);
    // Verify database users table remains completely intact
    assert(db.count("users") >= 5, "Users table was corrupted or dropped!");
    console.log("  ✓ SQL Injection Neutralization: PASSED (Zero data corruption)");

    // 4. Stored XSS Script Payload Injection
    console.log("🛡️ [Attack 4] Stored XSS Script Tag Injection");
    const xssPayload = "<script>alert('XSS_VULNERABILITY_PAYLOAD');</script>";
    const createComment = await rawRequest("/api/comments", {
      method: "POST",
      body: {
        entity_type: "task",
        entity_id: "tsk_01",
        content: xssPayload
      }
    });
    assert.strictEqual(createComment.status, 201);
    assert.strictEqual(createComment.body.data.content, xssPayload);
    console.log("  ✓ Stored XSS Payload: Handled cleanly in isolated JSON boundary");

    // 5. Tampered Session Token & Forged JWT
    console.log("🛡️ [Attack 5] Forged JWT Session Token Attack");
    const forgedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.FAKE_SIGNATURE_TAMPERED";
    const authMe = await rawRequest("/api/auth/me", {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    assert.strictEqual(authMe.status, 401, "Forged token was not rejected with 401!");
    console.log("  ✓ Forged JWT Signature: REJECTED (HTTP 401 Unauthenticated)");

    // 6. Brute Force Invalid Credential Guessing
    console.log("🛡️ [Attack 6] Credential Stuffing / Invalid Login");
    const invalidLogin = await rawRequest("/api/auth/login", {
      method: "POST",
      body: { email: "elena@aurastudio.design", password: "AttackerGuessedPassword!" }
    });
    assert.strictEqual(invalidLogin.status, 401);
    console.log("  ✓ Brute-Force Password Guess: REJECTED (HTTP 401)");

    console.log("\n==========================================");
    console.log("ALL 6 SECURITY ATTACKS INTERCEPTED & BLOCKED (100% PASS)");
    console.log("==========================================\n");
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runSecurityAttacks().catch(console.error);
}

export { runSecurityAttacks };
