const STORAGE_KEY = "dw.briefs";
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
function emptyRecord() {
    return {
        current: null,
        history: [],
        stale: false
    };
}
export function getBriefRecord(caseId) {
    const map = loadMap();
    return map[caseId] ?? emptyRecord();
}
export function saveCurrentBrief(caseId, brief) {
    const map = loadMap();
    const record = map[caseId] ?? emptyRecord();
    map[caseId] = {
        current: brief,
        history: record.history,
        stale: false
    };
    writeMap(map);
    return map[caseId];
}
export function saveRegeneratedBrief(caseId, brief) {
    const map = loadMap();
    const record = map[caseId] ?? emptyRecord();
    const history = record.current ? [...record.history, record.current] : record.history;
    map[caseId] = {
        current: brief,
        history,
        stale: false
    };
    writeMap(map);
    return map[caseId];
}
export function setBriefStale(caseId, stale) {
    const map = loadMap();
    const record = map[caseId] ?? emptyRecord();
    map[caseId] = {
        ...record,
        stale
    };
    writeMap(map);
    return map[caseId];
}
export function clearBriefsForTests() {
    localStorage.removeItem(STORAGE_KEY);
}
