const STORAGE_KEY = "dw.briefs";
function nowIso() {
    return new Date().toISOString();
}
function withCommunication(brief) {
    const timestamp = brief.updatedAt || nowIso();
    return {
        ...brief,
        communication: brief.communication ?? {
            email: {
                subject: "",
                body: "",
                editedByUser: false,
                updatedAt: timestamp
            },
            message: {
                body: "",
                editedByUser: false,
                updatedAt: timestamp
            }
        }
    };
}
function normalizeRecord(record) {
    return {
        ...record,
        current: record.current ? withCommunication(record.current) : null,
        history: record.history.map(withCommunication)
    };
}
function recordNeedsCommunicationMigration(record) {
    const currentNeeds = Boolean(record.current && !record.current.communication);
    const historyNeeds = record.history.some((item) => !item.communication);
    return currentNeeds || historyNeeds;
}
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
    const record = map[caseId] ?? emptyRecord();
    const normalized = normalizeRecord(record);
    if (recordNeedsCommunicationMigration(record)) {
        map[caseId] = normalized;
        writeMap(map);
    }
    return normalized;
}
export function saveCurrentBrief(caseId, brief) {
    const map = loadMap();
    const record = map[caseId] ?? emptyRecord();
    const normalizedBrief = withCommunication(brief);
    map[caseId] = {
        current: normalizedBrief,
        history: record.history.map(withCommunication),
        stale: false
    };
    writeMap(map);
    return map[caseId];
}
export function saveRegeneratedBrief(caseId, brief) {
    const map = loadMap();
    const record = map[caseId] ?? emptyRecord();
    const normalizedBrief = withCommunication(brief);
    const history = record.current
        ? [...record.history.map(withCommunication), withCommunication(record.current)]
        : record.history.map(withCommunication);
    map[caseId] = {
        current: normalizedBrief,
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
