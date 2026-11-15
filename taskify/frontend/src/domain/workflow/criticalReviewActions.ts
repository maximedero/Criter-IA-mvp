import type { EpistemicType } from "../models/CanvasItem";
import type { ReviewFindingStatus } from "../models/CriticalReview";
import {
  getCriticalReview,
  updateFinding,
  updateReview,
  saveCriticalReview,
  type UpdateFindingInput
} from "../../providers/storage/criticalReviewStorage";
import { createCanvasItemWithMetadata } from "../../providers/storage/canvasStorage";
import { calculateReviewSummary, canAcknowledgeAsUncertainty, canCompleteCriticalReview } from "../rules/reviewRules";
import { evaluateMinimumCoverage } from "../rules/coverageRules";
import { listCanvasItemsByCase } from "../../providers/storage/canvasStorage";

function nowIso(): string {
  return new Date().toISOString();
}

function resolveFinding(
  caseId: string,
  findingId: string,
  status: Exclude<ReviewFindingStatus, "OPEN" | "SUPERSEDED">,
  patch?: Omit<UpdateFindingInput, "status">
): void {
  updateFinding(caseId, findingId, {
    status,
    ...patch,
    resolvedAt: nowIso()
  });

  recalculateReview(caseId);
}

export function recalculateReview(caseId: string): void {
  const review = getCriticalReview(caseId);
  if (!review) {
    return;
  }

  const items = listCanvasItemsByCase(caseId);
  const coverage = evaluateMinimumCoverage(items);
  const summary = calculateReviewSummary(review.findings);
  const nextReview = {
    ...review,
    summary,
    canCompleteReview: canCompleteCriticalReview(
      {
        ...review,
        summary
      },
      items,
      coverage.hasMinimumCoverage
    ),
    updatedAt: nowIso()
  };

  saveCriticalReview(nextReview);
}

export function markFindingResolvedByEdit(caseId: string, findingId: string): void {
  resolveFinding(caseId, findingId, "RESOLVED_BY_EDIT");
}

export function resolveFindingByClarification(caseId: string, findingId: string, clarification: string): void {
  const trimmed = clarification.trim();
  if (!trimmed) {
    throw new Error("La aclaración es obligatoria.");
  }

  resolveFinding(caseId, findingId, "RESOLVED_BY_CLARIFICATION", {
    clarification: trimmed
  });
}

export function acknowledgeFindingAsUncertainty(caseId: string, findingId: string, message: string, epistemicType: EpistemicType): void {
  const review = getCriticalReview(caseId);
  if (!review) {
    throw new Error("review not found");
  }

  const finding = review.findings.find((item) => item.id === findingId);
  if (!finding) {
    throw new Error("finding not found");
  }

  const items = listCanvasItemsByCase(caseId);
  if (!canAcknowledgeAsUncertainty(finding, items)) {
    throw new Error("Este hallazgo requiere edición humana antes de reconocer incertidumbre.");
  }

  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("La incertidumbre explícita es obligatoria.");
  }

  const created = createCanvasItemWithMetadata(
    {
      caseId,
      dimension: "UNCERTAINTY",
      epistemicType,
      content: trimmed
    },
    {
      origin: "USER",
      validationStatus: "VALIDATED"
    }
  );

  resolveFinding(caseId, findingId, "ACKNOWLEDGED_AS_UNCERTAINTY", {
    resultingCanvasItemId: created.id
  });
}

export function dismissFinding(caseId: string, findingId: string, reason: string): void {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("La razón de descarte es obligatoria.");
  }

  resolveFinding(caseId, findingId, "DISMISSED_BY_USER", {
    dismissReason: trimmed
  });
}

export function completeCriticalReview(caseId: string): void {
  const review = getCriticalReview(caseId);
  if (!review) {
    throw new Error("review not found");
  }

  const items = listCanvasItemsByCase(caseId);
  const coverage = evaluateMinimumCoverage(items);
  const summary = calculateReviewSummary(review.findings);

  if (!canCompleteCriticalReview({ ...review, summary }, items, coverage.hasMinimumCoverage)) {
    throw new Error("No podés completar la revisión mientras existan bloqueos críticos abiertos.");
  }

  updateReview(caseId, {
    status: "COMPLETED",
    completedAt: nowIso(),
    canCompleteReview: true,
    summary
  });
}
