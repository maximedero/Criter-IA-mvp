import type {
  AIProvider,
  AnalyzeNarrativeInput,
  AnalyzeNarrativeResult,
  DynamicQuestion,
  GenerateBriefInput,
  GenerateBriefResult,
  ReviewCaseInput,
  ReviewCaseResult,
  SuggestNextQuestionInput,
  SuggestNextQuestionResult
} from "./AIProvider";
import {
  parseAnalyzeNarrativeInput,
  parseAnalyzeNarrativeResult,
  parseGenerateBriefInput,
  parseGenerateBriefResult,
  parseReviewCaseInput,
  parseReviewCaseResult,
  parseSuggestNextQuestionInput,
  parseSuggestNextQuestionResult
} from "./aiParsing";

const DYNAMICS_NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

const DYNAMICS_SUGGESTIONS: AnalyzeNarrativeResult = {
  suggestions: [
    {
      id: "dw-ai-dynamics-1",
      dimension: "CONTEXT",
      epistemicType: "FACT",
      content: "El contrato con el proveedor venció el 31/10/2026.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato presenta explícitamente el vencimiento y su fecha."
    },
    {
      id: "dw-ai-dynamics-2",
      dimension: "CONTEXT",
      epistemicType: "FACT",
      content: "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato describe explícitamente una condición transitoria posterior al vencimiento."
    },
    {
      id: "dw-ai-dynamics-3",
      dimension: "EXPOSURE",
      epistemicType: "FACT",
      content: "Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato expresa una restricción operativa vigente."
    }
  ]
};

const DYNAMICS_QUESTIONS: Record<string, DynamicQuestion> = {
  CONTEXT: {
    id: "dw-q-context",
    targetDimension: "CONTEXT",
    question: "¿Cuál es el evento o cambio concreto que originó este análisis?",
    reason: "Necesitamos confirmar la situación base que origina el análisis.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EXPOSURE: {
    id: "dw-q-exposure",
    targetDimension: "EXPOSURE",
    question: "¿Qué sistemas, procesos, proyectos, áreas, personas o resultados podrían verse afectados?",
    reason: "Esta información permite delimitar la exposición actual.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  IMPACT: {
    id: "dw-q-impact",
    targetDimension: "IMPACT",
    question: "¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?",
    reason: "Esta información permite dimensionar el posible impacto operativo.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EVIDENCE: {
    id: "dw-q-evidence",
    targetDimension: "EVIDENCE",
    question:
      "¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?",
    reason:
      "Esto permite distinguir una consecuencia plausible de una afirmación respaldada por información disponible.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  UNCERTAINTY: {
    id: "dw-q-uncertainty",
    targetDimension: "UNCERTAINTY",
    question: "¿Qué información relevante todavía no conocés para evaluar este riesgo?",
    reason:
      "Explicitar lo desconocido evita presentar el análisis con una certeza mayor que la evidencia disponible.",
    priority: "HIGH",
    suggestedEpistemicType: "MISSING_INFORMATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  INTERVENTION: {
    id: "dw-q-intervention",
    targetDimension: "INTERVENTION",
    question:
      "¿Qué necesitás concretamente que tu superior comprenda, consulte, priorice, autorice, decida o escale?",
    reason: "Una intervención explícita convierte el análisis en un planteo accionable hacia arriba.",
    priority: "HIGH",
    suggestedEpistemicType: "HUMAN_EVALUATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  }
};

function normalizeNarrative(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export class MockAIProvider implements AIProvider {
  async analyzeNarrative(input: AnalyzeNarrativeInput): Promise<AnalyzeNarrativeResult> {
    const parsedInput = parseAnalyzeNarrativeInput(input);
    const normalized = normalizeNarrative(parsedInput.initialNarrative);

    if (normalized !== DYNAMICS_NARRATIVE) {
      return parseAnalyzeNarrativeResult({ suggestions: [] });
    }

    return parseAnalyzeNarrativeResult(DYNAMICS_SUGGESTIONS);
  }

  async suggestNextQuestion(input: SuggestNextQuestionInput): Promise<SuggestNextQuestionResult> {
    const parsed = parseSuggestNextQuestionInput(input);

    if (parsed.currentCaseStatus !== "DRAFT" && parsed.currentCaseStatus !== "IN_ANALYSIS") {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "NO_MATERIAL_QUESTION",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: false,
        message: "La asistencia contextual no está disponible en este estado."
      });
    }

    if (parsed.coverageResult.hasMinimumCoverage) {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "MINIMUM_COVERAGE_REACHED",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: false,
        message:
          "Ya existe cobertura mínima para preparar un análisis. Podés seguir agregando información o iniciar la revisión cuando lo consideres adecuado."
      });
    }

    if (parsed.questionCount >= 8) {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "ORIENTATIVE_LIMIT_REACHED",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: true,
        message: "Podemos preparar un análisis provisional. Permanecen incertidumbres o dimensiones sin completar."
      });
    }

    const normalized = normalizeNarrative(parsed.initialNarrative);
    if (normalized !== DYNAMICS_NARRATIVE) {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "NO_MATERIAL_QUESTION",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: false,
        message: "No se identificó otra pregunta material con la información disponible."
      });
    }

    const covered = new Set<(keyof typeof DYNAMICS_QUESTIONS)>(
      parsed.currentItems
        .filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
        .map((item) => item.dimension as keyof typeof DYNAMICS_QUESTIONS)
    );

    const asked = new Set<(keyof typeof DYNAMICS_QUESTIONS)>(
      parsed.previousQuestions
        .filter((question) => ["ANSWERED", "DONT_KNOW", "SKIPPED", "NOT_APPLICABLE"].includes(question.status))
        .map((question) => question.targetDimension as keyof typeof DYNAMICS_QUESTIONS)
    );

    if (!covered.has("EVIDENCE") && asked.has("EVIDENCE")) {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "EXTERNAL_RESEARCH_REQUIRED",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: false,
        message:
          "La evidencia necesaria requiere investigación o consulta externa. Registrá el faltante y retomá el análisis cuando dispongas de información."
      });
    }

    const pick = (dimension: keyof typeof DYNAMICS_QUESTIONS): DynamicQuestion | null => {
      if (covered.has(dimension)) {
        return null;
      }

      if (asked.has(dimension)) {
        return null;
      }

      return DYNAMICS_QUESTIONS[dimension];
    };

    const ordered: (keyof typeof DYNAMICS_QUESTIONS)[] = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];

    for (const dimension of ordered) {
      const next = pick(dimension);
      if (next) {
        return parseSuggestNextQuestionResult({
          question: next,
          shouldStop: false,
          stopReason: null,
          remainingMissingDimensions: parsed.coverageResult.missingDimensions,
          provisionalBriefAllowed: false,
          message: null
        });
      }
    }

    return parseSuggestNextQuestionResult({
      question: null,
      shouldStop: true,
      stopReason: "NO_MATERIAL_QUESTION",
      remainingMissingDimensions: parsed.coverageResult.missingDimensions,
      provisionalBriefAllowed: false,
      message: "No se identificó otra pregunta material con la información disponible."
    });
  }

  async reviewCase(input: ReviewCaseInput): Promise<ReviewCaseResult> {
    parseReviewCaseInput(input);
    return parseReviewCaseResult({ findings: [] });
  }

  async generateBrief(input: GenerateBriefInput): Promise<GenerateBriefResult> {
    parseGenerateBriefInput(input);
    return parseGenerateBriefResult({ executiveSummary: "", expandedSummary: "" });
  }
}
