import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omnicraft_session")?.value;

    if (token) {
      // 1. Delete session from SQLite database to invalidate it server-side
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }

    // 2. Clear HttpOnly session cookie
    cookieStore.set("omnicraft_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Set to epoch to force browser removal
    });

    return Response.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
