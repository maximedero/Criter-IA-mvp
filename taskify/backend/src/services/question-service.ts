const MAX_QUESTIONS_PER_CASE = 5;

const questionCountByCase = new Map<string, number>();

export function getQuestionCount(caseId: string): number {
  return questionCountByCase.get(caseId) ?? 0;
}

export function canAskMoreQuestions(caseId: string): boolean {
  return getQuestionCount(caseId) < MAX_QUESTIONS_PER_CASE;
}

export function registerQuestionAsked(caseId: string): number {
  const next = getQuestionCount(caseId) + 1;
  questionCountByCase.set(caseId, next);
  return next;
}

export function getQuestionLimit(): number {
  return MAX_QUESTIONS_PER_CASE;
}
