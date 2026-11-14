export interface AiProvider {
  nextQuestion(context: { caseId: string; currentQuestionCount: number }): Promise<string | null>;
}

export class MockAiProvider implements AiProvider {
  async nextQuestion(context: { caseId: string; currentQuestionCount: number }): Promise<string> {
    return `¿Qué dato falta para reducir el riesgo en el caso ${context.caseId}?`;
  }
}
