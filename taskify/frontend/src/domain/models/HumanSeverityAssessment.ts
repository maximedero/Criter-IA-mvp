import type { HumanSeverity } from "./CaseStatus";

export const HUMAN_SEVERITY_ASSESSMENT_STATUSES = ["UNASSESSED", "ASSESSED"] as const;
export type HumanSeverityAssessmentStatus = (typeof HUMAN_SEVERITY_ASSESSMENT_STATUSES)[number];

export const HUMAN_SEVERITY_LABELS: Record<HumanSeverity, string> = {
  UNASSESSED: "Sin evaluar",
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica"
};

export type HumanSeverityAssessment = {
  caseId: string;
  severity: HumanSeverity;
  rationale?: string;
  assessedBy: "USER";
  assessedAt: string | null;
  updatedAt: string;
  status: HumanSeverityAssessmentStatus;
};
