import type { CanvasItem } from "../../domain/models/CanvasItem";
import { CASE_STATUS_LABELS, type CaseStatus } from "../../domain/models/CaseStatus";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { canTransition } from "../../domain/workflow/caseStateMachine";

type Props = {
  status: CaseStatus;
  items: CanvasItem[];
  onStatusChange: (status: CaseStatus) => void;
};

export function CaseStatusControl({ status, items, onStatusChange }: Props) {
  const coverage = evaluateMinimumCoverage(items);

  if (status === "CRITICAL_REVIEW") {
    return (
      <section>
        <p>
          <strong>Estado:</strong> {CASE_STATUS_LABELS[status]}
        </p>
        <p>Revisión crítica pendiente.</p>
      </section>
    );
  }

  if (status !== "IN_ANALYSIS") {
    return (
      <section>
        <p>
          <strong>Estado:</strong> {CASE_STATUS_LABELS[status]}
        </p>
      </section>
    );
  }

  const transition = canTransition("IN_ANALYSIS", "CRITICAL_REVIEW", {
    hasUserValidatedOrEditedItem: true,
    hasMinimumCoverage: coverage.hasMinimumCoverage,
    startCriticalReviewRequested: true,
    criticalReviewComplete: false,
    criticalBlockers: 0,
    humanSeverity: "UNASSESSED",
    briefExists: false,
    briefReviewed: false,
    humanApproved: false
  });

  return (
    <section>
      <p>
        <strong>Estado:</strong> {CASE_STATUS_LABELS[status]}
      </p>

      {coverage.hasMinimumCoverage ? (
        <button
          type="button"
          onClick={() => {
            if (transition.allowed) {
              onStatusChange("CRITICAL_REVIEW");
            }
          }}
        >
          Iniciar revisión
        </button>
      ) : (
        <>
          <p>Faltan dimensiones para cobertura mínima.</p>
          <ul>
            {coverage.missingDimensions.map((dimension) => (
              <li key={dimension}>{COVERAGE_DIMENSION_LABELS[dimension]}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
