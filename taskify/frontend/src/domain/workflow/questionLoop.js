export function createPersistedQuestion(caseId, question) {
    const now = new Date().toISOString();
    return {
        ...question,
        caseId,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now
    };
}
export function canRequestNextQuestion(activeQuestion) {
    return activeQuestion === null;
}
export function buildStopResult(stopReason, coverageResult, message, provisionalBriefAllowed) {
    return {
        question: null,
        shouldStop: true,
        stopReason,
        remainingMissingDimensions: coverageResult.missingDimensions,
        provisionalBriefAllowed,
        message
    };
}
export function previousQuestionAsked(previousQuestions, targetDimension) {
    return previousQuestions.some((question) => question.targetDimension === targetDimension &&
        ["ANSWERED", "DONT_KNOW", "NOT_APPLICABLE", "SKIPPED"].includes(question.status));
}
export function allowsNotApplicable(dimension) {
    return dimension === "SCENARIO" || dimension === "ALTERNATIVE";
}
export function validateAnswerOptionAllowed(options, action) {
    if (!options.includes(action)) {
        throw new Error("answer option not allowed");
    }
}
export function mapDontKnowTemplate(targetDimension) {
    if (targetDimension === "IMPACT") {
        return "No conocemos qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual.";
    }
    if (targetDimension === "EVIDENCE") {
        return "No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones.";
    }
    if (targetDimension === "UNCERTAINTY") {
        return "No se identificó todavía qué información adicional falta para evaluar el riesgo.";
    }
    if (targetDimension === "INTERVENTION") {
        return "No está definido qué intervención se necesita del nivel superior.";
    }
    return "No contamos con información suficiente para responder esta pregunta.";
}
export function inferQuestionStatus(action) {
    if (action === "ANSWER") {
        return "ANSWERED";
    }
    if (action === "DONT_KNOW") {
        return "DONT_KNOW";
    }
    if (action === "NOT_APPLICABLE") {
        return "NOT_APPLICABLE";
    }
    return "SKIPPED";
}
export function missingCoverage(coverageResult) {
    return coverageResult.missingDimensions;
}
