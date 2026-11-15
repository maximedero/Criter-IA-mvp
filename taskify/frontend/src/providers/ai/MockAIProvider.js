import { parseAnalyzeNarrativeInput, parseAnalyzeNarrativeResult, parseGenerateBriefInput, parseGenerateBriefResult, parseReviewCaseInput, parseReviewCaseResult, parseSuggestNextQuestionInput, parseSuggestNextQuestionResult } from "./aiParsing";
const DYNAMICS_NARRATIVE = "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";
const DYNAMICS_SUGGESTIONS = {
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
const DYNAMICS_QUESTIONS = {
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
        question: "¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?",
        reason: "Esto permite distinguir una consecuencia plausible de una afirmación respaldada por información disponible.",
        priority: "HIGH",
        suggestedEpistemicType: "FACT",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    },
    UNCERTAINTY: {
        id: "dw-q-uncertainty",
        targetDimension: "UNCERTAINTY",
        question: "¿Qué información relevante todavía no conocés para evaluar este riesgo?",
        reason: "Explicitar lo desconocido evita presentar el análisis con una certeza mayor que la evidencia disponible.",
        priority: "HIGH",
        suggestedEpistemicType: "MISSING_INFORMATION",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    },
    INTERVENTION: {
        id: "dw-q-intervention",
        targetDimension: "INTERVENTION",
        question: "¿Qué necesitás concretamente que tu superior comprenda, consulte, priorice, autorice, decida o escale?",
        reason: "Una intervención explícita convierte el análisis en un planteo accionable hacia arriba.",
        priority: "HIGH",
        suggestedEpistemicType: "HUMAN_EVALUATION",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    }
};
function normalizeNarrative(value) {
    return value.trim().replace(/\s+/g, " ");
}
function isDynamicsReviewFixture(input) {
    const normalized = normalizeNarrative(input.initialNarrative);
    if (normalized !== DYNAMICS_NARRATIVE) {
        return false;
    }
    if (input.currentCaseStatus !== "CRITICAL_REVIEW") {
        return false;
    }
    return true;
}
function findItemIdByContent(items, content) {
    const found = items.find((item) => item.content.trim() === content.trim() && item.validationStatus !== "REJECTED");
    return found?.id ?? null;
}
function hasStrongIntervention(items) {
    return items.some((item) => item.dimension === "INTERVENTION" &&
        (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED") &&
        /consulte|decida|priorice|autorice|escale/i.test(item.content));
}
function buildDynamicsFindings(input) {
    const findings = [];
    const contextExpiryId = findItemIdByContent(input.currentItems, "El contrato con el proveedor venció el 31/10/2026.");
    const contextContinuityId = findItemIdByContent(input.currentItems, "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.");
    if (contextExpiryId && contextContinuityId) {
        findings.push({
            id: "dw-review-dyn-1",
            type: "POTENTIAL_CONTRADICTION",
            level: "WARNING",
            title: "Vencimiento y continuidad requieren aclaración",
            message: "El caso registra un vencimiento contractual y, al mismo tiempo, continuidad del proveedor durante el proyecto actual. Aclarar si se trata de un vencimiento formal con una continuidad transitoria.",
            relatedItemIds: [contextExpiryId, contextContinuityId],
            rationale: "La coexistencia de ambas afirmaciones requiere precisión contextual para evitar ambigüedad en el brief.",
            suggestedHumanAction: "Aclarar la relación entre ambas afirmaciones sin eliminar ninguna automáticamente.",
            status: "OPEN"
        });
    }
    const impact200Id = findItemIdByContent(input.currentItems, "200 usuarios quedarán sin servicio.");
    const hasRelatedEvidence = input.currentItems.some((item) => item.dimension === "EVIDENCE" &&
        (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED") &&
        /(200|usuarios|sin servicio)/i.test(item.content));
    if (impact200Id && !hasRelatedEvidence) {
        findings.push({
            id: "dw-review-dyn-2",
            type: "UNSUPPORTED_CLAIM",
            level: "BLOCKER",
            title: "Impacto cuantitativo sin sustento suficiente",
            message: "La afirmación de que 200 usuarios quedarán sin servicio es material para el análisis y no tiene evidencia relacionada suficiente en el caso.",
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
            message: "La prórroga aparece como una alternativa posible, pero su viabilidad todavía no está confirmada.",
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
            suggestedHumanAction: "Definir si se necesita una consulta, decisión, priorización, autorización, recurso o escalamiento.",
            status: "OPEN"
        });
    }
    return findings;
}
export class MockAIProvider {
    async analyzeNarrative(input) {
        const parsedInput = parseAnalyzeNarrativeInput(input);
        const normalized = normalizeNarrative(parsedInput.initialNarrative);
        if (normalized !== DYNAMICS_NARRATIVE) {
            return parseAnalyzeNarrativeResult({ suggestions: [] });
        }
        return parseAnalyzeNarrativeResult(DYNAMICS_SUGGESTIONS);
    }
    async suggestNextQuestion(input) {
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
                message: "Ya existe cobertura mínima para preparar un análisis. Podés seguir agregando información o iniciar la revisión cuando lo consideres adecuado."
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
        const covered = new Set(parsed.currentItems
            .filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
            .map((item) => item.dimension));
        const asked = new Set(parsed.previousQuestions
            .filter((question) => ["ANSWERED", "DONT_KNOW", "SKIPPED", "NOT_APPLICABLE"].includes(question.status))
            .map((question) => question.targetDimension));
        if (!covered.has("EVIDENCE") && asked.has("EVIDENCE")) {
            return parseSuggestNextQuestionResult({
                question: null,
                shouldStop: true,
                stopReason: "EXTERNAL_RESEARCH_REQUIRED",
                remainingMissingDimensions: parsed.coverageResult.missingDimensions,
                provisionalBriefAllowed: false,
                message: "La evidencia necesaria requiere investigación o consulta externa. Registrá el faltante y retomá el análisis cuando dispongas de información."
            });
        }
        const pick = (dimension) => {
            if (covered.has(dimension)) {
                return null;
            }
            if (asked.has(dimension)) {
                return null;
            }
            return DYNAMICS_QUESTIONS[dimension];
        };
        const ordered = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
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
    async reviewCase(input) {
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
    async generateBrief(input) {
        parseGenerateBriefInput(input);
        return parseGenerateBriefResult({ executiveSummary: "", expandedSummary: "" });
    }
}
