import { apiSuccess, apiError } from "@/lib/api-response";
import { agentSwarm } from "@/server/swarm/agent-swarm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = agentSwarm.getAllAgents();
    return apiSuccess(agents);
  } catch (error) {
    return apiError(error);
  }
}
