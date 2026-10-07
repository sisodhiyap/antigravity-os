import { NextRequest, NextResponse } from "next/server";
import { EngineeringMemory } from "@/learning/EngineeringMemory";
import { FailureKnowledgeGraph } from "@/learning/FailureKnowledgeGraph";
import { RegressionKnowledgeBase } from "@/learning/RegressionKnowledgeBase";

export async function GET() {
  const memory = EngineeringMemory.getInstance();
  const fkg = FailureKnowledgeGraph.getInstance();
  const reg = RegressionKnowledgeBase.getInstance();

  return NextResponse.json({
    success: true,
    data: {
      ownerPreferences: memory.ownerMemory,
      projectsCount: memory.projectMemory.size,
      missionsLearned: memory.missionMemory.size,
      reusablePatterns: Array.from(memory.engineeringMemory.values()),
      failureKnowledge: fkg.getAllRecords(),
      regressionCandidates: reg.getAllBugs()
    }
  });
}
