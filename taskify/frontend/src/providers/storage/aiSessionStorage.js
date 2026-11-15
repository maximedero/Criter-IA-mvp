const STORAGE_KEY = "dw.aiSessions";
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
function nowIso() {
    return new Date().toISOString();
}
function emptySession(caseId) {
    return {
        caseId,
        questionCount: 0,
        questions: [],
        lastStop: null,
        userStopped: false,
        updatedAt: nowIso()
    };
}
export function getAiQuestionSession(caseId) {
    const map = loadMap();
    return map[caseId] ?? emptySession(caseId);
}
export function saveAiQuestionSession(session) {
    const map = loadMap();
    map[session.caseId] = {
        ...session,
        updatedAt: nowIso()
    };
    writeMap(map);
}
export function setActiveQuestion(caseId, question) {
    const session = getAiQuestionSession(caseId);
    const active = session.questions.find((item) => item.status === "ACTIVE");
    if (active) {
        return;
    }
    const updated = {
        ...session,
        questionCount: session.questionCount + 1,
        questions: [...session.questions, question],
        lastStop: null
    };
    saveAiQuestionSession(updated);
}
export function findActiveQuestion(caseId) {
    const session = getAiQuestionSession(caseId);
    return session.questions.find((item) => item.status === "ACTIVE") ?? null;
}
export function updateQuestionStatus(caseId, questionId, status, resultingCanvasItemId) {
    const session = getAiQuestionSession(caseId);
    const index = session.questions.findIndex((item) => item.id === questionId);
    if (index < 0) {
        throw new Error("question not found");
    }
    const current = session.questions[index];
    const updated = {
        ...current,
        status,
        updatedAt: nowIso(),
        answeredAt: status === "ACTIVE" ? current.answeredAt : nowIso(),
        resultingCanvasItemId: resultingCanvasItemId ?? current.resultingCanvasItemId
    };
    const nextQuestions = [...session.questions];
    nextQuestions[index] = updated;
    saveAiQuestionSession({
        ...session,
        questions: nextQuestions
    });
    return updated;
}
export function setStopResult(caseId, stop) {
    const session = getAiQuestionSession(caseId);
    saveAiQuestionSession({
        ...session,
        lastStop: stop
    });
}
export function markUserStopped(caseId) {
    const session = getAiQuestionSession(caseId);
    saveAiQuestionSession({
        ...session,
        userStopped: true,
        lastStop: {
            question: null,
            shouldStop: true,
            stopReason: "USER_STOPPED",
            remainingMissingDimensions: [],
            provisionalBriefAllowed: false,
            message: "Asistencia contextual detenida por el usuario."
        }
    });
}
export function clearAiQuestionSessionsForTests() {
    localStorage.removeItem(STORAGE_KEY);
}
