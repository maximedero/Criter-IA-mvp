import type { CanvasItem } from "../models/CanvasItem";
import type { CriticalReview, ReviewFinding, ReviewSummary } from "../models/CriticalReview";

function isOpenFinding(status: ReviewFinding["status"]): boolean {
  return status === "OPEN";
}

export function calculateReviewSummary(findings: ReviewFinding[]): ReviewSummary {
  const openBlockers = findings.filter((finding) => finding.level === "BLOCKER" && isOpenFinding(finding.status)).length;
  const openWarnings = findings.filter((finding) => finding.level === "WARNING" && isOpenFinding(finding.status)).length;
  const resolvedFindings = findings.filter((finding) => !isOpenFinding(finding.status)).length;

  return {
    totalFindings: findings.length,
    openBlockers,
    openWarnings,
    resolvedFindings
  };
}

export function canCompleteCriticalReview(review: CriticalReview, items: CanvasItem[], hasMinimumCoverage: boolean): boolean {
  if (!hasMinimumCoverage) {
    return false;
  }

  if (review.status !== "IN_PROGRESS") {
    return false;
  }

  return review.findings.every((finding) => !(finding.level === "BLOCKER" && finding.status === "OPEN"));
}

export function canAcknowledgeAsUncertainty(finding: ReviewFinding, items: CanvasItem[]): boolean {
  if (finding.type === "UNSUPPORTED_CLAIM") {
    const relatedItems = items.filter((item) => finding.relatedItemIds.includes(item.id));
    const hasQuantitativeFact = relatedItems.some(
      (item) => item.dimension === "IMPACT" && item.epistemicType === "FACT" && /\d/.test(item.content)
    );

    if (hasQuantitativeFact) {
      return false;
    }
  }

  return true;
}
