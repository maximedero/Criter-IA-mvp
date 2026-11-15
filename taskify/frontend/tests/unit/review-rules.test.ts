import { describe, expect, it } from "vitest";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import type { CriticalReview, ReviewFinding } from "../../src/domain/models/CriticalReview";
import { calculateReviewSummary, canAcknowledgeAsUncertainty, canCompleteCriticalReview } from "../../src/domain/rules/reviewRules";

function finding(partial: Partial<ReviewFinding>): ReviewFinding {
  return {
    id: partial.id ?? "f1",
    type: partial.type ?? "EVIDENCE_GAP",
    level: partial.level ?? "WARNING",
    title: partial.title ?? "title",
    message: partial.message ?? "message",
    relatedItemIds: partial.relatedItemIds ?? [],
    rationale: partial.rationale ?? "rationale",
    suggestedHumanAction: partial.suggestedHumanAction ?? "action",
    status: partial.status ?? "OPEN",
    clarification: partial.clarification,
    dismissReason: partial.dismissReason,
    resultingCanvasItemId: partial.resultingCanvasItemId,
    resolvedAt: partial.resolvedAt
  };
}

function item(partial: Partial<CanvasItem>): CanvasItem {
  return {
    id: partial.id ?? "i1",
    caseId: partial.caseId ?? "case-1",
    dimension: partial.dimension ?? "CONTEXT",
    content: partial.content ?? "content",
    epistemicType: partial.epistemicType ?? "FACT",
    origin: partial.origin ?? "USER",
    validationStatus: partial.validationStatus ?? "VALIDATED",
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString()
  };
}

function review(findings: ReviewFinding[]): CriticalReview {
  return {
    reviewId: "r1",
    caseId: "case-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings,
    summary: calculateReviewSummary(findings),
    canCompleteReview: false,
    status: "IN_PROGRESS"
  };
}

describe("reviewRules", () => {
  it("calculates summary counts deterministically", () => {
    const findings = [
      finding({ id: "f1", level: "BLOCKER", status: "OPEN" }),
      finding({ id: "f2", level: "WARNING", status: "OPEN" }),
      finding({ id: "f3", level: "WARNING", status: "RESOLVED_BY_EDIT" })
    ];

    const summary = calculateReviewSummary(findings);

    expect(summary.totalFindings).toBe(3);
    expect(summary.openBlockers).toBe(1);
    expect(summary.openWarnings).toBe(1);
    expect(summary.resolvedFindings).toBe(1);
  });

  it("canCompleteCriticalReview is false with blocker open", () => {
    const rv = review([finding({ level: "BLOCKER", status: "OPEN" })]);

    expect(canCompleteCriticalReview(rv, [item({})], true)).toBe(false);
  });

  it("canCompleteCriticalReview is true without blocker open", () => {
    const rv = review([finding({ level: "WARNING", status: "OPEN" })]);

    expect(canCompleteCriticalReview(rv, [item({})], true)).toBe(true);
  });

  it("warning open does not block completion", () => {
    const rv = review([
      finding({ id: "w1", level: "WARNING", status: "OPEN" }),
      finding({ id: "w2", level: "WARNING", status: "OPEN" })
    ]);

    expect(canCompleteCriticalReview(rv, [item({})], true)).toBe(true);
  });

  it("coverage below minimum blocks completion", () => {
    const rv = review([finding({ level: "WARNING", status: "OPEN" })]);

    expect(canCompleteCriticalReview(rv, [item({})], false)).toBe(false);
  });

  it("unsupported quantitative fact cannot be acknowledged as uncertainty", () => {
    const related = item({ id: "impact-1", dimension: "IMPACT", epistemicType: "FACT", content: "200 usuarios quedarán sin servicio." });

    const blocked = canAcknowledgeAsUncertainty(
      finding({
        type: "UNSUPPORTED_CLAIM",
        level: "BLOCKER",
        relatedItemIds: ["impact-1"]
      }),
      [related]
    );

    expect(blocked).toBe(false);
  });

  it("non quantitative or non fact claim can be acknowledged as uncertainty", () => {
    const related = item({ id: "impact-2", dimension: "IMPACT", epistemicType: "INFERENCE", content: "Existen usuarios potencialmente expuestos." });

    const allowed = canAcknowledgeAsUncertainty(
      finding({
        type: "UNSUPPORTED_CLAIM",
        level: "BLOCKER",
        relatedItemIds: ["impact-2"]
      }),
      [related]
    );

    expect(allowed).toBe(true);
  });
});
