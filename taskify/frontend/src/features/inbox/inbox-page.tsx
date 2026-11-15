import { useEffect, useMemo, useState } from "react";
import type { CanvasItem } from "../../domain/models/CanvasItem";
import { CASE_STATUS_LABELS } from "../../domain/models/CaseStatus";
import type { DecisionCase } from "../../domain/models/DecisionCase";
import { canTransition } from "../../domain/workflow/caseStateMachine";
import type { AIProvider } from "../../providers/ai";
import { listCanvasItemsByCase } from "../../providers/storage/canvasStorage";
import {
  createDecisionCase,
  getDecisionCaseById,
  listDecisionCases,
  updateDecisionCaseStatus
} from "../../providers/storage/casesStorage";
import { CanvasPage } from "../canvas/canvas-page";
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

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) {
      return null;
    }

    return getDecisionCaseById(selectedCaseId);
  }, [selectedCaseId, items]);

  if (viewMode === "detail" && selectedCase) {
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
          onStatusChange={(status) => {
            updateDecisionCaseStatus(selectedCase.id, status);
            refresh();
          }}
        />

        <CanvasPage
          caseId={selectedCase.id}
          initialNarrative={selectedCase.initialNarrative}
          caseStatus={selectedCase.status}
          aiProvider={aiProvider}
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
