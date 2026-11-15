import { useEffect, useMemo, useState } from "react";
import type { CanvasItem } from "../../domain/models/CanvasItem";
import { CASE_STATUS_LABELS } from "../../domain/models/CaseStatus";
import type { DecisionCase } from "../../domain/models/DecisionCase";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { calculateReviewSummary } from "../../domain/rules/reviewRules";
import { canTransition } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToBriefDraft } from "../../domain/workflow/humanSeverityWorkflow";
import type { AIProvider } from "../../providers/ai";
import { MockAIProvider } from "../../providers/ai";
import { getBriefRecord } from "../../providers/storage/briefStorage";
import { listCanvasItemsByCase } from "../../providers/storage/canvasStorage";
import {
  createDecisionCase,
  getDecisionCaseById,
  listDecisionCases,
  updateDecisionCaseStatus
} from "../../providers/storage/casesStorage";
import { getCriticalReview, isCriticalReviewComplete } from "../../providers/storage/criticalReviewStorage";
import { getHumanSeverityAssessment } from "../../providers/storage/humanSeverityStorage";
import { getHumanBriefApproval } from "../../providers/storage/humanApprovalStorage";
import { HumanSeverityPanel, mapMissingCoverageLabels } from "../canvas/HumanSeverityPanel";
import { CanvasPage } from "../canvas/canvas-page";
import { BriefWorkspace } from "../brief/BriefWorkspace";
import { CriticalReviewPanel } from "../review/CriticalReviewPanel";
import { Button } from "../../app/ui/Button";
import { CaseForm } from "./CaseForm";
import { CaseStatusControl } from "./CaseStatusControl";
import "./inbox-page.css";

type ViewMode = "inbox" | "detail";

type Props = {
  aiProvider?: AIProvider;
};

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function InboxPage({ aiProvider }: Props) {
  const [items, setItems] = useState<DecisionCase[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseItems, setSelectedCaseItems] = useState<CanvasItem[]>([]);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");

  const refresh = () => {
    const listed = listDecisionCases();
    setItems(listed);

    if (selectedCaseId) {
      setSelectedCaseItems(listCanvasItemsByCase(selectedCaseId));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const provider = useMemo(() => aiProvider ?? new MockAIProvider(), [aiProvider]);

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) {
      return null;
    }

    return getDecisionCaseById(selectedCaseId);
  }, [selectedCaseId, items]);

  if (viewMode === "detail" && selectedCase) {
    const coverage = evaluateMinimumCoverage(selectedCaseItems);
    const review = getCriticalReview(selectedCase.id);
    const reviewSummary = review ? calculateReviewSummary(review.findings) : null;
    const openBlockers = reviewSummary?.openBlockers ?? 0;
    const openWarnings = reviewSummary?.openWarnings ?? 0;
    const criticalReviewComplete = isCriticalReviewComplete(selectedCase.id);
    const severityAssessment = getHumanSeverityAssessment(selectedCase.id);

    const handleStatusChange = (status: DecisionCase["status"]) => {
      updateDecisionCaseStatus(selectedCase.id, status);
      refresh();
    };

    const shouldRenderHumanSeverityPanel =
      selectedCase.status === "HUMAN_EVALUATION" ||
      (selectedCase.status === "CRITICAL_REVIEW" && criticalReviewComplete) ||
      selectedCase.status === "BRIEF_DRAFT";

    const shouldRenderBriefWorkspace = selectedCase.status === "BRIEF_DRAFT" || selectedCase.status === "READY_TO_ESCALATE";

    return (
      <section className="dw-case-detail">
        <h2>Detalle de caso</h2>
        <div className="dw-case-detail__summary">
          <p>
            <strong>Título:</strong> {selectedCase.title}
          </p>
          <p>
            <strong>Estado:</strong> {CASE_STATUS_LABELS[selectedCase.status]}
          </p>
          <p>
            <strong>Relato inicial:</strong> {selectedCase.initialNarrative}
          </p>
        </div>

        <CaseStatusControl
          status={selectedCase.status}
          items={selectedCaseItems}
          criticalReviewComplete={criticalReviewComplete}
          openBlockers={openBlockers}
          humanSeverity={severityAssessment.severity}
          onStatusChange={handleStatusChange}
        />

        <CanvasPage
          caseId={selectedCase.id}
          initialNarrative={selectedCase.initialNarrative}
          caseStatus={selectedCase.status}
          aiProvider={provider}
          onItemsChange={(nextItems) => {
            setSelectedCaseItems(nextItems);

            if (selectedCase.status === "DRAFT") {
              const hasUserValidatedOrEditedItem = nextItems.some(
                (item) => item.origin === "USER" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
              );

              const transition = canTransition("DRAFT", "IN_ANALYSIS", {
                hasUserValidatedOrEditedItem,
                hasMinimumCoverage: false,
                startCriticalReviewRequested: false,
                criticalReviewComplete: false,
                criticalBlockers: 0,
                humanSeverity: "UNASSESSED",
                briefExists: false,
                briefReviewed: false,
                humanApproved: false
              });

              if (transition.allowed) {
                updateDecisionCaseStatus(selectedCase.id, "IN_ANALYSIS");
                refresh();
              }
            }
          }}
        />

        <CriticalReviewPanel
          caseId={selectedCase.id}
          initialNarrative={selectedCase.initialNarrative}
          caseStatus={selectedCase.status}
          items={selectedCaseItems}
          provider={provider}
          onItemsUpdated={refresh}
        />

        {shouldRenderHumanSeverityPanel ? (
          <HumanSeverityPanel
            caseId={selectedCase.id}
            caseStatus={selectedCase.status}
            criticalReviewComplete={criticalReviewComplete}
            hasMinimumCoverage={coverage.hasMinimumCoverage}
            missingCoverageLabels={mapMissingCoverageLabels(coverage.missingDimensions)}
            openBlockers={openBlockers}
            openWarnings={openWarnings}
            onSaved={() => {
              refresh();
            }}
            onContinueToBriefDraft={() => {
              const gate = canAdvanceToBriefDraft({
                currentStatus: "HUMAN_EVALUATION",
                hasMinimumCoverage: coverage.hasMinimumCoverage,
                criticalReviewComplete,
                openBlockers,
                humanSeverity: getHumanSeverityAssessment(selectedCase.id).severity
              });

              if (gate.allowed) {
                handleStatusChange("BRIEF_DRAFT");
              }
            }}
          />
        ) : null}

        {shouldRenderBriefWorkspace ? (
          <BriefWorkspace
            decisionCase={selectedCase}
            items={selectedCaseItems}
            hasMinimumCoverage={coverage.hasMinimumCoverage}
            criticalReviewComplete={criticalReviewComplete}
            review={review}
            openBlockers={openBlockers}
            openWarnings={openWarnings}
            severityAssessment={severityAssessment}
            provider={provider}
            onBriefSaved={() => {
              setBriefError(null);
              refresh();
            }}
            onError={(message) => {
              setBriefError(message);
            }}
            onReadyToEscalate={() => {
              const currentApproval = getHumanBriefApproval(selectedCase.id);
              const transition = canTransition("BRIEF_DRAFT", "READY_TO_ESCALATE", {
                hasUserValidatedOrEditedItem: true,
                hasMinimumCoverage: coverage.hasMinimumCoverage,
                startCriticalReviewRequested: true,
                criticalReviewComplete,
                criticalBlockers: openBlockers,
                humanSeverity: severityAssessment.severity,
                briefExists: true,
                briefReviewed: getBriefRecord(selectedCase.id).current?.reviewedByUser ?? false,
                humanApproved: Boolean(currentApproval?.status === "APPROVED")
              });

              if (transition.allowed) {
                handleStatusChange("READY_TO_ESCALATE");
              } else {
                setBriefError("No se pudo completar la transición a Listo para elevar.");
              }
            }}
          />
        ) : null}

        {briefError ? (
          <p className="dw-inbox__alert" role="alert">
            {briefError}
          </p>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setViewMode("inbox");
            refresh();
          }}
        >
          Volver al Inbox
        </Button>
      </section>
    );
  }

  return (
    <section className="dw-inbox">
      <div className="dw-inbox__header">
        <h2>Inbox</h2>

        {!showCreateForm ? (
          <Button type="button" onClick={() => setShowCreateForm(true)}>
            Nuevo caso
          </Button>
        ) : null}
      </div>

      {showCreateForm ? (
        <CaseForm
          onCancel={() => setShowCreateForm(false)}
          onCreate={(payload) => {
            createDecisionCase(payload);
            setShowCreateForm(false);
            refresh();
          }}
        />
      ) : null}

      {items.length === 0 ? <p className="dw-inbox__empty">No hay casos cargados.</p> : null}

      {items.length > 0 ? (
        <table className="dw-inbox__table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{CASE_STATUS_LABELS[item.status]}</td>
                <td>{formatUpdatedAt(item.updatedAt)}</td>
                <td>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCaseId(item.id);
                      setSelectedCaseItems(listCanvasItemsByCase(item.id));
                      setViewMode("detail");
                    }}
                  >
                    Abrir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
