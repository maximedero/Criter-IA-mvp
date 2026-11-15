import type { HumanSeverity } from "../../domain/models/CaseStatus";
import type { HumanSeverityAssessment } from "../../domain/models/HumanSeverityAssessment";

const STORAGE_KEY = "dw.humanSeverityAssessments";

type HumanSeverityAssessmentMap = Record<string, HumanSeverityAssessment>;

function nowIso(): string {
  return new Date().toISOString();
}

function assessmentStatusFromSeverity(severity: HumanSeverity): HumanSeverityAssessment["status"] {
  return severity === "UNASSESSED" ? "UNASSESSED" : "ASSESSED";
}

function parseAssessmentMap(raw: string | null): HumanSeverityAssessmentMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as HumanSeverityAssessmentMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadMap(): HumanSeverityAssessmentMap {
  return parseAssessmentMap(localStorage.getItem(STORAGE_KEY));
}

function writeMap(value: HumanSeverityAssessmentMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getHumanSeverityAssessment(caseId: string): HumanSeverityAssessment {
  const map = loadMap();
  const existing = map[caseId];

  if (existing) {
    return existing;
  }

  const now = nowIso();
  return {
    caseId,
    severity: "UNASSESSED",
    assessedBy: "USER",
    assessedAt: null,
    updatedAt: now,
    status: "UNASSESSED"
  };
}

export type SaveHumanSeverityAssessmentInput = {
  caseId: string;
  severity: HumanSeverity;
  rationale?: string;
};

export function saveHumanSeverityAssessment(input: SaveHumanSeverityAssessmentInput): HumanSeverityAssessment {
  const map = loadMap();
  const current = map[input.caseId] ?? getHumanSeverityAssessment(input.caseId);
  const now = nowIso();

  const next: HumanSeverityAssessment = {
    ...current,
    caseId: input.caseId,
    severity: input.severity,
    rationale: input.rationale ?? current.rationale,
    assessedBy: "USER",
    assessedAt: input.severity === "UNASSESSED" ? null : current.assessedAt ?? now,
    updatedAt: now,
    status: assessmentStatusFromSeverity(input.severity)
  };

  map[input.caseId] = next;
  writeMap(map);

  return next;
}

export function clearHumanSeverityAssessmentsForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}
