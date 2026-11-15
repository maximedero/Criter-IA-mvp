export const CANVAS_DIMENSIONS = [
  "CONTEXT",
  "EXPOSURE",
  "EVIDENCE",
  "IMPACT",
  "UNCERTAINTY",
  "SCENARIO",
  "ALTERNATIVE",
  "INTERVENTION"
] as const;

export type CanvasDimension = (typeof CANVAS_DIMENSIONS)[number];

export const CANVAS_DIMENSION_LABELS: Record<CanvasDimension, string> = {
  CONTEXT: "Contexto y señal",
  EXPOSURE: "Exposición",
  EVIDENCE: "Evidencia",
  IMPACT: "Impactos posibles",
  UNCERTAINTY: "Incertidumbres y datos faltantes",
  SCENARIO: "Escenarios",
  ALTERNATIVE: "Alternativas",
  INTERVENTION: "Intervención requerida"
};

export const EPISTEMIC_TYPES = ["FACT", "INFERENCE", "ASSUMPTION", "MISSING_INFORMATION", "HUMAN_EVALUATION"] as const;

export type EpistemicType = (typeof EPISTEMIC_TYPES)[number];

export const EPISTEMIC_TYPE_LABELS: Record<EpistemicType, string> = {
  FACT: "Hecho",
  INFERENCE: "Inferencia",
  ASSUMPTION: "Supuesto",
  MISSING_INFORMATION: "Dato faltante",
  HUMAN_EVALUATION: "Evaluación humana"
};

export const ORIGINS = ["USER", "AI"] as const;
export type CanvasItemOrigin = (typeof ORIGINS)[number];

export const VALIDATION_STATUSES = ["PENDING", "VALIDATED", "EDITED", "REJECTED"] as const;
export type CanvasItemValidationStatus = (typeof VALIDATION_STATUSES)[number];

export type CanvasItem = {
  id: string;
  caseId: string;
  dimension: CanvasDimension;
  content: string;
  epistemicType: EpistemicType;
  origin: CanvasItemOrigin;
  validationStatus: CanvasItemValidationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateCanvasItemInput = {
  caseId: string;
  dimension: CanvasDimension;
  content: string;
  epistemicType: EpistemicType;
};

export type UpdateCanvasItemInput = {
  content: string;
  epistemicType: EpistemicType;
};

export function isValidCanvasDimension(value: string): value is CanvasDimension {
  return CANVAS_DIMENSIONS.includes(value as CanvasDimension);
}

export function isValidEpistemicType(value: string): value is EpistemicType {
  return EPISTEMIC_TYPES.includes(value as EpistemicType);
}
