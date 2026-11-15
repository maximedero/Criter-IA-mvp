export const CASE_STATUSES = [
  "NEW",
  "DRAFT",
  "IN_ANALYSIS",
  "CRITICAL_REVIEW",
  "HUMAN_EVALUATION",
  "BRIEF_DRAFT",
  "READY_TO_ESCALATE"
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  NEW: "Nuevo",
  DRAFT: "Borrador",
  IN_ANALYSIS: "En análisis",
  CRITICAL_REVIEW: "Revisión crítica",
  HUMAN_EVALUATION: "Evaluación humana",
  BRIEF_DRAFT: "Brief borrador",
  READY_TO_ESCALATE: "Listo para elevar"
};

export const HUMAN_SEVERITIES = ["UNASSESSED", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type HumanSeverity = (typeof HUMAN_SEVERITIES)[number];
