export const REQUIRED_COVERAGE_DIMENSIONS = [
  "SITUATION",
  "EXPOSURE",
  "IMPACT",
  "EVIDENCE",
  "UNCERTAINTY",
  "INTERVENTION"
] as const;

export type CoverageDimension = (typeof REQUIRED_COVERAGE_DIMENSIONS)[number];

export type CoverageResult = {
  coveredDimensions: CoverageDimension[];
  missingDimensions: CoverageDimension[];
  coveredCount: number;
  requiredCount: 6;
  hasMinimumCoverage: boolean;
};

export const COVERAGE_DIMENSION_LABELS: Record<CoverageDimension, string> = {
  SITUATION: "Situación",
  EXPOSURE: "Exposición",
  IMPACT: "Impacto",
  EVIDENCE: "Evidencia",
  UNCERTAINTY: "Incertidumbre",
  INTERVENTION: "Intervención requerida"
};
