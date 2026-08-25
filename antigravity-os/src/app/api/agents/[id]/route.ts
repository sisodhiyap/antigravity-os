import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { agentSwarm, AgentRole } from "@/server/swarm/agent-swarm";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleKey = id.toUpperCase().replace(/-/g, "_") as AgentRole;
    const agent = agentSwarm.getAgent(roleKey);

    if (!agent) {
      throw new NotFoundError("Agent", id);
    }

    return apiSuccess(agent);
  } catch (error) {
    return apiError(error);
  }
}
