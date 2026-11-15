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
import { listCanvasItemsByCase } from "../../providers/storage/canvasStorage";
import {
  createDecisionCase,
  getDecisionCaseById,
  listDecisionCases,
  updateDecisionCaseStatus
} from "../../providers/storage/casesStorage";
import { getCriticalReview, isCriticalReviewComplete } from "../../providers/storage/criticalReviewStorage";
import { getHumanSeverityAssessment } from "../../providers/storage/humanSeverityStorage";
import { HumanSeverityPanel, mapMissingCoverageLabels } from "../canvas/HumanSeverityPanel";
import { CanvasPage } from "../canvas/canvas-page";
import { BriefWorkspace } from "../brief/BriefWorkspace";
import { CriticalReviewPanel } from "../review/CriticalReviewPanel";
import { CaseForm } from "./CaseForm";
import { CaseStatusControl } from "./CaseStatusControl";

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

    const shouldRenderBriefWorkspace = selectedCase.status === "BRIEF_DRAFT";

    return (
      <section>
        <h2>Detalle de caso</h2>
        <p>
          <strong>Título:</strong> {selectedCase.title}
        </p>
        <p>
          <strong>Estado:</strong> {CASE_STATUS_LABELS[selectedCase.status]}
        </p>
        <p>
          <strong>Relato inicial:</strong> {selectedCase.initialNarrative}
        </p>

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
          />
        ) : null}

        {briefError ? <p role="alert">{briefError}</p> : null}

        <button
          type="button"
          onClick={() => {
            setViewMode("inbox");
            refresh();
          }}
        >
          Volver al Inbox
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2>Inbox</h2>

      {showCreateForm ? (
        <CaseForm
          onCancel={() => setShowCreateForm(false)}
          onCreate={(payload) => {
            createDecisionCase(payload);
            setShowCreateForm(false);
            refresh();
          }}
        />
      ) : (
        <button type="button" onClick={() => setShowCreateForm(true)}>
          Nuevo caso
        </button>
      )}

      {items.length === 0 ? <p>No hay casos cargados.</p> : null}

      {items.length > 0 ? (
        <table>
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
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaseId(item.id);
                      setSelectedCaseItems(listCanvasItemsByCase(item.id));
                      setViewMode("detail");
                    }}
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
