import type {
  AIProvider,
  AnalyzeNarrativeInput,
  AnalyzeNarrativeResult,
  ComposedExecutiveCommunication,
  ComposeExecutiveCommunicationInput,
  DynamicQuestion,
  GenerateBriefInput,
  GenerateBriefResult,
  ReviewCaseInput,
  ReviewCaseResult,
  SuggestNextQuestionInput,
  SuggestNextQuestionResult
} from "./AIProvider";
import type { CanvasDimension, CanvasItem, EpistemicType } from "../../domain/models/CanvasItem";
import type { ExecutiveBrief } from "../../domain/models/DecisionBrief";
import type { ReviewFinding } from "../../domain/models/CriticalReview";
import { HUMAN_SEVERITY_LABELS } from "../../domain/models/HumanSeverityAssessment";
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
const DYNAMICS_NARRATIVE_SLICE9 =
  "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";
const PHASE8_DYNAMICS_NARRATIVE =
  "El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones.";
const PHASE8_SHAREPOINT_NARRATIVE =
  "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar.";
const PHASE8_PRODUCCION_NARRATIVE =
  "Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha. Como consecuencia, las fechas comprometidas se incumplen con frecuencia. Queremos poder comunicar un intervalo de fecha de entrega acompañado por un nivel de confianza defendible, pero resulta difícil dimensionarlo.";

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

const SHAREPOINT_SUGGESTIONS: AnalyzeNarrativeResult = {
  suggestions: [
    {
      id: "dw-ai-sharepoint-1",
      dimension: "CONTEXT",
      epistemicType: "FACT",
      content:
        "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint utilizados por soluciones con Nintex Workflow.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato indica explícitamente el hito de fin de soporte anunciado por Microsoft."
    },
    {
      id: "dw-ai-sharepoint-2",
      dimension: "CONTEXT",
      epistemicType: "FACT",
      content:
        "La modernización comenzó en 2023 y transitó entre alternativas tecnológicas antes de definir un destino final.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato detalla una secuencia temporal de decisiones de modernización."
    },
    {
      id: "dw-ai-sharepoint-3",
      dimension: "EXPOSURE",
      epistemicType: "FACT",
      content:
        "Persisten soluciones en SharePoint 2016 con un motor de workflow sin soporte debido a demoras del proyecto de migración.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato confirma exposición vigente por coexistencia de tecnología sin soporte."
    }
  ]
};

const SHAREPOINT_QUESTIONS: Record<string, DynamicQuestion> = {
  CONTEXT: {
    id: "dw-q-sp-context",
    targetDimension: "CONTEXT",
    question: "¿Qué evento concreto vuelve urgente revisar el riesgo de continuidad en este momento?",
    reason: "Permite precisar el disparador actual del análisis.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EXPOSURE: {
    id: "dw-q-sp-exposure",
    targetDimension: "EXPOSURE",
    question: "¿Qué soluciones continúan dependiendo de workflows de SharePoint con Nintex?",
    reason: "Ayuda a delimitar el alcance real de la exposición.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  IMPACT: {
    id: "dw-q-sp-impact",
    targetDimension: "IMPACT",
    question: "¿Qué procesos de negocio podrían interrumpirse si un workflow deja de funcionar?",
    reason: "Permite dimensionar el impacto potencial sin inventar magnitudes.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EVIDENCE: {
    id: "dw-q-sp-evidence",
    targetDimension: "EVIDENCE",
    question: "¿Qué evidencia disponible respalda el estado actual de migración y las dependencias remanentes?",
    reason: "Distingue percepción general de evidencia verificable.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  UNCERTAINTY: {
    id: "dw-q-sp-uncertainty",
    targetDimension: "UNCERTAINTY",
    question: "¿Qué información clave todavía falta para estimar la exposición de continuidad?",
    reason: "Hace visibles los vacíos de información crítica.",
    priority: "HIGH",
    suggestedEpistemicType: "MISSING_INFORMATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  INTERVENTION: {
    id: "dw-q-sp-intervention",
    targetDimension: "INTERVENTION",
    question: "¿Qué intervención concreta necesitás del nivel superior para reducir este riesgo?",
    reason: "Transforma el análisis en una solicitud accionable.",
    priority: "HIGH",
    suggestedEpistemicType: "HUMAN_EVALUATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  }
};

const PRODUCCION_SUGGESTIONS: AnalyzeNarrativeResult = {
  suggestions: [
    {
      id: "dw-ai-prod-1",
      dimension: "CONTEXT",
      epistemicType: "FACT",
      content:
        "La fabricación requiere comprometer una fecha de entrega, pero hoy no se conoce con precisión la probabilidad de cumplimiento.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato explicita la tensión entre compromiso de fecha e incertidumbre de cumplimiento."
    },
    {
      id: "dw-ai-prod-2",
      dimension: "EXPOSURE",
      epistemicType: "FACT",
      content: "Las fechas comprometidas se incumplen con frecuencia, afectando la coordinación operativa.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato declara incumplimientos frecuentes como condición actual."
    },
    {
      id: "dw-ai-prod-3",
      dimension: "INTERVENTION",
      epistemicType: "HUMAN_EVALUATION",
      content:
        "Se requiere definir cómo comunicar intervalos de entrega con un nivel de confianza defendible sin inventar probabilidades.",
      source: "INITIAL_NARRATIVE",
      rationale: "El relato explicita una necesidad de intervención sobre la forma de comunicar compromisos."
    }
  ]
};

const PRODUCCION_QUESTIONS: Record<string, DynamicQuestion> = {
  CONTEXT: {
    id: "dw-q-prod-context",
    targetDimension: "CONTEXT",
    question: "¿Qué parte del proceso de fabricación está generando hoy la mayor incertidumbre sobre fechas?",
    reason: "Permite ubicar el foco operativo del problema.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EXPOSURE: {
    id: "dw-q-prod-exposure",
    targetDimension: "EXPOSURE",
    question: "¿Qué compromisos o áreas quedan más expuestos cuando se incumple una fecha comprometida?",
    reason: "Ayuda a delimitar la exposición de negocio y coordinación.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  IMPACT: {
    id: "dw-q-prod-impact",
    targetDimension: "IMPACT",
    question: "¿Qué consecuencias operativas concretas se observan cuando no se cumple la fecha comprometida?",
    reason: "Permite describir impacto sin cuantificar probabilidades no sustentadas.",
    priority: "HIGH",
    suggestedEpistemicType: "INFERENCE",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  EVIDENCE: {
    id: "dw-q-prod-evidence",
    targetDimension: "EVIDENCE",
    question: "¿Qué información histórica o registros internos hoy existen sobre cumplimiento de fechas?",
    reason: "Identifica evidencia disponible para un análisis defendible.",
    priority: "HIGH",
    suggestedEpistemicType: "FACT",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  UNCERTAINTY: {
    id: "dw-q-prod-uncertainty",
    targetDimension: "UNCERTAINTY",
    question: "¿Qué datos cuantitativos faltan para estimar un nivel de confianza de entrega?",
    reason: "Explicita límites del análisis actual y evita inventar probabilidad.",
    priority: "HIGH",
    suggestedEpistemicType: "MISSING_INFORMATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  },
  INTERVENTION: {
    id: "dw-q-prod-intervention",
    targetDimension: "INTERVENTION",
    question: "¿Qué decisión o priorización necesitás del nivel superior para encarar este análisis de cumplimiento?",
    reason: "Convierte el análisis en pedido accionable hacia arriba.",
    priority: "HIGH",
    suggestedEpistemicType: "HUMAN_EVALUATION",
    answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
  }
};

type FixtureType = "DYNAMICS" | "SHAREPOINT" | "PRODUCCION" | "NONE";

type FixtureConfig = {
  fixtureType: FixtureType;
  suggestions: AnalyzeNarrativeResult;
  questions: Record<string, DynamicQuestion>;
};

function normalizeNarrative(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function detectFixtureType(initialNarrative: string): FixtureType {
  const normalized = normalizeNarrative(initialNarrative);
  const lowered = normalized.toLocaleLowerCase("es");

  if (normalized === DYNAMICS_NARRATIVE || normalized === DYNAMICS_NARRATIVE_SLICE9 || normalized === PHASE8_DYNAMICS_NARRATIVE) {
    return "DYNAMICS";
  }

  if (normalized === PHASE8_SHAREPOINT_NARRATIVE) {
    return "SHAREPOINT";
  }

  if (normalized === PHASE8_PRODUCCION_NARRATIVE) {
    return "PRODUCCION";
  }

  if (lowered.includes("dynamics 365") && lowered.includes("proveedor") && lowered.includes("compras")) {
    return "DYNAMICS";
  }

  if (lowered.includes("sharepoint") && lowered.includes("nintex") && lowered.includes("workflow")) {
    return "SHAREPOINT";
  }

  if (lowered.includes("producir un bien") && lowered.includes("fecha de entrega") && lowered.includes("probabilidad")) {
    return "PRODUCCION";
  }

  return "NONE";
}

function getFixtureConfig(initialNarrative: string): FixtureConfig {
  const fixtureType = detectFixtureType(initialNarrative);

  if (fixtureType === "DYNAMICS") {
    return {
      fixtureType,
      suggestions: DYNAMICS_SUGGESTIONS,
      questions: DYNAMICS_QUESTIONS
    };
  }

  if (fixtureType === "SHAREPOINT") {
    return {
      fixtureType,
      suggestions: SHAREPOINT_SUGGESTIONS,
      questions: SHAREPOINT_QUESTIONS
    };
  }

  if (fixtureType === "PRODUCCION") {
    return {
      fixtureType,
      suggestions: PRODUCCION_SUGGESTIONS,
      questions: PRODUCCION_QUESTIONS
    };
  }

  return {
    fixtureType: "NONE",
    suggestions: { suggestions: [] },
    questions: {}
  };
}

function getValidatedOrEditedDimensions(items: CanvasItem[]): Set<CanvasDimension> {
  return new Set<CanvasDimension>(
    items
      .filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
      .map((item) => item.dimension)
  );
}

function getAskedDimensions(
  previousQuestions: SuggestNextQuestionInput["previousQuestions"]
): Set<CanvasDimension> {
  return new Set<CanvasDimension>(
    previousQuestions
      .filter((question) => ["ANSWERED", "DONT_KNOW", "SKIPPED", "NOT_APPLICABLE"].includes(question.status))
      .map((question) => question.targetDimension)
  );
}

function pickNextFixtureQuestion(
  questions: Record<string, DynamicQuestion>,
  covered: Set<CanvasDimension>,
  asked: Set<CanvasDimension>
): DynamicQuestion | null {
  const ordered: CanvasDimension[] = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];

  for (const dimension of ordered) {
    if (covered.has(dimension) || asked.has(dimension)) {
      continue;
    }

    const next = questions[dimension];
    if (next) {
      return next;
    }
  }

  return null;
}

type AIObservationCounters = {
  analyzeNarrative: number;
  suggestNextQuestion: number;
  reviewCase: number;
  generateBrief: number;
};

const AI_OBSERVATION_KEY = "dw.ai.observation";

function trackAIInvocation(method: keyof AIObservationCounters): void {
  const windowTarget = (globalThis as { __DW_AI_OBSERVATION__?: AIObservationCounters }).__DW_AI_OBSERVATION__;
  if (windowTarget) {
    windowTarget[method] += 1;
  }

  try {
    const raw = localStorage.getItem(AI_OBSERVATION_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as AIObservationCounters;
    if (
      typeof parsed.analyzeNarrative !== "number" ||
      typeof parsed.suggestNextQuestion !== "number" ||
      typeof parsed.reviewCase !== "number" ||
      typeof parsed.generateBrief !== "number"
    ) {
      return;
    }

    const next: AIObservationCounters = {
      ...parsed,
      [method]: parsed[method] + 1
    };

    localStorage.setItem(AI_OBSERVATION_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

function isDynamicsReviewFixture(input: ReviewCaseInput): boolean {
  const fixtureType = detectFixtureType(input.initialNarrative);
  if (fixtureType !== "DYNAMICS") {
    return false;
  }

  if (input.currentCaseStatus !== "CRITICAL_REVIEW") {
    return false;
  }

  return true;
}

function findItemIdByContent(items: ReviewCaseInput["currentItems"], content: string): string | null {
  const found = items.find((item) => item.content.trim() === content.trim() && item.validationStatus !== "REJECTED");
  return found?.id ?? null;
}

function hasStrongIntervention(items: ReviewCaseInput["currentItems"]): boolean {
  return items.some(
    (item) =>
      item.dimension === "INTERVENTION" &&
      (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED") &&
      /consulte|decida|priorice|autorice|escale/i.test(item.content)
  );
}

function buildDynamicsFindings(input: ReviewCaseInput): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  const contextExpiryId = findItemIdByContent(input.currentItems, "El contrato con el proveedor venció el 31/10/2026.");
  const contextContinuityId = findItemIdByContent(
    input.currentItems,
    "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso."
  );

  if (contextExpiryId && contextContinuityId) {
    findings.push({
      id: "dw-review-dyn-1",
      type: "POTENTIAL_CONTRADICTION",
      level: "WARNING",
      title: "Vencimiento y continuidad requieren aclaración",
      message:
        "El caso registra un vencimiento contractual y, al mismo tiempo, continuidad del proveedor durante el proyecto actual. Aclarar si se trata de un vencimiento formal con una continuidad transitoria.",
      relatedItemIds: [contextExpiryId, contextContinuityId],
      rationale: "La coexistencia de ambas afirmaciones requiere precisión contextual para evitar ambigüedad en el brief.",
      suggestedHumanAction: "Aclarar la relación entre ambas afirmaciones sin eliminar ninguna automáticamente.",
      status: "OPEN"
    });
  }

  const impact200Id = findItemIdByContent(input.currentItems, "200 usuarios quedarán sin servicio.");
  const hasRelatedEvidence = input.currentItems.some(
    (item) =>
      item.dimension === "EVIDENCE" &&
      (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED") &&
      /(200|usuarios|sin servicio)/i.test(item.content)
  );

  if (impact200Id && !hasRelatedEvidence) {
    findings.push({
      id: "dw-review-dyn-2",
      type: "UNSUPPORTED_CLAIM",
      level: "BLOCKER",
      title: "Impacto cuantitativo sin sustento suficiente",
      message:
        "La afirmación de que 200 usuarios quedarán sin servicio es material para el análisis y no tiene evidencia relacionada suficiente en el caso.",
      relatedItemIds: [impact200Id],
      rationale: "Una cifra material sin sustento verificable puede volver engañosa la comunicación del impacto.",
      suggestedHumanAction: "Aportar evidencia, corregir la cifra o reclasificar la afirmación según corresponda.",
      status: "OPEN"
    });
  }

  const alternativeAssumptionId = findItemIdByContent(input.currentItems, "Una prórroga contractual podría ser una alternativa.");
  if (alternativeAssumptionId) {
    findings.push({
      id: "dw-review-dyn-3",
      type: "HIDDEN_ASSUMPTION",
      level: "WARNING",
      title: "Alternativa todavía no confirmada",
      message:
        "La prórroga aparece como una alternativa posible, pero su viabilidad todavía no está confirmada.",
      relatedItemIds: [alternativeAssumptionId],
      rationale: "La alternativa se presenta como supuesto válido pero requiere contraste adicional para fortalecer el análisis.",
      suggestedHumanAction: "Mantener visible el supuesto o incorporar información de Compras cuando esté disponible.",
      status: "OPEN"
    });
  }

  const weakInterventionId = findItemIdByContent(input.currentItems, "Que mi jefe vea el tema.");
  if (weakInterventionId && !hasStrongIntervention(input.currentItems)) {
    findings.push({
      id: "dw-review-dyn-4",
      type: "INTERVENTION_NOT_ACTIONABLE",
      level: "BLOCKER",
      title: "Intervención requerida poco accionable",
      message: "No está claro qué intervención concreta se necesita del nivel superior.",
      relatedItemIds: [weakInterventionId],
      rationale: "Una intervención indefinida impide convertir el análisis en pedido accionable hacia arriba.",
      suggestedHumanAction:
        "Definir si se necesita una consulta, decisión, priorización, autorización, recurso o escalamiento.",
      status: "OPEN"
    });
  }

  return findings;
}

function nowIso(): string {
  return new Date().toISOString();
}

function toExpandedItem(item: CanvasItem) {
  return {
    itemId: item.id,
    dimension: item.dimension,
    epistemicType: item.epistemicType,
    origin: item.origin,
    validationStatus: item.validationStatus,
    content: item.content
  };
}

function joinOrPlaceholder(values: string[], placeholder: string): string {
  if (values.length === 0) {
    return placeholder;
  }

  return values.join(" ");
}

function determineSectionFromItem(item: CanvasItem): "situation" | "whyItMatters" | "possibleImpacts" | "evidence" | "uncertainties" | "scenariosAndAlternatives" | "requiredIntervention" {
  if (item.dimension === "CONTEXT") {
    return "situation";
  }

  if (item.dimension === "EXPOSURE") {
    return "whyItMatters";
  }

  if (item.dimension === "IMPACT") {
    return "possibleImpacts";
  }

  if (item.dimension === "EVIDENCE") {
    return "evidence";
  }

  if (item.dimension === "UNCERTAINTY") {
    return "uncertainties";
  }

  if (item.dimension === "SCENARIO" || item.dimension === "ALTERNATIVE") {
    return "scenariosAndAlternatives";
  }

  return "requiredIntervention";
}

const EXECUTIVE_COMPOSER_PROMPT_VERSION = "v1-rcta";

export const EXECUTIVE_COMPOSER_PROMPT = `ROL
Actuá como un profesional que necesita elevar una situación a su líder de forma clara, prudente y accionable.

CONTEXTO
Recibís un análisis estructurado y validado que distingue hechos, inferencias, supuestos y datos faltantes.

TAREA
Redactá un correo ejecutivo y un mensaje breve para un líder directo.

ADAPTACIÓN
Escribí en español, con tono profesional y natural, sin headings de ficha ni lenguaje técnico interno.

GROUNDING
Usá exclusivamente información validada del input. No inventes hechos, cifras, fechas, probabilidades, fuentes ni recomendaciones.

HECHOS E INCERTIDUMBRE
Presentá hechos como hechos. Usá lenguaje prudente para inferencias y mantené visibles las incertidumbres materiales.

GRAVEDAD E INTERVENCIÓN
Conservá la gravedad humana sin recalcularla. Cerrá con la intervención humana recibida, sin ampliar el mandato.`;

function normalizeForComparison(value: string): string {
  return value.toLocaleLowerCase("es").replace(/\s+/g, " ").trim();
}

export function buildMechanicalProjectionForComparison(input: ComposeExecutiveCommunicationInput): {
  emailSubject: string;
  emailBody: string;
  messageBody: string;
} {
  const severity = HUMAN_SEVERITY_LABELS[input.humanSeverityAssessment.severity];
  const emailBody = [
    `Situación: ${input.structuredBrief.situation.content}`,
    `Por qué importa: ${input.structuredBrief.whyItMatters.content}`,
    `Impactos posibles: ${input.structuredBrief.possibleImpacts.content}`,
    `Evidencia: ${input.structuredBrief.evidence.content}`,
    `Incertidumbres: ${input.structuredBrief.uncertainties.content}`,
    `Escenarios/alternativas: ${input.structuredBrief.scenariosAndAlternatives.content}`,
    `Intervención requerida: ${input.requiredIntervention}`,
    `Gravedad: ${severity}`,
    `Resumen técnico: ${input.structuredBrief.situation.content} ${input.structuredBrief.whyItMatters.content} ${input.structuredBrief.possibleImpacts.content}`
  ].join("\n\n");

  return {
    emailSubject: `Brief ejecutivo — ${input.caseTitle}`,
    emailBody,
    messageBody: `Situación: ${input.structuredBrief.situation.content} Intervención requerida: ${input.requiredIntervention}`
  };
}

function hasMechanicalHeadings(value: string): boolean {
  return /(\n|^)(\s*)(situación|por qué importa|impactos posibles|evidencia|incertidumbres|intervención requerida)\s*:/i.test(value);
}

function countLiteralRepetitions(output: string, candidates: string[]): number {
  const normalizedOutput = normalizeForComparison(output);
  return candidates.reduce((count, candidate) => {
    const normalizedCandidate = normalizeForComparison(candidate);
    if (normalizedCandidate.length < 40) {
      return count;
    }

    return normalizedOutput.includes(normalizedCandidate) ? count + 1 : count;
  }, 0);
}

function assertNonMechanicalComposition(
  composed: ComposedExecutiveCommunication,
  composeInput: ComposeExecutiveCommunicationInput
): void {
  const output = `${composed.email.body}\n${composed.message.body}`;
  if (hasMechanicalHeadings(composed.email.body) || hasMechanicalHeadings(composed.message.body)) {
    throw new Error("EXECUTIVE_COMPOSITION_MECHANICAL_HEADING");
  }

  const candidates = [
    composeInput.structuredBrief.situation.content,
    composeInput.structuredBrief.whyItMatters.content,
    composeInput.structuredBrief.possibleImpacts.content,
    composeInput.structuredBrief.evidence.content,
    composeInput.structuredBrief.uncertainties.content,
    composeInput.structuredBrief.scenariosAndAlternatives.content
  ];

  if (countLiteralRepetitions(output, candidates) > 5) {
    throw new Error("EXECUTIVE_COMPOSITION_LITERAL_REPETITION");
  }

  if (!/(solicito|necesito|requiero|podés|puede definirse|pedido)/i.test(output)) {
    throw new Error("EXECUTIVE_COMPOSITION_MISSING_REQUEST");
  }

  const severityLabel = HUMAN_SEVERITY_LABELS[composeInput.humanSeverityAssessment.severity];
  if (!output.includes(severityLabel)) {
    throw new Error("EXECUTIVE_COMPOSITION_SEVERITY_MISMATCH");
  }
}

function buildFixtureComposedCommunication(
  composeInput: ComposeExecutiveCommunicationInput,
  fixtureType: FixtureType
): ComposedExecutiveCommunication {
  const now = nowIso();
  const severityLabel = HUMAN_SEVERITY_LABELS[composeInput.humanSeverityAssessment.severity];
  const context = joinOrPlaceholder(
    composeInput.validatedCanvasItems.filter((item) => item.dimension === "CONTEXT").map((item) => item.content),
    "No hay información suficiente sobre el contexto."
  );
  const exposure = joinOrPlaceholder(
    composeInput.validatedCanvasItems.filter((item) => item.dimension === "EXPOSURE").map((item) => item.content),
    "No hay información suficiente sobre exposición."
  );
  const impacts = joinOrPlaceholder(
    composeInput.validatedCanvasItems.filter((item) => item.dimension === "IMPACT").map((item) => item.content),
    "No hay información suficiente sobre impactos plausibles."
  );
  const uncertainties = joinOrPlaceholder(
    composeInput.validatedCanvasItems.filter((item) => item.dimension === "UNCERTAINTY").map((item) => item.content),
    "Persisten datos faltantes relevantes para definir el próximo paso."
  );

  const warnings = composeInput.openWarnings.map((item) => item.message);
  const limitations = [
    ...(warnings.length > 0 ? warnings : []),
    ...(composeInput.validatedCanvasItems.some((item) => item.epistemicType === "MISSING_INFORMATION")
      ? ["Persisten incertidumbres materiales que requieren validación adicional."]
      : [])
  ];

  if (fixtureType === "DYNAMICS") {
    return {
      email: {
        subject: `Definición de continuidad contractual para ${composeInput.caseTitle}`,
        body: [
          `Te comparto una actualización sobre ${composeInput.caseTitle}. ${context}`,
          `${exposure} En este marco, podría verse afectada la capacidad de respuesta ante nuevas necesidades, porque ${impacts}`,
          `Todavía no puede confirmarse un escenario de resolución y siguen abiertas incertidumbres materiales: ${uncertainties}`,
          `La gravedad fue evaluada por el usuario como ${severityLabel}.`,
          `Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      message: {
        body: [
          `${context} ${exposure}`,
          `Existe riesgo de limitar nuevos trabajos y todavía hay incertidumbres materiales: ${uncertainties}`,
          `Gravedad evaluada por el usuario: ${severityLabel}. Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      traceability: {
        sourceItemIds: composeInput.validatedCanvasItems.map((item) => item.id),
        severityAssessmentId: `${composeInput.caseId}:${composeInput.humanSeverityAssessment.assessedAt ?? "unknown"}`,
        criticalReviewId: composeInput.criticalReview.reviewId,
        limitations
      },
      compositionMetadata: {
        generatedBy: "AI",
        provider: "MockAIProvider",
        generatedAt: now,
        language: "es",
        promptVersion: EXECUTIVE_COMPOSER_PROMPT_VERSION
      }
    };
  }

  if (fixtureType === "SHAREPOINT") {
    return {
      email: {
        subject: `Definición de priorización para continuidad de workflows en ${composeInput.caseTitle}`,
        body: [
          `Te comparto el estado actual de ${composeInput.caseTitle}. ${context}`,
          `${exposure} Si no se consolida el plan de transición, existe riesgo de afectar continuidad operativa según ${impacts}`,
          `La evidencia disponible todavía es parcial y se mantienen incertidumbres materiales para dimensionar alcance: ${uncertainties}`,
          `La gravedad fue evaluada por el usuario como ${severityLabel}.`,
          `Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      message: {
        body: [
          `${context}`,
          `Existe riesgo de discontinuidad y aún no contamos con evidencia consolidada para cerrar incertidumbres materiales: ${uncertainties}`,
          `Gravedad evaluada por el usuario: ${severityLabel}. Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      traceability: {
        sourceItemIds: composeInput.validatedCanvasItems.map((item) => item.id),
        severityAssessmentId: `${composeInput.caseId}:${composeInput.humanSeverityAssessment.assessedAt ?? "unknown"}`,
        criticalReviewId: composeInput.criticalReview.reviewId,
        limitations
      },
      compositionMetadata: {
        generatedBy: "AI",
        provider: "MockAIProvider",
        generatedAt: now,
        language: "es",
        promptVersion: EXECUTIVE_COMPOSER_PROMPT_VERSION
      }
    };
  }

  if (fixtureType === "PRODUCCION") {
    return {
      email: {
        subject: `Intervención para análisis transversal de cumplimiento en ${composeInput.caseTitle}`,
        body: [
          `Te comparto una actualización de ${composeInput.caseTitle}. ${context}`,
          `${exposure} Esto podría sostener incumplimientos de compromisos si no se consolida un análisis transversal; por ahora, el impacto plausible es: ${impacts}`,
          `Intervienen varias áreas y todavía no existe evidencia consolidada suficiente para estimar una probabilidad defendible. Las incertidumbres materiales actuales son: ${uncertainties}`,
          `La gravedad fue evaluada por el usuario como ${severityLabel}.`,
          `Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      message: {
        body: [
          `${context}`,
          `Intervienen varias áreas y existe riesgo de nuevos incumplimientos; todavía no puede confirmarse una probabilidad defendible por falta de evidencia consolidada.`,
          `Gravedad evaluada por el usuario: ${severityLabel}. Necesito tu intervención para ${composeInput.requiredIntervention}`
        ].join("\n\n")
      },
      traceability: {
        sourceItemIds: composeInput.validatedCanvasItems.map((item) => item.id),
        severityAssessmentId: `${composeInput.caseId}:${composeInput.humanSeverityAssessment.assessedAt ?? "unknown"}`,
        criticalReviewId: composeInput.criticalReview.reviewId,
        limitations
      },
      compositionMetadata: {
        generatedBy: "AI",
        provider: "MockAIProvider",
        generatedAt: now,
        language: "es",
        promptVersion: EXECUTIVE_COMPOSER_PROMPT_VERSION
      }
    };
  }

  return {
    email: {
      subject: `Brief ejecutivo — ${composeInput.caseTitle}`,
      body: [
        `Te comparto una actualización sobre ${composeInput.caseTitle}. ${context}`,
        `${exposure} En este escenario, existe riesgo de que ${impacts}`,
        `Se mantienen incertidumbres relevantes: ${uncertainties}`,
        `La gravedad fue evaluada por el usuario como ${severityLabel}.`,
        `Necesito tu intervención para ${composeInput.requiredIntervention}`
      ].join("\n\n")
    },
    message: {
      body: `Resumen ejecutivo: ${exposure} Existe riesgo de que ${impacts}. Incertidumbre material: ${uncertainties}. Gravedad evaluada por el usuario: ${severityLabel}. Necesito tu intervención para ${composeInput.requiredIntervention}`
    },
    traceability: {
      sourceItemIds: composeInput.validatedCanvasItems.map((item) => item.id),
      severityAssessmentId: `${composeInput.caseId}:${composeInput.humanSeverityAssessment.assessedAt ?? "unknown"}`,
      criticalReviewId: composeInput.criticalReview.reviewId,
      limitations
    },
    compositionMetadata: {
      generatedBy: "AI",
      provider: "MockAIProvider",
      generatedAt: now,
      language: "es",
      promptVersion: EXECUTIVE_COMPOSER_PROMPT_VERSION
    }
  };
}

function composeExecutiveCommunication(
  composeInput: ComposeExecutiveCommunicationInput,
  fixtureType: FixtureType
): ComposedExecutiveCommunication {
  const composed = buildFixtureComposedCommunication(composeInput, fixtureType);
  assertNonMechanicalComposition(composed, composeInput);
  return composed;
}

function buildComposeInput(input: GenerateBriefInput, structuredBrief: ExecutiveBrief): ComposeExecutiveCommunicationInput {
  const interventionFromCanvas = input.activeCanvasItems.find((item) => item.dimension === "INTERVENTION")?.content;

  return {
    caseId: input.caseId,
    caseTitle: input.caseTitle,
    audience: "DIRECT_LEADER",
    validatedCanvasItems: input.activeCanvasItems,
    criticalReview: input.completedCriticalReview,
    openWarnings: input.openWarnings,
    humanSeverityAssessment: {
      ...input.humanSeverityAssessment,
      assessedBy: "USER"
    },
    structuredBrief,
    requiredIntervention: interventionFromCanvas ?? structuredBrief.requiredIntervention.content,
    language: "es"
  };
}

function buildGeneralBrief(input: GenerateBriefInput): GenerateBriefResult {
  const validItems = input.activeCanvasItems;
  const facts = validItems.filter((item) => item.epistemicType === "FACT");
  const inferences = validItems.filter((item) => item.epistemicType === "INFERENCE");
  const assumptions = validItems.filter((item) => item.epistemicType === "ASSUMPTION");
  const missing = validItems.filter((item) => item.epistemicType === "MISSING_INFORMATION");
  const humanEvaluations = validItems.filter((item) => item.epistemicType === "HUMAN_EVALUATION");
  const evidence = validItems.filter((item) => item.dimension === "EVIDENCE");

  const map: Record<string, string[]> = {
    situation: [],
    whyItMatters: [],
    possibleImpacts: [],
    evidence: [],
    uncertainties: [],
    scenariosAndAlternatives: [],
    requiredIntervention: []
  };

  for (const item of validItems) {
    map[determineSectionFromItem(item)].push(item.id);
  }

  const placeholder = "No hay información suficiente para completar esta sección.";
  const createdAt = nowIso();

  const executive: ExecutiveBrief = {
    situation: {
      content: joinOrPlaceholder(
        validItems.filter((item) => item.dimension === "CONTEXT").map((item) => item.content),
        placeholder
      ),
      sourceItemIds: map.situation,
      hasSufficientInformation: map.situation.length > 0,
      limitations: map.situation.length > 0 ? [] : [placeholder]
    },
    whyItMatters: {
      content: joinOrPlaceholder(
        validItems.filter((item) => item.dimension === "EXPOSURE").map((item) => item.content),
        placeholder
      ),
      sourceItemIds: map.whyItMatters,
      hasSufficientInformation: map.whyItMatters.length > 0,
      limitations: map.whyItMatters.length > 0 ? [] : [placeholder]
    },
    possibleImpacts: {
      content: joinOrPlaceholder(
        validItems.filter((item) => item.dimension === "IMPACT").map((item) => item.content),
        placeholder
      ),
      sourceItemIds: map.possibleImpacts,
      hasSufficientInformation: map.possibleImpacts.length > 0,
      limitations: map.possibleImpacts.length > 0 ? [] : [placeholder]
    },
    evidence: {
      content: joinOrPlaceholder(evidence.map((item) => item.content), placeholder),
      sourceItemIds: map.evidence,
      hasSufficientInformation: map.evidence.length > 0,
      limitations: map.evidence.length > 0 ? [] : [placeholder]
    },
    uncertainties: {
      content: joinOrPlaceholder(missing.map((item) => item.content), placeholder),
      sourceItemIds: map.uncertainties,
      hasSufficientInformation: map.uncertainties.length > 0,
      limitations: map.uncertainties.length > 0 ? [] : [placeholder]
    },
    scenariosAndAlternatives: {
      content:
        map.scenariosAndAlternatives.length > 0
          ? validItems
              .filter((item) => item.dimension === "SCENARIO" || item.dimension === "ALTERNATIVE")
              .map((item) => item.content)
              .join(" ")
          : "No identificados con la evidencia disponible.",
      sourceItemIds: map.scenariosAndAlternatives,
      hasSufficientInformation: map.scenariosAndAlternatives.length > 0,
      limitations: map.scenariosAndAlternatives.length > 0 ? [] : ["No se identificaron escenarios o alternativas válidas."]
    },
    severity: {
      value: input.humanSeverityAssessment.severity,
      label: HUMAN_SEVERITY_LABELS[input.humanSeverityAssessment.severity],
      rationale: input.humanSeverityAssessment.rationale ?? null,
      assessedBy: "USER",
      assessedAt: input.humanSeverityAssessment.assessedAt ?? nowIso(),
      notice: "Evaluación realizada por el usuario."
    },
    requiredIntervention: {
      content: joinOrPlaceholder(
        validItems.filter((item) => item.dimension === "INTERVENTION").map((item) => item.content),
        placeholder
      ),
      sourceItemIds: map.requiredIntervention,
      hasSufficientInformation: map.requiredIntervention.length > 0,
      limitations: map.requiredIntervention.length > 0 ? [] : [placeholder]
    }
  };

  const composeInput = buildComposeInput(input, executive);
  const composed = composeExecutiveCommunication(composeInput, detectFixtureType(input.initialNarrative));

  return {
    id: `dw-brief-${input.caseId}-${Date.now()}`,
    caseId: input.caseId,
    version: 1,
    status: "GENERATED",
    executive,
    expanded: {
      facts: facts.map(toExpandedItem),
      inferences: inferences.map((item) =>
        /podría|es posible|riesgo/i.test(item.content) ? toExpandedItem(item) : { ...toExpandedItem(item), content: `Es posible que ${item.content}` }
      ),
      assumptions: assumptions.map(toExpandedItem),
      missingInformation: missing.map(toExpandedItem),
      humanEvaluations: humanEvaluations.map(toExpandedItem),
      evidenceItems: evidence.map(toExpandedItem),
      openWarnings: input.openWarnings.map((warning) => ({
        id: warning.id,
        title: warning.title,
        message: warning.message,
        relatedItemIds: warning.relatedItemIds
      })),
      resolvedFindings: input.completedCriticalReview.findings
        .filter((finding) => finding.status !== "OPEN")
        .map((finding) => ({
          id: finding.id,
          title: finding.title,
          resolution: finding.status,
          relatedItemIds: finding.relatedItemIds
        })),
      sources: evidence.map((item) => item.content),
      generationLimitations: [
        "La IA solo consolidó contenido validado o editado por el usuario.",
        ...(missing.length > 0 ? ["Persisten datos faltantes que requieren validación humana."] : []),
        ...composed.traceability.limitations
      ]
    },
    traceability: {
      sectionSources: {
        situation: map.situation,
        whyItMatters: map.whyItMatters,
        possibleImpacts: map.possibleImpacts,
        evidence: map.evidence,
        uncertainties: map.uncertainties,
        scenariosAndAlternatives: map.scenariosAndAlternatives,
        requiredIntervention: map.requiredIntervention
      },
      severityAssessmentRef: composed.traceability.severityAssessmentId,
      criticalReviewId: composed.traceability.criticalReviewId,
      generatedFromCanvasUpdatedAt: validItems.reduce((max, item) =>
        new Date(item.updatedAt).getTime() > new Date(max).getTime() ? item.updatedAt : max,
      validItems[0]?.updatedAt ?? nowIso()),
      generationProvider: "MockAIProvider",
      generationTimestamp: composed.compositionMetadata.generatedAt,
      editedSections: []
    },
    communication: {
      email: {
        subject: composed.email.subject,
        body: composed.email.body,
        editedByUser: false,
        updatedAt: createdAt
      },
      message: {
        body: composed.message.body,
        editedByUser: false,
        updatedAt: createdAt
      }
    },
    generatedBy: "AI",
    reviewedByUser: false,
    createdAt,
    updatedAt: createdAt,
    reviewedAt: null
  };
}

function hasDynamicsSignature(input: GenerateBriefInput): boolean {
  const normalized = normalizeNarrative(input.initialNarrative);
  if (normalized !== DYNAMICS_NARRATIVE && normalized !== DYNAMICS_NARRATIVE_SLICE9) {
    return false;
  }

  const requiredSnippets = [
    "El contrato con el proveedor venció el 31/10/2026.",
    "El proveedor continúa únicamente hasta finalizar el proyecto actual.",
    "Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
    "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.",
    "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.",
    "No conocemos cuándo termina exactamente el proyecto actual.",
    "No conocemos la demanda de nuevos trabajos durante los próximos meses.",
    "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.",
    "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
  ];

  return requiredSnippets.every((snippet) => input.activeCanvasItems.some((item) => item.content.trim() === snippet));
}

function pickItemsBy(
  items: CanvasItem[],
  predicate: (item: CanvasItem) => boolean
): CanvasItem[] {
  return items.filter(predicate);
}

function buildDynamicsBrief(input: GenerateBriefInput): GenerateBriefResult {
  const all = input.activeCanvasItems;
  const byContent = (content: string) => all.find((item) => item.content.trim() === content.trim()) ?? null;

  const situationItems = [
    byContent("El contrato con el proveedor venció el 31/10/2026."),
    byContent("El proveedor continúa únicamente hasta finalizar el proyecto actual.")
  ].filter((item): item is CanvasItem => Boolean(item));

  const exposureItem = byContent("Actualmente no pueden iniciarse nuevos proyectos ni tareas.");
  const impactItem =
    byContent("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.") ??
    all.find((item) => item.dimension === "IMPACT" && item.validationStatus !== "REJECTED") ??
    null;
  const evidenceItem = byContent(
    "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario."
  );
  const uncertaintyOne = byContent("No conocemos cuándo termina exactamente el proyecto actual.");
  const uncertaintyTwo = byContent("No conocemos la demanda de nuevos trabajos durante los próximos meses.");
  const alternativeItem = byContent("Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.");
  const interventionItem = byContent(
    "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
  );

  const unresolvedWarning = input.openWarnings.find((warning) => /prórroga contractual/i.test(warning.message));

  const missingLimit = "No hay información suficiente para completar esta sección.";
  const createdAt = nowIso();

  const sectionSources = {
    situation: situationItems.map((item) => item.id),
    whyItMatters: exposureItem ? [exposureItem.id] : [],
    possibleImpacts: impactItem ? [impactItem.id] : [],
    evidence: evidenceItem ? [evidenceItem.id] : [],
    uncertainties: [uncertaintyOne?.id, uncertaintyTwo?.id].filter((id): id is string => Boolean(id)),
    scenariosAndAlternatives: alternativeItem ? [alternativeItem.id] : [],
    requiredIntervention: interventionItem ? [interventionItem.id] : []
  };

  const executive: ExecutiveBrief = {
    situation: {
      content:
        situationItems.length > 0
          ? "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual."
          : missingLimit,
      sourceItemIds: sectionSources.situation,
      hasSufficientInformation: situationItems.length > 0,
      limitations: situationItems.length > 0 ? [] : [missingLimit]
    },
    whyItMatters: {
      content:
        exposureItem
          ? "Actualmente no pueden iniciarse nuevos proyectos ni tareas. Esta restricción expone la capacidad de atender nuevas necesidades sobre las soluciones."
          : missingLimit,
      sourceItemIds: sectionSources.whyItMatters,
      hasSufficientInformation: Boolean(exposureItem),
      limitations: exposureItem ? [] : [missingLimit]
    },
    possibleImpacts: {
      content: impactItem ? impactItem.content : missingLimit,
      sourceItemIds: sectionSources.possibleImpacts,
      hasSufficientInformation: Boolean(impactItem),
      limitations: impactItem ? [] : [missingLimit]
    },
    evidence: {
      content: evidenceItem
        ? "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses, según conocimiento aportado por el usuario."
        : missingLimit,
      sourceItemIds: sectionSources.evidence,
      hasSufficientInformation: Boolean(evidenceItem),
      limitations: evidenceItem ? [] : [missingLimit]
    },
    uncertainties: {
      content:
        uncertaintyOne && uncertaintyTwo
          ? "No se conoce cuándo termina exactamente el proyecto actual ni cuál será la demanda de nuevos trabajos durante los próximos meses."
          : missingLimit,
      sourceItemIds: sectionSources.uncertainties,
      hasSufficientInformation: Boolean(uncertaintyOne && uncertaintyTwo),
      limitations: uncertaintyOne && uncertaintyTwo ? [] : [missingLimit]
    },
    scenariosAndAlternatives: {
      content: alternativeItem
        ? "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada."
        : "No identificados con la evidencia disponible.",
      sourceItemIds: sectionSources.scenariosAndAlternatives,
      hasSufficientInformation: Boolean(alternativeItem),
      limitations: alternativeItem
        ? unresolvedWarning
          ? [unresolvedWarning.message]
          : []
        : ["No se identificaron escenarios o alternativas válidas."]
    },
    severity: {
      value: input.humanSeverityAssessment.severity,
      label: HUMAN_SEVERITY_LABELS[input.humanSeverityAssessment.severity],
      rationale: input.humanSeverityAssessment.rationale ?? null,
      assessedBy: "USER",
      assessedAt: input.humanSeverityAssessment.assessedAt ?? nowIso(),
      notice: "Evaluación realizada por el usuario."
    },
    requiredIntervention: {
      content: interventionItem
        ? "Se necesita que el superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
        : missingLimit,
      sourceItemIds: sectionSources.requiredIntervention,
      hasSufficientInformation: Boolean(interventionItem),
      limitations: interventionItem ? [] : [missingLimit]
    }
  };

  const composeInput = buildComposeInput(input, executive);
  const composed = composeExecutiveCommunication(composeInput, "DYNAMICS");

  return {
    id: `dw-brief-${input.caseId}-${Date.now()}`,
    caseId: input.caseId,
    version: 1,
    status: "GENERATED",
    executive,
    expanded: {
      facts: pickItemsBy(all, (item) => item.epistemicType === "FACT").map(toExpandedItem),
      inferences: pickItemsBy(all, (item) => item.epistemicType === "INFERENCE").map(toExpandedItem),
      assumptions: pickItemsBy(all, (item) => item.epistemicType === "ASSUMPTION").map(toExpandedItem),
      missingInformation: pickItemsBy(all, (item) => item.epistemicType === "MISSING_INFORMATION").map(toExpandedItem),
      humanEvaluations: pickItemsBy(all, (item) => item.epistemicType === "HUMAN_EVALUATION").map(toExpandedItem),
      evidenceItems: pickItemsBy(all, (item) => item.dimension === "EVIDENCE").map(toExpandedItem),
      openWarnings: input.openWarnings.map((warning) => ({
        id: warning.id,
        title: warning.title,
        message: warning.message,
        relatedItemIds: warning.relatedItemIds
      })),
      resolvedFindings: input.completedCriticalReview.findings
        .filter((finding) => finding.status !== "OPEN")
        .map((finding) => ({
          id: finding.id,
          title: finding.title,
          resolution: finding.status,
          relatedItemIds: finding.relatedItemIds
        })),
      sources: evidenceItem ? [evidenceItem.content] : [],
      generationLimitations: [
        "No se inventaron hechos, cifras, fechas ni fuentes fuera del canvas validado.",
        ...(unresolvedWarning ? [unresolvedWarning.message] : []),
        ...composed.traceability.limitations
      ]
    },
    traceability: {
      sectionSources,
      severityAssessmentRef: composed.traceability.severityAssessmentId,
      criticalReviewId: composed.traceability.criticalReviewId,
      generatedFromCanvasUpdatedAt: all.reduce(
        (max, item) => (new Date(item.updatedAt).getTime() > new Date(max).getTime() ? item.updatedAt : max),
        all[0]?.updatedAt ?? nowIso()
      ),
      generationProvider: "MockAIProvider",
      generationTimestamp: composed.compositionMetadata.generatedAt,
      editedSections: []
    },
    communication: {
      email: {
        subject: composed.email.subject,
        body: composed.email.body,
        editedByUser: false,
        updatedAt: createdAt
      },
      message: {
        body: composed.message.body,
        editedByUser: false,
        updatedAt: createdAt
      }
    },
    generatedBy: "AI",
    reviewedByUser: false,
    createdAt,
    updatedAt: createdAt,
    reviewedAt: null
  };
}

export class MockAIProvider implements AIProvider {
  async analyzeNarrative(input: AnalyzeNarrativeInput): Promise<AnalyzeNarrativeResult> {
    trackAIInvocation("analyzeNarrative");
    const parsedInput = parseAnalyzeNarrativeInput(input);
    const fixture = getFixtureConfig(parsedInput.initialNarrative);

    if (fixture.fixtureType === "NONE") {
      return parseAnalyzeNarrativeResult({ suggestions: [] });
    }

    return parseAnalyzeNarrativeResult(fixture.suggestions);
  }

  async suggestNextQuestion(input: SuggestNextQuestionInput): Promise<SuggestNextQuestionResult> {
    trackAIInvocation("suggestNextQuestion");
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

    const fixture = getFixtureConfig(parsed.initialNarrative);
    if (fixture.fixtureType === "NONE") {
      return parseSuggestNextQuestionResult({
        question: null,
        shouldStop: true,
        stopReason: "NO_MATERIAL_QUESTION",
        remainingMissingDimensions: parsed.coverageResult.missingDimensions,
        provisionalBriefAllowed: false,
        message: "No se identificó otra pregunta material con la información disponible."
      });
    }

    const covered = getValidatedOrEditedDimensions(parsed.currentItems);
    const asked = getAskedDimensions(parsed.previousQuestions);

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

    const next = pickNextFixtureQuestion(fixture.questions, covered, asked);
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
    trackAIInvocation("reviewCase");
    const parsed = parseReviewCaseInput(input);

    if (!isDynamicsReviewFixture(parsed)) {
      return parseReviewCaseResult({
        reviewId: `dw-review-${parsed.caseId}-none`,
        findings: [],
        summary: {
          totalFindings: 0,
          openBlockers: 0,
          openWarnings: 0,
          resolvedFindings: 0
        },
        canCompleteReview: true
      });
    }

    const findings = buildDynamicsFindings(parsed);

    return parseReviewCaseResult({
      reviewId: `dw-review-${parsed.caseId}-dynamics-v1`,
      findings,
      summary: {
        totalFindings: findings.length,
        openBlockers: findings.filter((item) => item.level === "BLOCKER").length,
        openWarnings: findings.filter((item) => item.level === "WARNING").length,
        resolvedFindings: 0
      },
      canCompleteReview: findings.every((item) => item.level !== "BLOCKER")
    });
  }

  async generateBrief(input: GenerateBriefInput): Promise<GenerateBriefResult> {
    trackAIInvocation("generateBrief");
    const parsed = parseGenerateBriefInput(input);

    const brief = hasDynamicsSignature(parsed) ? buildDynamicsBrief(parsed) : buildGeneralBrief(parsed);

    return parseGenerateBriefResult(brief);
  }
}
