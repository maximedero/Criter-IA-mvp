import { useEffect, useMemo, useState } from "react";
import type { DecisionCase } from "../../domain/models/DecisionCase";
import { createDecisionCase, getDecisionCaseById, listDecisionCases } from "../../providers/storage/casesStorage";
import { CanvasPage } from "../canvas/canvas-page";
import { CaseForm } from "./CaseForm";

type ViewMode = "inbox" | "detail";

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function InboxPage() {
  const [items, setItems] = useState<DecisionCase[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");

  const refresh = () => {
    setItems(listDecisionCases());
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
          <strong>Estado:</strong> {selectedCase.status}
        </p>
        <p>
          <strong>Relato inicial:</strong> {selectedCase.initialNarrative}
        </p>

        <CanvasPage caseId={selectedCase.id} />

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
                <td>{item.status}</td>
                <td>{formatUpdatedAt(item.updatedAt)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaseId(item.id);
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
