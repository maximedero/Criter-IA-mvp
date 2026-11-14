import type { AiProvider } from "../providers/ai-provider.js";
import { MockAiProvider } from "../providers/ai-provider.js";
import { canAskMoreQuestions, getQuestionCount, getQuestionLimit, registerQuestionAsked } from "./question-service.js";

const provider: AiProvider = new MockAiProvider();

export async function getNextQuestion(caseId: string): Promise<{
  question: string | null;
  questionCount: number;
  maxQuestionsReached: boolean;
  suggestion: string | null;
}> {
  const currentCount = getQuestionCount(caseId);

  if (!canAskMoreQuestions(caseId)) {
    return {
      question: null,
      questionCount: currentCount,
      maxQuestionsReached: true,
      suggestion: "Se alcanzó el máximo de 5 preguntas. Puede generar el brief cuando lo desee."
    };
  }

  const question = await provider.nextQuestion({ caseId, currentQuestionCount: currentCount });
  const nextCount = registerQuestionAsked(caseId);

  return {
    question,
    questionCount: nextCount,
    maxQuestionsReached: nextCount >= getQuestionLimit(),
    suggestion: null
  };
}
