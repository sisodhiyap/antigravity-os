import { NextResponse } from "next/server";
import { PRO_TEMPLATES } from "@/presentx/templates";

export async function GET() {
  return NextResponse.json({ success: true, templates: PRO_TEMPLATES });
}
