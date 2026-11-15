export async function listCases() {
    return [];
}
export async function createCase(_payload) {
    throw new Error("API client is not used in Slice 1 frontend-only flow");
}
export async function listStatements(_caseId) {
    return [];
}
export async function createStatement(_caseId, _payload) {
    throw new Error("Canvas APIs are not available in Slice 1");
}
export async function getNextQuestion(_caseId) {
    return {
        question: null,
        questionCount: 0,
        maxQuestionsReached: false,
        suggestion: null
    };
}
