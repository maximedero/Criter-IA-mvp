const STORAGE_KEY = "dw.humanSeverityAssessments";
function nowIso() {
    return new Date().toISOString();
}
function assessmentStatusFromSeverity(severity) {
    return severity === "UNASSESSED" ? "UNASSESSED" : "ASSESSED";
}
function parseAssessmentMap(raw) {
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
    return parseAssessmentMap(localStorage.getItem(STORAGE_KEY));
}
function writeMap(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
export function getHumanSeverityAssessment(caseId) {
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
export function saveHumanSeverityAssessment(input) {
    const map = loadMap();
    const current = map[input.caseId] ?? getHumanSeverityAssessment(input.caseId);
    const now = nowIso();
    const next = {
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
export function clearHumanSeverityAssessmentsForTests() {
    localStorage.removeItem(STORAGE_KEY);
}
