const STORAGE_KEY = "dw.humanBriefApprovals";
function parse(raw) {
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
    return parse(localStorage.getItem(STORAGE_KEY));
}
function writeMap(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
export function getHumanBriefApproval(caseId) {
    const map = loadMap();
    return map[caseId] ?? null;
}
export function saveHumanBriefApproval(approval) {
    const map = loadMap();
    map[approval.caseId] = approval;
    writeMap(map);
    return approval;
}
export function removeHumanBriefApproval(caseId) {
    const map = loadMap();
    delete map[caseId];
    writeMap(map);
}
export function clearHumanBriefApprovalsForTests() {
    localStorage.removeItem(STORAGE_KEY);
}
