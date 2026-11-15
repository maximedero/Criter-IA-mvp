export const CANVAS_DIMENSIONS = [
    "CONTEXT",
    "EXPOSURE",
    "EVIDENCE",
    "IMPACT",
    "UNCERTAINTY",
    "SCENARIO",
    "ALTERNATIVE",
    "INTERVENTION"
];
export const CANVAS_DIMENSION_LABELS = {
    CONTEXT: "Contexto y señal",
    EXPOSURE: "Exposición",
    EVIDENCE: "Evidencia",
    IMPACT: "Impactos posibles",
    UNCERTAINTY: "Incertidumbres y datos faltantes",
    SCENARIO: "Escenarios",
    ALTERNATIVE: "Alternativas",
    INTERVENTION: "Intervención requerida"
};
export const EPISTEMIC_TYPES = ["FACT", "INFERENCE", "ASSUMPTION", "MISSING_INFORMATION", "HUMAN_EVALUATION"];
export const EPISTEMIC_TYPE_LABELS = {
    FACT: "Hecho",
    INFERENCE: "Inferencia",
    ASSUMPTION: "Supuesto",
    MISSING_INFORMATION: "Dato faltante",
    HUMAN_EVALUATION: "Evaluación humana"
};
export const ORIGINS = ["USER", "AI"];
export const VALIDATION_STATUSES = ["PENDING", "VALIDATED", "EDITED", "REJECTED"];
export function isValidCanvasDimension(value) {
    return CANVAS_DIMENSIONS.includes(value);
}
export function isValidEpistemicType(value) {
    return EPISTEMIC_TYPES.includes(value);
}
