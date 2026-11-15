import type { CanvasDimension, CanvasItem } from "../models/CanvasItem";
import {
  REQUIRED_COVERAGE_DIMENSIONS,
  type CoverageDimension,
  type CoverageResult
} from "../models/CoverageResult";

const COVERAGE_DIMENSION_MAPPING: Record<CoverageDimension, CanvasDimension> = {
  SITUATION: "CONTEXT",
  EXPOSURE: "EXPOSURE",
  IMPACT: "IMPACT",
  EVIDENCE: "EVIDENCE",
  UNCERTAINTY: "UNCERTAINTY",
  INTERVENTION: "INTERVENTION"
};

function countsForCoverage(item: CanvasItem): boolean {
  return item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED";
}

export function evaluateMinimumCoverage(items: CanvasItem[]): CoverageResult {
  const coveredDimensions = REQUIRED_COVERAGE_DIMENSIONS.filter((coverageDimension) => {
    const targetDimension = COVERAGE_DIMENSION_MAPPING[coverageDimension];

    return items.some((item) => item.dimension === targetDimension && countsForCoverage(item));
  });

  const missingDimensions = REQUIRED_COVERAGE_DIMENSIONS.filter(
    (coverageDimension) => !coveredDimensions.includes(coverageDimension)
  );

  return {
    coveredDimensions,
    missingDimensions,
    coveredCount: coveredDimensions.length,
    requiredCount: 6,
    hasMinimumCoverage: missingDimensions.length === 0
  };
}
