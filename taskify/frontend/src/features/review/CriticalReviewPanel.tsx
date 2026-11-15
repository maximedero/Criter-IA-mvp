import { useState } from "react";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import {
  acknowledgeFindingAsUncertainty,
  completeCriticalReview,
  dismissFinding,
  markFindingResolvedByEdit,
  resolveFindingByClarification
} from "../../domain/workflow/criticalReviewActions";
import type { CanvasItem, EpistemicType } from "../../domain/models/CanvasItem";
import type { AIProvider } from "../../providers/ai";
import { parseReviewCaseResult } from "../../providers/ai";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import {
  getCriticalReview,
  isCriticalReviewComplete,
  persistReviewResult,
  setCriticalReviewCompleteFlag
} from "../../providers/storage/criticalReviewStorage";
import { calculateReviewSummary, canAcknowledgeAsUncertainty, canCompleteCriticalReview } from "../../domain/rules/reviewRules";
import type { CaseStatus } from "../../domain/models/CaseStatus";

type Props = {
  caseId: string;
  initialNarrative: string;
  caseStatus: CaseStatus;
  items: CanvasItem[];
  provider: AIProvider;
  onItemsUpdated: () => void;
};

function findingLevelLabel(level: "BLOCKER" | "WARNING"): string {
  return level === "BLOCKER" ? "BLOQUEO CRÍTICO" : "ADVERTENCIA";
}

function statusText(status: string): string {
  switch (status) {
    case "OPEN":
      return "Abierto";
    case "RESOLVED_BY_EDIT":
      return "Resuelto por edición";
    case "RESOLVED_BY_CLARIFICATION":
      return "Resuelto por aclaración";
    case "ACKNOWLEDGED_AS_UNCERTAINTY":
      return "Reconocido como incertidumbre";
    case "DISMISSED_BY_USER":
      return "Descartado por la persona usuaria";
    case "SUPERSEDED":
      return "Obsoleto";
    default:
      return status;
  }
}

function coverageLockMessage(hasMinimumCoverage: boolean): string | null {
  return hasMinimumCoverage ? null : "La cobertura mínima dejó de cumplirse después de los cambios.";
}

export function CriticalReviewPanel({ caseId, initialNarrative, caseStatus, items, provider, onItemsUpdated }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [clarificationInput, setClarificationInput] = useState<Record<string, string>>({});
  const [dismissInput, setDismissInput] = useState<Record<string, string>>({});
  const [acknowledgeInput, setAcknowledgeInput] = useState<Record<string, string>>({});
  const [pendingEditedResolution, setPendingEditedResolution] = useState<string | null>(null);

  if (caseStatus !== "CRITICAL_REVIEW") {
    return null;
  }

  const coverage = evaluateMinimumCoverage(items);
  const existingReview = getCriticalReview(caseId);
  const summary = existingReview ? calculateReviewSummary(existingReview.findings) : null;
  const canComplete = existingReview
    ? canCompleteCriticalReview({ ...existingReview, summary: summary ?? existingReview.summary }, items, coverage.hasMinimumCoverage)
    : false;

  const executeReview = async () => {
    setError(null);
    setMessage(null);

    if (caseStatus !== "CRITICAL_REVIEW") {
      setError("La revisión crítica sólo está disponible en estado Revisión crítica.");
      return;
    }

    if (!coverage.hasMinimumCoverage) {
      setError("No se puede ejecutar la revisión crítica sin cobertura mínima 6/6.");
      return;
    }

    try {
      const session = getAiQuestionSession(caseId);
      const result = await provider.reviewCase({
        caseId,
        initialNarrative,
        currentItems: items.filter((item) => item.validationStatus !== "REJECTED"),
        rejectedAiItems: items.filter((item) => item.origin === "AI" && item.validationStatus === "REJECTED"),
        coverageResult: coverage,
        contextualQuestionHistory: session.questions,
        currentCaseStatus: caseStatus
      });

      const parsed = parseReviewCaseResult(result);
      persistReviewResult(caseId, {
        ...parsed,
        summary: calculateReviewSummary(parsed.findings),
        canCompleteReview: parsed.findings.every((item) => !(item.level === "BLOCKER" && item.status === "OPEN"))
      });

      setCriticalReviewCompleteFlag(caseId, false);
      setMessage(parsed.findings.length === 0 ? "No se identificaron hallazgos en esta revisión." : "Revisión crítica generada.");
      onItemsUpdated();
    } catch {
      setError("No se pudo ejecutar la revisión crítica.");
    }
  };

  const review = getCriticalReview(caseId);

  return (
    <section aria-label="Revisión crítica">
      <h4>REVISIÓN CRÍTICA</h4>

      <button type="button" onClick={executeReview}>
        {review ? "Volver a revisar" : "Ejecutar revisión crítica"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}

      {review ? (
        <>
          <p>Resumen:</p>
          <ul>
            <li>{summary?.openBlockers ?? 0} bloqueos abiertos</li>
            <li>{summary?.openWarnings ?? 0} advertencias abiertas</li>
            <li>{summary?.resolvedFindings ?? 0} hallazgos resueltos</li>
          </ul>

          {review.findings.map((finding) => {
            const related = items.filter((item) => finding.relatedItemIds.includes(item.id));
            const allowAcknowledge = canAcknowledgeAsUncertainty(finding, items);
            const clarification = clarificationInput[finding.id] ?? "";
            const dismissReason = dismissInput[finding.id] ?? "";
            const acknowledgeText = acknowledgeInput[finding.id] ?? "";

            return (
              <article key={finding.id}>
                <h5>{findingLevelLabel(finding.level)}</h5>
                <p>
                  <strong>{finding.title}</strong>
                </p>
                <p>{finding.message}</p>
                <p>
                  <strong>Acción sugerida:</strong> {finding.suggestedHumanAction}
                </p>
                <p>
                  <strong>Estado:</strong> {statusText(finding.status)}
                </p>

                <p>Relacionado con:</p>
                {related.length > 0 ? (
                  <ul>
                    {related.map((item) => (
                      <li key={item.id}>{item.content}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Elemento relacionado modificado o eliminado.</p>
                )}

                {finding.status === "OPEN" ? (
                  <div>
                    <button type="button" onClick={() => setPendingEditedResolution(finding.id)}>
                      Editar item
                    </button>

                    {pendingEditedResolution === finding.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          markFindingResolvedByEdit(caseId, finding.id);
                          setPendingEditedResolution(null);
                          setMessage("Hallazgo marcado como resuelto por edición.");
                          onItemsUpdated();
                        }}
                      >
                        Marcar como resuelto por edición
                      </button>
                    ) : null}

                    <label>
                      Aclaración
                      <textarea
                        value={clarification}
                        onChange={(event) => {
                          setClarificationInput((prev) => ({
                            ...prev,
                            [finding.id]: event.target.value
                          }));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          resolveFindingByClarification(caseId, finding.id, clarification);
                          setClarificationInput((prev) => ({ ...prev, [finding.id]: "" }));
                          setMessage("Hallazgo resuelto por aclaración.");
                          onItemsUpdated();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "No se pudo guardar la aclaración.");
                        }
                      }}
                    >
                      Aclarar
                    </button>

                    <label>
                      Registrar incertidumbre
                      <textarea
                        value={acknowledgeText}
                        onChange={(event) => {
                          setAcknowledgeInput((prev) => ({
                            ...prev,
                            [finding.id]: event.target.value
                          }));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!allowAcknowledge}
                      onClick={() => {
                        try {
                          acknowledgeFindingAsUncertainty(caseId, finding.id, acknowledgeText, "MISSING_INFORMATION");
                          setAcknowledgeInput((prev) => ({ ...prev, [finding.id]: "" }));
                          setMessage("Hallazgo reconocido como incertidumbre.");
                          onItemsUpdated();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "No se pudo registrar la incertidumbre.");
                        }
                      }}
                    >
                      Reconocer como incertidumbre
                    </button>

                    <label>
                      Razón de descarte
                      <textarea
                        value={dismissReason}
                        onChange={(event) => {
                          setDismissInput((prev) => ({
                            ...prev,
                            [finding.id]: event.target.value
                          }));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          dismissFinding(caseId, finding.id, dismissReason);
                          setDismissInput((prev) => ({ ...prev, [finding.id]: "" }));
                          setMessage("Hallazgo descartado con justificación.");
                          onItemsUpdated();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "No se pudo descartar el hallazgo.");
                        }
                      }}
                    >
                      Descartar hallazgo
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}

          {coverageLockMessage(coverage.hasMinimumCoverage) ? <p>{coverageLockMessage(coverage.hasMinimumCoverage)}</p> : null}
          {!canComplete ? (
            <p>No podés completar la revisión mientras existan bloqueos críticos abiertos.</p>
          ) : (
            <p>Los bloqueos críticos están resueltos. Podés completar la revisión.</p>
          )}

          <button
            type="button"
            disabled={!canComplete || !coverage.hasMinimumCoverage || review.status === "COMPLETED"}
            onClick={() => {
              try {
                completeCriticalReview(caseId);
                setMessage("Revisión completada. El caso puede avanzar a evaluación humana.");
                onItemsUpdated();
              } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo completar la revisión.");
              }
            }}
          >
            Completar revisión
          </button>

          {review.status === "COMPLETED" || isCriticalReviewComplete(caseId) ? (
            <p>Revisión completada. El caso puede avanzar a evaluación humana.</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
