import type { CanvasItem } from "../../domain/models/CanvasItem";
import {
  COVERAGE_DIMENSION_LABELS,
  REQUIRED_COVERAGE_DIMENSIONS
} from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";

type Props = {
  items: CanvasItem[];
};

export function CoveragePanel({ items }: Props) {
  const result = evaluateMinimumCoverage(items);

  return (
    <section>
      <h4>COBERTURA DEL ANÁLISIS</h4>
      <ul>
        {REQUIRED_COVERAGE_DIMENSIONS.map((dimension) => {
          const covered = result.coveredDimensions.includes(dimension);

          return (
            <li key={dimension}>
              {covered ? "✓" : "○"} {COVERAGE_DIMENSION_LABELS[dimension]}
            </li>
          );
        })}
      </ul>

      <p>
        {result.coveredCount} de {result.requiredCount} dimensiones mínimas cubiertas.
      </p>

      {result.hasMinimumCoverage ? (
        <p>Cobertura mínima alcanzada.</p>
      ) : (
        <>
          <p>Falta:</p>
          <ul>
            {result.missingDimensions.map((dimension) => (
              <li key={dimension}>{COVERAGE_DIMENSION_LABELS[dimension]}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
