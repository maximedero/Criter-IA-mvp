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

export async function listCases(): Promise<CaseItem[]> {
  return [];
}

export async function createCase(_payload: { title: string; informalDescription: string }): Promise<CaseItem> {
  throw new Error("API client is not used in Slice 1 frontend-only flow");
}

export async function listStatements(_caseId: string): Promise<Statement[]> {
  return [];
}

export async function createStatement(
  _caseId: string,
  _payload: { dimensionType: string; content: string; epistemicType: string; sourceType?: string }
): Promise<Statement> {
  throw new Error("Canvas APIs are not available in Slice 1");
}

export async function getNextQuestion(_caseId: string): Promise<NextQuestionResponse> {
  return {
    question: null,
    questionCount: 0,
    maxQuestionsReached: false,
    suggestion: null
  };
}

