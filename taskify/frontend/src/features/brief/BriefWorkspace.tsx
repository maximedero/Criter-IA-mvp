import { useEffect, useMemo, useRef, useState } from "react";
import type { CanvasItem } from "../../domain/models/CanvasItem";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
import type { CaseStatus } from "../../domain/models/CaseStatus";
import type { DecisionCase } from "../../domain/models/DecisionCase";
import type { ApprovalReadiness } from "../../domain/models/HumanBriefApproval";
import { HUMAN_SEVERITY_LABELS, type HumanSeverityAssessment } from "../../domain/models/HumanSeverityAssessment";
import type { PersistedQuestion } from "../../domain/models/ContextualQuestion";
import type { CriticalReview } from "../../domain/models/CriticalReview";
import type { AIProvider } from "../../providers/ai";
import { parseGenerateBriefResult } from "../../providers/ai/aiParsing";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import { getBriefRecord, saveCurrentBrief, saveRegeneratedBrief, setBriefStale } from "../../providers/storage/briefStorage";
import { getHumanBriefApproval, removeHumanBriefApproval, saveHumanBriefApproval } from "../../providers/storage/humanApprovalStorage";
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
  updateCommunicationAsEdited,
  updateSectionAsEdited
} from "../../domain/workflow/briefWorkflow";
import { evaluateApprovalReadiness } from "../../domain/rules/readyToElevateRules";
import {
  HUMAN_APPROVAL_ERRORS,
  approvalAppliesToBrief,
  canTransitionToReadyWithHumanApproval,
  createNotApprovedHumanBriefApproval,
  reevaluateAndCreateApproval
} from "../../domain/workflow/humanApprovalWorkflow";
import type { DecisionBrief, ExecutiveSectionKey } from "../../domain/models/DecisionBrief";
import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";

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
  onReadyToEscalate: () => void;
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

function getNextStepMessage(params: {
  caseStatus: CaseStatus;
  hasMinimumCoverage: boolean;
  openBlockers: number;
  severity: HumanSeverityAssessment["severity"];
  briefExists: boolean;
  reviewedByUser: boolean;
  stale: boolean;
}): string {
  if (!params.hasMinimumCoverage) {
    return "Completá la dimensión Intervención para continuar.";
  }

  if (params.openBlockers > 0) {
    return "Revisá los hallazgos críticos.";
  }

  if (params.severity === "UNASSESSED") {
    return "Evaluá la gravedad del caso.";
  }

  if (!params.briefExists) {
    return "Generá la comunicación ejecutiva para continuar.";
  }

  if (params.stale) {
    return "Regenerá la comunicación ejecutiva para sincronizar cambios del análisis.";
  }

  if (params.caseStatus === "READY_TO_ESCALATE") {
    return "El caso está listo para elevar.";
  }

  if (!params.reviewedByUser) {
    return "Revisá la comunicación ejecutiva antes de aprobar.";
  }

  return "Podés avanzar con la aprobación humana cuando corresponda.";
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
  onError,
  onReadyToEscalate
}: Props) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"communication" | "executive" | "expanded">("communication");
  const [editingSection, setEditingSection] = useState<ExecutiveSectionKey | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingCommunication, setEditingCommunication] = useState<"emailSubject" | "emailBody" | "messageBody" | null>(null);
  const [editingCommunicationValue, setEditingCommunicationValue] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<"email" | "message" | null>(null);
  const [hasViewedExecutive, setHasViewedExecutive] = useState(false);
  const [record, setRecord] = useState(() => getBriefRecord(decisionCase.id));
  const [approval, setApproval] = useState(() => getHumanBriefApproval(decisionCase.id));
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const approveTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogCancelRef = useRef<HTMLButtonElement | null>(null);

  const activeItems = useMemo(() => items.filter((item) => item.validationStatus !== "REJECTED"), [items]);

  useEffect(() => {
    const persisted = getBriefRecord(decisionCase.id);
    const staleComputed = calculateBriefStale(persisted.current, activeItems);

    let nextRecord = persisted;
    if (persisted.stale !== staleComputed) {
      nextRecord = setBriefStale(decisionCase.id, staleComputed);
      setRecord(nextRecord);
    } else {
      setRecord(persisted);
    }

    const persistedApproval = getHumanBriefApproval(decisionCase.id);

    if (decisionCase.status === "BRIEF_DRAFT" && nextRecord.current) {
      if (!persistedApproval || persistedApproval.briefVersion !== nextRecord.current.version) {
        const resetApproval = createNotApprovedHumanBriefApproval(decisionCase.id, nextRecord.current);
        saveHumanBriefApproval(resetApproval);
        setApproval(resetApproval);
        return;
      }
    }

    setApproval(persistedApproval);
  }, [decisionCase.id, decisionCase.status, activeItems]);

  useEffect(() => {
    if (view === "executive") {
      setHasViewedExecutive(true);
    }
  }, [view]);

  useEffect(() => {
    if (!showApproveDialog) {
      return;
    }

    const previousActive = document.activeElement as HTMLElement | null;
    dialogCancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelApproval();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (approveTriggerRef.current) {
        approveTriggerRef.current.focus();
      } else {
        previousActive?.focus();
      }
    };
  }, [showApproveDialog]);

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

  const readiness: ApprovalReadiness = evaluateApprovalReadiness({
    caseStatus: decisionCase.status,
    activeItems,
    criticalReviewComplete,
    openBlockers,
    severityAssessment,
    brief,
    stale: record.stale
  });

  const approvalMatchesCurrentBrief = approvalAppliesToBrief(approval, brief);
  const isReadyToEscalate = decisionCase.status === "READY_TO_ESCALATE";
  const isApprovedForCurrentBrief = isReadyToEscalate && approvalMatchesCurrentBrief;
  const canApproveBrief =
    decisionCase.status === "BRIEF_DRAFT" && readiness.ready && Boolean(brief) && approval?.status !== "APPROVED";

  const nextStepMessage = getNextStepMessage({
    caseStatus: decisionCase.status,
    hasMinimumCoverage,
    openBlockers,
    severity: severityAssessment.severity,
    briefExists: Boolean(brief),
    reviewedByUser: Boolean(brief?.reviewedByUser),
    stale: record.stale
  });

  const statusSummary = {
    cobertura: hasMinimumCoverage ? "Completa" : "Pendiente",
    revision: brief?.reviewedByUser ? "Revisado" : "Pendiente",
    gravedad: severityAssessment.severity === "UNASSESSED" ? "Sin evaluar" : HUMAN_SEVERITY_LABELS[severityAssessment.severity],
    brief: brief ? `v${brief.version} (${record.stale ? "stale" : brief.status})` : "No generado",
    aprobacion: isApprovedForCurrentBrief ? "Aprobado" : approval?.status === "APPROVED" ? "Desincronizada" : "Pendiente"
  };

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

      const currentApproval = getHumanBriefApproval(decisionCase.id);
      if (
        currentApproval &&
        currentApproval.status === "APPROVED" &&
        currentApproval.confirmedBriefVersion !== normalized.version
      ) {
        removeHumanBriefApproval(decisionCase.id);
        setApproval(null);
      }

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

  const saveCommunicationEdit = () => {
    if (!brief || !editingCommunication) {
      return;
    }

    const updated = updateCommunicationAsEdited(brief, editingCommunication, editingCommunicationValue);
    const next = saveCurrentBrief(decisionCase.id, updated);
    setRecord(next);
    setEditingCommunication(null);
    setEditingCommunicationValue("");
    setCopyFeedback(null);
    onBriefSaved();
  };

  const copyText = async (type: "email" | "message", content: string) => {
    if (!content.trim()) {
      onError("No hay contenido para copiar.");
      return;
    }

    if (record.stale) {
      onError("El análisis cambió después de generar este brief.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopyFeedback(type);
      onError(null);
    } catch {
      onError("No se pudo copiar el contenido. Seleccionalo manualmente.");
    }
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

  const openApproveDialog = () => {
    onError(null);
    if (!readiness.ready || !brief) {
      onError(readiness.blockers[0]?.reason ?? "No se cumplen las condiciones para aprobar.");
      return;
    }

    setShowApproveDialog(true);
  };

  const cancelApproval = () => {
    setShowApproveDialog(false);
  };

  const confirmApproval = () => {
    if (!brief) {
      setShowApproveDialog(false);
      onError(HUMAN_APPROVAL_ERRORS.CONDITIONS_CHANGED);
      return;
    }

    const reevaluated = reevaluateAndCreateApproval({
      caseStatus: decisionCase.status,
      activeItems,
      criticalReviewComplete,
      openBlockers,
      severityAssessment,
      brief,
      stale: getBriefRecord(decisionCase.id).stale
    });

    if (reevaluated.allowed === false) {
      setShowApproveDialog(false);
      onError(reevaluated.message);
      return;
    }

    try {
      saveHumanBriefApproval(reevaluated.approval);

      const transition = canTransitionToReadyWithHumanApproval({
        caseStatus: decisionCase.status,
        hasMinimumCoverage,
        criticalReviewComplete,
        openBlockers,
        severity: severityAssessment.severity,
        briefExists: true,
        briefReviewed: brief.reviewedByUser,
        humanApproved: true
      });

      if (!transition.allowed) {
        try {
          removeHumanBriefApproval(decisionCase.id);
        } catch {
          // ignore rollback failure
        }
        setApproval(null);
        setShowApproveDialog(false);
        onError(HUMAN_APPROVAL_ERRORS.TRANSITION_ERROR);
        return;
      }

      setApproval(reevaluated.approval);
      setShowApproveDialog(false);
      onReadyToEscalate();
      onBriefSaved();
    } catch {
      try {
        removeHumanBriefApproval(decisionCase.id);
      } catch {
        // ignore rollback failure
      }
      setApproval(null);
      setShowApproveDialog(false);
      onError(HUMAN_APPROVAL_ERRORS.STORAGE_ERROR);
    }
  };

  return (
    <section aria-label="Preparación del brief" className="dw-brief-workspace">
      <h4>PREPARACIÓN DEL BRIEF</h4>
      <p>
        La IA puede preparar un borrador utilizando únicamente información validada o editada por el usuario. El resultado debe ser
        revisado antes de elevarlo.
      </p>

      <section aria-label="Próximo paso" className="dw-brief-next-step">
        <h5>PRÓXIMO PASO</h5>
        <p>{nextStepMessage}</p>
      </section>

      <section aria-label="Estado compacto" className="dw-brief-status-summary">
        <h5>Estado compacto</h5>
        <ul>
          <li><strong>Cobertura:</strong> {statusSummary.cobertura}</li>
          <li><strong>Revisión:</strong> {statusSummary.revision}</li>
          <li><strong>Gravedad:</strong> {statusSummary.gravedad}</li>
          <li><strong>Brief:</strong> {statusSummary.brief}</li>
          <li><strong>Aprobación:</strong> {statusSummary.aprobacion}</li>
        </ul>
      </section>

      {!gate.allowed && decisionCase.status === "BRIEF_DRAFT" ? (
        <p className="dw-brief-alert" role="alert">
          {gate.reasons[0]}
        </p>
      ) : null}

      {decisionCase.status === "BRIEF_DRAFT" ? (
        <Button type="button" disabled={loading || !gate.allowed} onClick={() => generate(false)}>
          Generar borrador de brief
        </Button>
      ) : null}

      {loading ? <p>Generando borrador...</p> : null}

      {brief && (decisionCase.status === "BRIEF_DRAFT" || decisionCase.status === "READY_TO_ESCALATE") ? (
        <>
          {decisionCase.status === "BRIEF_DRAFT" && record.stale ? (
            <>
              <p className="dw-brief-alert" role="alert">El análisis cambió después de generar este brief.</p>
              <Button type="button" disabled={loading || !gate.allowed || isReadyToEscalate} onClick={() => generate(true)}>
                Regenerar borrador
              </Button>
            </>
          ) : null}

          {isReadyToEscalate && approvalMatchesCurrentBrief && approval ? (
            <section aria-label="Aprobación confirmada" className="dw-approval-ready-panel">
              <h5>LISTO PARA ELEVAR</h5>
              <p>El brief fue revisado y aprobado por el usuario.</p>
              <p>Versión aprobada: v{approval.confirmedBriefVersion}</p>
              <p>Aprobación realizada por el usuario.</p>
              <p>Fecha de aprobación: {new Date(approval.approvedAt ?? approval.updatedAt).toLocaleString("es-AR")}</p>
              <p>Gravedad: {brief.executive.severity.label}</p>
              <p>{brief.executive.severity.notice}</p>
              <p>
                Listo para elevar indica preparación del brief, no aprobación de la decisión por parte del destinatario.
              </p>
              <details>
                <summary>Checklist al momento de aprobar</summary>
                <ul className="dw-approval-checklist">
                  {approval.checklistSnapshot.checks.map((check) => (
                    <li key={check.id} className="dw-approval-checklist__item">
                      <span>{check.label}</span>
                      <span className={check.passed ? "dw-approval-badge dw-approval-badge--passed" : "dw-approval-badge dw-approval-badge--pending"}>
                        {check.passed ? "Cumplido" : "Pendiente"}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          ) : null}

          <div role="tablist" aria-label="Vistas del brief" className="dw-brief-tabs">
            <Button
              type="button"
              role="tab"
              aria-selected={view === "communication"}
              variant={view === "communication" ? "primary" : "ghost"}
              onClick={() => setView("communication")}
            >
              Comunicación ejecutiva
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={view === "executive"}
              variant={view === "executive" ? "primary" : "ghost"}
              onClick={() => setView("executive")}
            >
              Brief ejecutivo
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={view === "expanded"}
              variant={view === "expanded" ? "primary" : "ghost"}
              onClick={() => setView("expanded")}
            >
              Análisis completo y trazabilidad
            </Button>
          </div>

          {view === "communication" ? (
            <section>
              <article>
                <h5>Correo</h5>
                {editingCommunication === "emailSubject" ? (
                  <>
                    <label>
                      Asunto
                      <input value={editingCommunicationValue} onChange={(event) => setEditingCommunicationValue(event.target.value)} />
                    </label>
                    <div className="dw-brief-inline-actions">
                      <Button type="button" onClick={saveCommunicationEdit} disabled={isReadyToEscalate}>
                        Guardar edición
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommunication(null);
                          setEditingCommunicationValue("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Asunto:</strong> {brief.communication.email.subject || "Sin asunto"}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isReadyToEscalate}
                      onClick={() => {
                        setEditingCommunication("emailSubject");
                        setEditingCommunicationValue(brief.communication.email.subject);
                      }}
                    >
                      Editar asunto
                    </Button>
                  </>
                )}

                {editingCommunication === "emailBody" ? (
                  <>
                    <label>
                      Cuerpo del correo
                      <textarea value={editingCommunicationValue} onChange={(event) => setEditingCommunicationValue(event.target.value)} />
                    </label>
                    <div className="dw-brief-inline-actions">
                      <Button type="button" onClick={saveCommunicationEdit} disabled={isReadyToEscalate}>
                        Guardar edición
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommunication(null);
                          setEditingCommunicationValue("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{brief.communication.email.body || "Sin contenido"}</p>
                    <div className="dw-brief-inline-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isReadyToEscalate}
                        onClick={() => {
                          setEditingCommunication("emailBody");
                          setEditingCommunicationValue(brief.communication.email.body);
                        }}
                      >
                        Editar correo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={record.stale}
                        onClick={() =>
                          copyText(
                            "email",
                            `Asunto: ${brief.communication.email.subject || "Sin asunto"}\n\n${brief.communication.email.body}`
                          )
                        }
                      >
                        Copiar como correo
                      </Button>
                    </div>
                    {copyFeedback === "email" ? <p>Correo copiado.</p> : null}
                  </>
                )}
              </article>

              <article>
                <h5>Mensaje breve</h5>
                {editingCommunication === "messageBody" ? (
                  <>
                    <label>
                      Mensaje
                      <textarea value={editingCommunicationValue} onChange={(event) => setEditingCommunicationValue(event.target.value)} />
                    </label>
                    <div className="dw-brief-inline-actions">
                      <Button type="button" onClick={saveCommunicationEdit} disabled={isReadyToEscalate}>
                        Guardar edición
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommunication(null);
                          setEditingCommunicationValue("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{brief.communication.message.body || "Sin contenido"}</p>
                    <div className="dw-brief-inline-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isReadyToEscalate}
                        onClick={() => {
                          setEditingCommunication("messageBody");
                          setEditingCommunicationValue(brief.communication.message.body);
                        }}
                      >
                        Editar mensaje
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={record.stale}
                        onClick={() => copyText("message", brief.communication.message.body)}
                      >
                        Copiar como mensaje
                      </Button>
                    </div>
                    {copyFeedback === "message" ? <p>Mensaje copiado.</p> : null}
                  </>
                )}
              </article>

              <p>Estado del brief: {brief.status}</p>
            </section>
          ) : null}

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
                        <div className="dw-brief-inline-actions">
                          <Button type="button" onClick={saveEdit} disabled={isReadyToEscalate}>
                            Guardar edición
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setEditingSection(null);
                              setEditingValue("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
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
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={`Editar ${label}`}
                          disabled={isReadyToEscalate}
                          onClick={() => {
                            setEditingSection(key);
                            setEditingValue(section.content);
                          }}
                        >
                          Editar
                        </Button>
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

              <Button type="button" onClick={markReviewed} disabled={!reviewGate.allowed || record.stale || isReadyToEscalate}>
                Marcar brief como revisado
              </Button>

              {brief.reviewedByUser ? <p>Brief revisado por el usuario.</p> : null}
              {isReadyToEscalate ? <p>Este brief corresponde a una versión aprobada.</p> : null}
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

          {decisionCase.status === "BRIEF_DRAFT" ? (
            <section aria-label="Aprobación humana" className="dw-approval-panel">
              <h5>APROBACIÓN HUMANA</h5>
              <p>El sistema verifica las condiciones necesarias, pero la aprobación final debe realizarla una persona.</p>
              <h6>CHECKLIST FINAL</h6>
              <ul className="dw-approval-checklist">
                {readiness.checks.map((check) => (
                  <li key={check.id} className="dw-approval-checklist__item">
                    <span>{check.passed ? "✓" : "○"} {check.label}</span>
                    <span className={check.passed ? "dw-approval-badge dw-approval-badge--passed" : "dw-approval-badge dw-approval-badge--pending"}>
                      {check.passed ? "Cumplido" : "Pendiente"}
                    </span>
                    {!check.passed ? <p>Explicación: {check.reason}</p> : null}
                  </li>
                ))}
              </ul>

              <p className={readiness.ready ? "dw-approval-status dw-approval-status--ready" : "dw-approval-status dw-approval-status--blocked"}>
                {readiness.ready
                  ? "Se cumplen las condiciones para aprobar el brief."
                  : "Todavía no se cumplen las condiciones para aprobar el brief."}
              </p>

              <Button
                type="button"
                onClick={openApproveDialog}
                disabled={!canApproveBrief || isReadyToEscalate}
                ref={approveTriggerRef}
              >
                Aprobar brief
              </Button>

              {showApproveDialog ? (
                <div className="dw-approve-dialog__overlay">
                  <div role="dialog" aria-modal="true" aria-label="Confirmar aprobación" className="dw-approve-dialog">
                    <h5>Confirmar aprobación</h5>
                    <p>Estás por marcar este caso como LISTO PARA ELEVAR.</p>
                    <p>
                      Esta acción confirma que revisaste el brief actual y que considerás que está en condiciones de ser presentado
                      al nivel superior correspondiente.
                    </p>
                    <dl className="dw-approve-dialog__meta">
                      <div>
                        <dt>Caso</dt>
                        <dd>{decisionCase.title}</dd>
                      </div>
                      <div>
                        <dt>Versión del brief</dt>
                        <dd>v{brief.version}</dd>
                      </div>
                      <div>
                        <dt>Gravedad</dt>
                        <dd>{brief.executive.severity.label}</dd>
                      </div>
                    </dl>
                    <p>Versión del brief: v{brief.version}</p>
                    <p>Gravedad: {brief.executive.severity.label}</p>
                    <p>Evaluación de gravedad realizada por el usuario.</p>
                    <div className="dw-approve-dialog__actions">
                      <Button type="button" variant="ghost" onClick={cancelApproval} ref={dialogCancelRef}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={confirmApproval}>
                        Confirmar aprobación
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
