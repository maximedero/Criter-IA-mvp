import type { CaseStatus } from "../models/CaseStatus";
import type { CanvasItem } from "../models/CanvasItem";
import type { DecisionBrief } from "../models/DecisionBrief";
import type { HumanSeverityAssessment } from "../models/HumanSeverityAssessment";
import type { ApprovalReadiness, ApprovalCheck, ApprovalBlocker } from "../models/HumanBriefApproval";
import { evaluateMinimumCoverage } from "./coverageRules";

export type ApprovalReadinessContext = {
  caseStatus: CaseStatus;
  activeItems: CanvasItem[];
  criticalReviewComplete: boolean;
  openBlockers: number;
  severityAssessment: HumanSeverityAssessment;
  brief: DecisionBrief | null;
  stale: boolean;
};

function check(id: string, label: string, passed: boolean, reason: string): ApprovalCheck {
  return { id, label, passed, reason };
}

function blockersFromChecks(checks: ApprovalCheck[]): ApprovalBlocker[] {
  return checks
    .filter((item) => !item.passed)
    .map((item) => ({
      id: item.id,
      reason: item.reason
    }));
}

export function evaluateApprovalReadiness(context: ApprovalReadinessContext): ApprovalReadiness {
  const coverage = evaluateMinimumCoverage(context.activeItems);

  const hasSituation = context.activeItems.some((item) => item.dimension === "CONTEXT" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));
  const hasExposure = context.activeItems.some((item) => item.dimension === "EXPOSURE" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));
  const hasImpact = context.activeItems.some((item) => item.dimension === "IMPACT" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));
  const hasEvidence = context.activeItems.some((item) => item.dimension === "EVIDENCE" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));
  const hasUncertainty = context.activeItems.some(
    (item) =>
      item.dimension === "UNCERTAINTY" &&
      (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED") &&
      (item.epistemicType === "MISSING_INFORMATION" ||
        (item.epistemicType === "HUMAN_EVALUATION" && item.content.trim() === "No identifico incertidumbres relevantes con la información disponible."))
  );
  const hasIntervention = context.activeItems.some((item) => item.dimension === "INTERVENTION" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));

  const briefExists = Boolean(context.brief);
  const briefReviewedByUser = Boolean(context.brief?.reviewedByUser);
  const briefStatusReviewed = context.brief?.status === "REVIEWED_BY_USER";

  const checks: ApprovalCheck[] = [
    check("A", "Situación definida", hasSituation, "Completá la situación antes de aprobar."),
    check("B", "Exposición definida", hasExposure, "Completá la exposición antes de aprobar."),
    check("C", "Impacto identificado", hasImpact, "Agregá al menos un impacto plausible."),
    check("D", "Evidencia disponible", hasEvidence, "Agregá evidencia disponible para sostener el análisis."),
    check("E", "Incertidumbres visibles", hasUncertainty, "Explicitá incertidumbres o registrá su ausencia relevante."),
    check("F", "Intervención requerida", hasIntervention, "Definí la intervención requerida antes de aprobar."),
    check("G", "Cobertura mínima", coverage.hasMinimumCoverage, "La cobertura mínima ya no está completa."),
    check("H", "Revisión crítica completada", context.criticalReviewComplete, "Completá la revisión crítica antes de aprobar."),
    check("I", "Sin bloqueos críticos", context.openBlockers === 0, "Existen bloqueos críticos abiertos."),
    check("J", "Gravedad evaluada", context.severityAssessment.severity !== "UNASSESSED", "La gravedad todavía no fue evaluada por el usuario."),
    check("K", "Evaluación realizada por el usuario", context.severityAssessment.assessedBy === "USER", "La gravedad debe haber sido evaluada por el usuario."),
    check("L", "Brief generado", briefExists, "Generá el brief antes de aprobar."),
    check("M", "Versión actual del brief", briefExists, "No hay una versión actual de brief para aprobar."),
    check("N", "Brief actualizado", !context.stale, "El análisis cambió después de generar este brief."),
    check("O", "Brief revisado por el usuario", briefReviewedByUser, "Revisá el brief antes de aprobarlo."),
    check("P", "Estado del brief revisado", briefStatusReviewed, "El brief debe estar en estado REVIEWED_BY_USER."),
    check("Q", "Estado del caso Brief borrador", context.caseStatus === "BRIEF_DRAFT", "El caso debe estar en estado Brief borrador.")
  ];

  const blockers = blockersFromChecks(checks);

  return {
    ready: blockers.length === 0,
    checks,
    blockers
  };
}
