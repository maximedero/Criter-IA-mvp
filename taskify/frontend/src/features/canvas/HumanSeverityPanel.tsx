import { useEffect, useMemo, useState } from "react";
import type { CaseStatus, HumanSeverity } from "../../domain/models/CaseStatus";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { TRANSITION_BLOCKERS } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToBriefDraft } from "../../domain/workflow/humanSeverityWorkflow";
import {
  getHumanSeverityAssessment,
  saveHumanSeverityAssessment,
  type SaveHumanSeverityAssessmentInput
} from "../../providers/storage/humanSeverityStorage";
import type { HumanSeverityAssessment } from "../../domain/models/HumanSeverityAssessment";
import { HUMAN_SEVERITY_LABELS } from "../../domain/models/HumanSeverityAssessment";
import { Button } from "../../app/ui/Button";

type Props = {
  caseId: string;
  caseStatus: CaseStatus;
  criticalReviewComplete: boolean;
  hasMinimumCoverage: boolean;
  missingCoverageLabels: string[];
  openBlockers: number;
  openWarnings: number;
  onSaved: (assessment: HumanSeverityAssessment) => void;
  onContinueToBriefDraft: () => void;
};

const SEVERITY_OPTIONS: HumanSeverity[] = ["UNASSESSED", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function HumanSeverityPanel({
  caseId,
  caseStatus,
  criticalReviewComplete,
  hasMinimumCoverage,
  missingCoverageLabels,
  openBlockers,
  openWarnings,
  onSaved,
  onContinueToBriefDraft
}: Props) {
  const persisted = useMemo(() => getHumanSeverityAssessment(caseId), [caseId]);
  const [severity, setSeverity] = useState<HumanSeverity>(persisted.severity);
  const [savedSeverity, setSavedSeverity] = useState<HumanSeverity>(persisted.severity);
  const [rationale, setRationale] = useState(persisted.rationale ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = getHumanSeverityAssessment(caseId);
    setSeverity(current.severity);
    setSavedSeverity(current.severity);
    setRationale(current.rationale ?? "");
    setMessage(null);
    setError(null);
  }, [caseId]);

  const canEdit =
    caseStatus === "HUMAN_EVALUATION" && criticalReviewComplete && hasMinimumCoverage && openBlockers === 0;

  if (caseStatus !== "HUMAN_EVALUATION") {
    return null;
  }

  const transition = canAdvanceToBriefDraft({
    currentStatus: "HUMAN_EVALUATION",
    criticalReviewComplete,
    hasMinimumCoverage,
    openBlockers,
    humanSeverity: savedSeverity
  });

  const tryContinue = () => {
    setError(null);
    setMessage(null);

    if (!transition.allowed) {
      if (transition.blockers.includes(TRANSITION_BLOCKERS.HUMAN_SEVERITY_UNASSESSED)) {
        setError("Seleccioná una gravedad antes de continuar.");
        return;
      }

      if (!criticalReviewComplete) {
        setError("Completá la revisión crítica antes de evaluar la gravedad.");
        return;
      }

      if (!hasMinimumCoverage) {
        setError("Faltan dimensiones para cobertura mínima.");
        return;
      }

      if (openBlockers > 0) {
        setError("No podés continuar mientras existan bloqueos críticos abiertos.");
        return;
      }

      setError("No se puede continuar por reglas del workflow.");
      return;
    }

    onContinueToBriefDraft();
  };

  const save = () => {
    setError(null);
    setMessage(null);

    if (!canEdit) {
      if (!criticalReviewComplete) {
        setError("Completá la revisión crítica antes de evaluar la gravedad.");
        return;
      }

      if (!hasMinimumCoverage) {
        setError("Faltan dimensiones para cobertura mínima.");
        return;
      }

      if (openBlockers > 0) {
        setError("No podés evaluar la gravedad mientras existan bloqueos críticos abiertos.");
        return;
      }

      setError("La evaluación humana no está habilitada en este estado.");
      return;
    }

    const payload: SaveHumanSeverityAssessmentInput = {
      caseId,
      severity,
      rationale
    };

    try {
      const saved = saveHumanSeverityAssessment(payload);
      setSeverity(saved.severity);
      setSavedSeverity(saved.severity);
      setRationale(saved.rationale ?? "");
      setMessage("Evaluación guardada.");
      onSaved(saved);
    } catch {
      setError("No se pudo guardar la evaluación.");
    }
  };

  return (
    <section aria-label="Evaluación humana de gravedad">
      <h4>EVALUACIÓN HUMANA DE GRAVEDAD</h4>
      <p>Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.</p>
      <p>Evaluación realizada por el usuario.</p>

      {openWarnings > 0 ? <p>Advertencias abiertas: {openWarnings}</p> : null}

      {!criticalReviewComplete ? <p>Completá la revisión crítica antes de evaluar la gravedad.</p> : null}

      {!hasMinimumCoverage ? (
        <>
          <p>Faltan dimensiones para cobertura mínima.</p>
          <ul>
            {missingCoverageLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </>
      ) : null}

      {openBlockers > 0 ? <p>No podés evaluar la gravedad mientras existan bloqueos críticos abiertos.</p> : null}

      <p>
        <strong>Gravedad:</strong> {HUMAN_SEVERITY_LABELS[severity]}
      </p>

      {severity === "UNASSESSED" ? (
        <p>No se puede preparar el brief hasta que el usuario complete esta evaluación.</p>
      ) : null}

      <fieldset disabled={!canEdit}>
        <legend>Gravedad del riesgo</legend>

        {SEVERITY_OPTIONS.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="human-severity"
              value={option}
              checked={severity === option}
              onChange={() => setSeverity(option)}
            />
            {HUMAN_SEVERITY_LABELS[option]}
          </label>
        ))}
      </fieldset>

      <label>
        Fundamento de la evaluación (opcional)
        <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} disabled={!canEdit} />
      </label>

      <div className="dw-human-severity__actions">
        <Button type="button" onClick={save} disabled={!canEdit}>
          Guardar evaluación
        </Button>

        <Button type="button" variant="ghost" onClick={tryContinue}>
          Continuar a preparación del brief
        </Button>
      </div>

      {transition.allowed ? <p>Evaluación completa. El caso puede avanzar a preparación del brief.</p> : null}

      {error ? (
        <p className="dw-canvas-alert" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}

export function mapMissingCoverageLabels(missing: readonly (keyof typeof COVERAGE_DIMENSION_LABELS)[]): string[] {
  return missing.map((value) => COVERAGE_DIMENSION_LABELS[value]);
}
