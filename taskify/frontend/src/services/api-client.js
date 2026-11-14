const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
async function request(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
    }
    return response.json();
}
export function listCases() {
    return request("/cases");
}
export function createCase(payload) {
    return request("/cases", { method: "POST", body: JSON.stringify(payload) });
}
export function listStatements(caseId) {
    return request(`/cases/${caseId}/canvas/statements`);
}
export function createStatement(caseId, payload) {
    return request(`/cases/${caseId}/canvas/statements`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export function getNextQuestion(caseId) {
    return request(`/cases/${caseId}/ai/questions/next`, {
        method: "POST"
    });
}
