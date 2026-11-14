type Evaluation = {
  caseId: string;
  scores: Record<string, number>;
  createdAt: string;
};

const evaluationStore = new Map<string, Evaluation>();

export function saveEvaluation(caseId: string, scores: Record<string, number>): Evaluation {
  const evaluation: Evaluation = { caseId, scores, createdAt: new Date().toISOString() };
  evaluationStore.set(caseId, evaluation);
  return evaluation;
}

export function getEvaluation(caseId: string): Evaluation | undefined {
  return evaluationStore.get(caseId);
}
