function isOpenFinding(status) {
    return status === "OPEN";
}
export function calculateReviewSummary(findings) {
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
export function canCompleteCriticalReview(review, items, hasMinimumCoverage) {
    if (!hasMinimumCoverage) {
        return false;
    }
    if (review.status !== "IN_PROGRESS") {
        return false;
    }
    return review.findings.every((finding) => !(finding.level === "BLOCKER" && finding.status === "OPEN"));
}
export function canAcknowledgeAsUncertainty(finding, items) {
    if (finding.type === "UNSUPPORTED_CLAIM") {
        const relatedItems = items.filter((item) => finding.relatedItemIds.includes(item.id));
        const hasQuantitativeFact = relatedItems.some((item) => item.dimension === "IMPACT" && item.epistemicType === "FACT" && /\d/.test(item.content));
        if (hasQuantitativeFact) {
            return false;
        }
    }
    return true;
}
