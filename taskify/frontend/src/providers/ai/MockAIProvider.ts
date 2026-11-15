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
import type { CanvasItem, EpistemicType } from "../../domain/models/CanvasItem";
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
  const normalized = normalizeNarrative(input.initialNarrative);
  if (normalized !== DYNAMICS_NARRATIVE) {
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

  return {
    id: `dw-brief-${input.caseId}-${Date.now()}`,
    caseId: input.caseId,
    version: 1,
    status: "GENERATED",
    executive: {
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
    },
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
        ...(missing.length > 0 ? ["Persisten datos faltantes que requieren validación humana."] : [])
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
      severityAssessmentRef: `${input.caseId}:${input.humanSeverityAssessment.assessedAt ?? "unknown"}`,
      criticalReviewId: input.completedCriticalReview.reviewId,
      generatedFromCanvasUpdatedAt: validItems.reduce((max, item) =>
        new Date(item.updatedAt).getTime() > new Date(max).getTime() ? item.updatedAt : max,
      validItems[0]?.updatedAt ?? nowIso()),
      generationProvider: "MockAIProvider",
      generationTimestamp: nowIso(),
      editedSections: []
    },
    generatedBy: "AI",
    reviewedByUser: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
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

  const sectionSources = {
    situation: situationItems.map((item) => item.id),
    whyItMatters: exposureItem ? [exposureItem.id] : [],
    possibleImpacts: impactItem ? [impactItem.id] : [],
    evidence: evidenceItem ? [evidenceItem.id] : [],
    uncertainties: [uncertaintyOne?.id, uncertaintyTwo?.id].filter((id): id is string => Boolean(id)),
    scenariosAndAlternatives: alternativeItem ? [alternativeItem.id] : [],
    requiredIntervention: interventionItem ? [interventionItem.id] : []
  };

  return {
    id: `dw-brief-${input.caseId}-${Date.now()}`,
    caseId: input.caseId,
    version: 1,
    status: "GENERATED",
    executive: {
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
    },
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
        ...(unresolvedWarning ? [unresolvedWarning.message] : [])
      ]
    },
    traceability: {
      sectionSources,
      severityAssessmentRef: `${input.caseId}:${input.humanSeverityAssessment.assessedAt ?? "unknown"}`,
      criticalReviewId: input.completedCriticalReview.reviewId,
      generatedFromCanvasUpdatedAt: all.reduce(
        (max, item) => (new Date(item.updatedAt).getTime() > new Date(max).getTime() ? item.updatedAt : max),
        all[0]?.updatedAt ?? nowIso()
      ),
      generationProvider: "MockAIProvider",
      generationTimestamp: nowIso(),
      editedSections: []
    },
    generatedBy: "AI",
    reviewedByUser: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    reviewedAt: null
  };
}

export class MockAIProvider implements AIProvider {
  async analyzeNarrative(input: AnalyzeNarrativeInput): Promise<AnalyzeNarrativeResult> {
    trackAIInvocation("analyzeNarrative");
    const parsedInput = parseAnalyzeNarrativeInput(input);
    const normalized = normalizeNarrative(parsedInput.initialNarrative);

    if (normalized !== DYNAMICS_NARRATIVE) {
      return parseAnalyzeNarrativeResult({ suggestions: [] });
    }

    return parseAnalyzeNarrativeResult(DYNAMICS_SUGGESTIONS);
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
