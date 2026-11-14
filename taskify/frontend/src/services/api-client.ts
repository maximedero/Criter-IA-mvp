const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export type CaseItem = {
  id: string;
  title: string;
  informalDescription: string;
  status: string;
};

export type Statement = {
  id: string;
  dimensionType: string;
  content: string;
  validationState: string;
  epistemicType: string;
};

export type NextQuestionResponse = {
  question: string | null;
  questionCount: number;
  maxQuestionsReached: boolean;
  suggestion: string | null;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listCases(): Promise<CaseItem[]> {
  return request<CaseItem[]>("/cases");
}

export function createCase(payload: { title: string; informalDescription: string }): Promise<CaseItem> {
  return request<CaseItem>("/cases", { method: "POST", body: JSON.stringify(payload) });
}

export function listStatements(caseId: string): Promise<Statement[]> {
  return request<Statement[]>(`/cases/${caseId}/canvas/statements`);
}

export function createStatement(caseId: string, payload: { dimensionType: string; content: string; epistemicType: string; sourceType?: string }): Promise<Statement> {
  return request<Statement>(`/cases/${caseId}/canvas/statements`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getNextQuestion(caseId: string): Promise<NextQuestionResponse> {
  return request<NextQuestionResponse>(`/cases/${caseId}/ai/questions/next`, {
    method: "POST"
  });
}
