import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signInUser,
  signUpUser,
  authenticateRequest,
  invalidateSession,
} from "@/server/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "signin", email, password, role } = body;
    const cookieStore = await cookies();

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (action === "signup") {
      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email is required for registration" },
          { status: 400 }
        );
      }

      const result = await signUpUser(email, password, role, ipAddress);

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

    if (action === "signin") {
      if (!email) {
        return NextResponse.json(
          { success: false, error: "Operator email is required" },
          { status: 400 }
        );
      }

      const result = await signInUser(email, password, ipAddress);

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
