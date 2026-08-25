// CRM Pipeline Manager Module - Autonomously Patched
export type DealStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "CLOSED_WON";

export interface Deal {
  id: string;
  clientName: string;
  valueUsd: number;
  stage: DealStage;
}

export function calculatePipelineValue(deals: Deal[]): number {
  return deals.reduce((acc, d) => acc + d.valueUsd, 0);
}
