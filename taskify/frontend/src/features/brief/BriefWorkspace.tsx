import { useEffect, useMemo, useState } from "react";
import type { CanvasItem } from "../../domain/models/CanvasItem";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
import type { CaseStatus } from "../../domain/models/CaseStatus";
import type { DecisionCase } from "../../domain/models/DecisionCase";
import { HUMAN_SEVERITY_LABELS, type HumanSeverityAssessment } from "../../domain/models/HumanSeverityAssessment";
import type { PersistedQuestion } from "../../domain/models/ContextualQuestion";
import type { CriticalReview } from "../../domain/models/CriticalReview";
import type { AIProvider } from "../../providers/ai";
import { parseGenerateBriefResult } from "../../providers/ai/aiParsing";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import { getBriefRecord, saveCurrentBrief, saveRegeneratedBrief, setBriefStale } from "../../providers/storage/briefStorage";
import {
  BRIEF_GATE_ERRORS,
  calculateBriefStale,
  canMarkBriefAsReviewed,
  createBriefGenerationInput,
  ensureHumanSeverityCopied,
  evaluateBriefGenerationGate,
  getLatestCanvasUpdatedAt,
  markBriefAsReviewed,
  normalizeGeneratedBriefForPersist,
  updateSectionAsEdited
} from "../../domain/workflow/briefWorkflow";
import type { DecisionBrief, ExecutiveSectionKey } from "../../domain/models/DecisionBrief";

type Props = {
  decisionCase: DecisionCase;
  items: CanvasItem[];
  hasMinimumCoverage: boolean;
  criticalReviewComplete: boolean;
  review: CriticalReview | null;
  openBlockers: number;
  openWarnings: number;
  severityAssessment: HumanSeverityAssessment;
  provider: AIProvider;
  onBriefSaved: () => void;
  onError: (message: string | null) => void;
};

const EDITABLE_SECTIONS: Array<{ key: ExecutiveSectionKey; label: string }> = [
  { key: "situation", label: "Situación" },
  { key: "whyItMatters", label: "Por qué importa" },
  { key: "possibleImpacts", label: "Impactos posibles" },
  { key: "evidence", label: "Evidencia" },
  { key: "uncertainties", label: "Incertidumbres" },
  { key: "scenariosAndAlternatives", label: "Escenarios / alternativas" },
  { key: "requiredIntervention", label: "Intervención requerida" }
];

function formatSectionLabel(key: ExecutiveSectionKey): string {
  const found = EDITABLE_SECTIONS.find((item) => item.key === key);
  return found?.label ?? key;
}

export function BriefWorkspace({
  decisionCase,
  items,
  hasMinimumCoverage,
  criticalReviewComplete,
  review,
  openBlockers,
  openWarnings,
  severityAssessment,
  provider,
  onBriefSaved,
  onError
}: Props) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"executive" | "expanded">("executive");
  const [editingSection, setEditingSection] = useState<ExecutiveSectionKey | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [hasViewedExecutive, setHasViewedExecutive] = useState(false);
  const [record, setRecord] = useState(() => getBriefRecord(decisionCase.id));

  const activeItems = useMemo(() => items.filter((item) => item.validationStatus !== "REJECTED"), [items]);

  useEffect(() => {
    const persisted = getBriefRecord(decisionCase.id);
    const staleComputed = calculateBriefStale(persisted.current, activeItems);

    if (persisted.stale !== staleComputed) {
      const next = setBriefStale(decisionCase.id, staleComputed);
      setRecord(next);
    } else {
      setRecord(persisted);
    }
  }, [decisionCase.id, activeItems]);

  useEffect(() => {
    if (view === "executive") {
      setHasViewedExecutive(true);
    }
  }, [view]);

  const gate = evaluateBriefGenerationGate({
    caseStatus: decisionCase.status,
    hasMinimumCoverage,
    criticalReviewComplete,
    openBlockers,
    humanSeverity: severityAssessment.severity,
    criticalReview: review
  });

  const brief = record.current;
  const reviewGate = canMarkBriefAsReviewed({
    brief,
    hasViewedExecutive,
    stale: record.stale,
    hasMinimumCoverage,
    openBlockers,
    humanSeverity: severityAssessment.severity,
    generationError: false
  });

  const contextualQuestionHistory: PersistedQuestion[] = getAiQuestionSession(decisionCase.id).questions;

  const generate = async (regenerate: boolean) => {
    onError(null);

    if (!gate.allowed || !review) {
      onError(gate.reasons[0] ?? BRIEF_GATE_ERRORS.CRITICAL_REVIEW_NOT_FOUND);
      return;
    }

    if (regenerate) {
      const confirmed = window.confirm("Se reemplazará el borrador actual por una nueva versión. ¿Deseás continuar?");
      if (!confirmed) {
        return;
      }
    }

    setLoading(true);

    try {
      const input = createBriefGenerationInput({
        caseId: decisionCase.id,
        caseTitle: decisionCase.title,
        initialNarrative: decisionCase.initialNarrative,
        activeItems,
        humanSeverityAssessment: severityAssessment,
        completedCriticalReview: review,
        contextualQuestionHistory,
        currentCaseStatus: decisionCase.status
      });

      const result = await provider.generateBrief(input);
      const parsed = parseGenerateBriefResult(result);

      const latestCanvasUpdatedAt = getLatestCanvasUpdatedAt(input.activeCanvasItems);
      const normalized = normalizeGeneratedBriefForPersist(
        ensureHumanSeverityCopied(parsed, severityAssessment),
        (record.current?.version ?? 0) + 1,
        {
          criticalReviewId: review.reviewId,
          severityAssessmentRef: `${decisionCase.id}:${severityAssessment.assessedAt ?? "unknown"}`,
          generatedFromCanvasUpdatedAt: latestCanvasUpdatedAt,
          generationProvider: "MockAIProvider"
        }
      );

      const refreshedGate = evaluateBriefGenerationGate({
        caseStatus: decisionCase.status,
        hasMinimumCoverage,
        criticalReviewComplete,
        openBlockers,
        humanSeverity: severityAssessment.severity,
        criticalReview: review
      });

      if (!refreshedGate.allowed) {
        onError(refreshedGate.reasons[0] ?? BRIEF_GATE_ERRORS.INVALID_BRIEF_OUTPUT);
        return;
      }

      const nextRecord = regenerate ? saveRegeneratedBrief(decisionCase.id, normalized) : saveCurrentBrief(decisionCase.id, normalized);
      setRecord(nextRecord);
      onBriefSaved();
    } catch (error) {
      if (error instanceof Error && /storage|guardar|quota/i.test(error.message)) {
        onError("No se pudo guardar el brief.");
      } else {
        onError("No se pudo generar el borrador del brief.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = () => {
    if (!brief || !editingSection) {
      return;
    }

    const updated = updateSectionAsEdited(brief, editingSection, editingValue);
    const next = saveCurrentBrief(decisionCase.id, updated);
    setRecord(next);
    setEditingSection(null);
    setEditingValue("");
    onBriefSaved();
  };

  const markReviewed = () => {
    if (!brief) {
      return;
    }

    if (!reviewGate.allowed) {
      onError(reviewGate.reasons[0] ?? BRIEF_GATE_ERRORS.MISSING_REQUIRED_SECTIONS);
      return;
    }

    if (!window.confirm("Confirmás que revisaste el contenido del brief.")) {
      return;
    }

    const reviewed = markBriefAsReviewed(brief);
    const next = saveCurrentBrief(decisionCase.id, reviewed);
    setRecord(next);
    onBriefSaved();
  };

  return (
    <section aria-label="Preparación del brief">
      <h4>PREPARACIÓN DEL BRIEF</h4>
      <p>
        La IA puede preparar un borrador utilizando únicamente información validada o editada por el usuario. El resultado debe ser
        revisado antes de elevarlo.
      </p>

      {!gate.allowed ? <p role="alert">{gate.reasons[0]}</p> : null}

      <button type="button" disabled={loading || !gate.allowed} onClick={() => generate(false)}>
        Generar borrador de brief
      </button>

      {loading ? <p>Generando borrador...</p> : null}

      {brief ? (
        <>
          {record.stale ? (
            <>
              <p role="alert">El análisis cambió después de generar este brief.</p>
              <button type="button" disabled={loading || !gate.allowed} onClick={() => generate(true)}>
                Regenerar borrador
              </button>
            </>
          ) : null}

          <div role="tablist" aria-label="Vistas del brief">
            <button type="button" role="tab" aria-selected={view === "executive"} onClick={() => setView("executive")}>
              Brief ejecutivo
            </button>
            <button type="button" role="tab" aria-selected={view === "expanded"} onClick={() => setView("expanded")}>
              Vista expandida
            </button>
          </div>

          {view === "executive" ? (
            <section>
              {EDITABLE_SECTIONS.map(({ key, label }) => {
                const section = brief.executive[key];
                const isEditing = editingSection === key;

                return (
                  <article key={key}>
                    <h5>{label}</h5>
                    {isEditing ? (
                      <>
                        <label>
                          {label}
                          <textarea value={editingValue} onChange={(event) => setEditingValue(event.target.value)} />
                        </label>
                        <button type="button" onClick={saveEdit}>
                          Guardar edición
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection(null);
                            setEditingValue("");
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{section.content}</p>
                        {!section.hasSufficientInformation && section.limitations.length > 0 ? (
                          <ul>
                            {section.limitations.map((limitation) => (
                              <li key={limitation}>{limitation}</li>
                            ))}
                          </ul>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Editar ${label}`}
                          onClick={() => {
                            setEditingSection(key);
                            setEditingValue(section.content);
                          }}
                        >
                          Editar
                        </button>
                      </>
                    )}

                    <details>
                      <summary>Ver trazabilidad</summary>
                      <ul>
                        {section.sourceItemIds.map((id) => {
                          const item = items.find((entry) => entry.id === id);
                          return <li key={id}>{item ? item.content : id}</li>;
                        })}
                      </ul>
                    </details>
                  </article>
                );
              })}

              <article>
                <h5>Gravedad</h5>
                <p>Gravedad: {brief.executive.severity.label}</p>
                <p>{brief.executive.severity.notice}</p>
                <p>Para modificar la gravedad, actualizá la evaluación humana.</p>
              </article>

              <p>Estado del brief: {brief.status}</p>

              <button type="button" onClick={markReviewed} disabled={!reviewGate.allowed || record.stale}>
                Marcar brief como revisado
              </button>

              {brief.reviewedByUser ? <p>Brief revisado por el usuario.</p> : null}
            </section>
          ) : (
            <section>
              <h5>Hechos</h5>
              <ul>
                {brief.expanded.facts.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Inferencias</h5>
              <ul>
                {brief.expanded.inferences.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Supuestos</h5>
              <ul>
                {brief.expanded.assumptions.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Datos faltantes</h5>
              <ul>
                {brief.expanded.missingInformation.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Evaluaciones humanas</h5>
              <ul>
                {brief.expanded.humanEvaluations.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Evidencia</h5>
              <ul>
                {brief.expanded.evidenceItems.map((item) => (
                  <li key={item.itemId}>{item.content}</li>
                ))}
              </ul>

              <h5>Warnings abiertos</h5>
              <ul>
                {brief.expanded.openWarnings.map((warning) => (
                  <li key={warning.id}>{warning.message}</li>
                ))}
              </ul>

              <h5>Findings resueltos</h5>
              <ul>
                {brief.expanded.resolvedFindings.map((finding) => (
                  <li key={finding.id}>{finding.title}</li>
                ))}
              </ul>

              <h5>Limitaciones de generación</h5>
              <ul>
                {brief.expanded.generationLimitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>

              <h5>Trazabilidad por sección</h5>
              <ul>
                {Object.entries(brief.traceability.sectionSources).map(([section, sources]) => (
                  <li key={section}>
                    {formatSectionLabel(section as ExecutiveSectionKey)}: {(sources as string[]).join(", ") || "Sin referencias"}
                  </li>
                ))}
              </ul>

              <p>
                Gravedad humana: {HUMAN_SEVERITY_LABELS[brief.executive.severity.value]} ({brief.executive.severity.notice})
              </p>
              <p>Warnings abiertos: {openWarnings}</p>
              <p>Tipos epistemológicos visibles: {Object.keys(EPISTEMIC_TYPE_LABELS).join(", ")}</p>
            </section>
          )}
        </>
      ) : null}
    </section>
  );
}
