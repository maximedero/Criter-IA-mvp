const STORAGE_KEY = "dw.criticalReviews";
const REVIEW_FLAG_KEY = "dw.criticalReviewComplete";
function parseReviewMap(raw) {
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    }
    catch {
        return {};
    }
}
function parseReviewCompleteMap(raw) {
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    }
    catch {
        return {};
    }
}
function loadMap() {
    return parseReviewMap(localStorage.getItem(STORAGE_KEY));
}
function writeMap(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
function loadReviewCompleteMap() {
    return parseReviewCompleteMap(localStorage.getItem(REVIEW_FLAG_KEY));
}
function writeReviewCompleteMap(value) {
    localStorage.setItem(REVIEW_FLAG_KEY, JSON.stringify(value));
}
function nowIso() {
    return new Date().toISOString();
}
export function persistReviewResult(caseId, result) {
    const map = loadMap();
    const list = map[caseId] ?? [];
    const persisted = {
        reviewId: result.reviewId,
        caseId,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        findings: result.findings,
        summary: result.summary,
        canCompleteReview: result.canCompleteReview,
        status: "IN_PROGRESS"
    };
    map[caseId] = [...list, persisted];
    writeMap(map);
    setCriticalReviewCompleteFlag(caseId, false);
    return persisted;
}
export function saveCriticalReview(review) {
    const map = loadMap();
    const list = map[review.caseId] ?? [];
    const index = list.findIndex((item) => item.reviewId === review.reviewId);
    if (index < 0) {
        map[review.caseId] = [...list, review];
    }
    else {
        const next = [...list];
        next[index] = {
            ...review,
            updatedAt: nowIso()
        };
        map[review.caseId] = next;
    }
    writeMap(map);
}
export function listCriticalReviews(caseId) {
    const map = loadMap();
    return [...(map[caseId] ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
export function getCriticalReview(caseId) {
    const list = listCriticalReviews(caseId);
    if (list.length === 0) {
        return null;
    }
    return list[list.length - 1];
}
export function updateReview(caseId, updates) {
    const current = getCriticalReview(caseId);
    if (!current) {
        throw new Error("review not found");
    }
    const next = {
        ...current,
        ...updates,
        updatedAt: nowIso()
    };
    saveCriticalReview(next);
    if (next.status === "COMPLETED") {
        setCriticalReviewCompleteFlag(caseId, true);
    }
    return next;
}
export function updateFinding(caseId, findingId, updates) {
    const review = getCriticalReview(caseId);
    if (!review) {
        throw new Error("review not found");
    }
    const index = review.findings.findIndex((item) => item.id === findingId);
    if (index < 0) {
        throw new Error("finding not found");
    }
    const current = review.findings[index];
    const updatedFinding = {
        ...current,
        ...updates
    };
    const nextFindings = [...review.findings];
    nextFindings[index] = updatedFinding;
    const nextReview = {
        ...review,
        findings: nextFindings,
        updatedAt: nowIso()
    };
    saveCriticalReview(nextReview);
    return nextReview;
}
export function setCriticalReviewCompleteFlag(caseId, value) {
    const map = loadReviewCompleteMap();
    map[caseId] = value;
    writeReviewCompleteMap(map);
}
export function isCriticalReviewComplete(caseId) {
    const map = loadReviewCompleteMap();
    return Boolean(map[caseId]);
}
export function clearCriticalReviewsForTests() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REVIEW_FLAG_KEY);
}
