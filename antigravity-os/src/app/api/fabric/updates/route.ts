import { NextRequest, NextResponse } from "next/server";
import { upstreamUpdateManager } from "@/server/fabric/updates/update-manager";
import { UpdateChannel } from "@/server/fabric/updates/types";

export async function GET(req: NextRequest) {
  try {
    const policy = upstreamUpdateManager.getPolicyConfig();
    const records = upstreamUpdateManager.getAllUpdateRecords();

    return NextResponse.json({
      success: true,
      policy,
      records,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action; // "check_now" | "set_channel" | "update_policy"

    if (action === "check_now") {
      const result = await upstreamUpdateManager.checkForUpdates();
      return NextResponse.json({ success: true, result });
    }

    if (action === "set_channel") {
      const channel: UpdateChannel = body.channel;
      upstreamUpdateManager.updatePolicyConfig({ channel });
      return NextResponse.json({
        success: true,
        policy: upstreamUpdateManager.getPolicyConfig(),
        message: `Update channel set to ${channel}.`,
      });
    }

    if (action === "update_policy") {
      upstreamUpdateManager.updatePolicyConfig(body.policy || {});
      return NextResponse.json({
        success: true,
        policy: upstreamUpdateManager.getPolicyConfig(),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Supported: check_now, set_channel, update_policy." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
