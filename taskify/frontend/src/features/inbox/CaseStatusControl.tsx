import type { CanvasItem } from "../../domain/models/CanvasItem";
import { CASE_STATUS_LABELS, type CaseStatus, type HumanSeverity } from "../../domain/models/CaseStatus";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { canTransition } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToHumanEvaluation } from "../../domain/workflow/humanSeverityWorkflow";

type Props = {
  status: CaseStatus;
  items: CanvasItem[];
  criticalReviewComplete: boolean;
  openBlockers: number;
  humanSeverity: HumanSeverity;
  onStatusChange: (status: CaseStatus) => void;
};

export function CaseStatusControl({
  status,
  items,
  criticalReviewComplete,
  openBlockers,
  humanSeverity,
  onStatusChange
}: Props) {
  const coverage = evaluateMinimumCoverage(items);

  if (status === "CRITICAL_REVIEW") {
    const humanEvaluationTransition = canAdvanceToHumanEvaluation({
      currentStatus: "CRITICAL_REVIEW",
      criticalReviewComplete,
      hasMinimumCoverage: coverage.hasMinimumCoverage,
      openBlockers,
      humanSeverity
    });

    return (
      <section>
        <p>
          <strong>Estado:</strong> {CASE_STATUS_LABELS[status]}
        </p>

        {humanEvaluationTransition.allowed ? (
          <>
            <p>Revisión completada. El caso puede avanzar a evaluación humana.</p>
            <button type="button" onClick={() => onStatusChange("HUMAN_EVALUATION")}>Avanzar a evaluación humana</button>
          </>
        ) : (
          <p>Revisión crítica pendiente.</p>
        )}
      </section>
    );
  }

  if (status === "BRIEF_DRAFT") {
    return (
      <section>
        <p>
          <strong>Estado:</strong> {CASE_STATUS_LABELS[status]}
        </p>
        <p>El caso está listo para preparar el brief.</p>
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
