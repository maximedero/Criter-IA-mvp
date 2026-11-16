import { useEffect, useMemo, useState } from "react";
import {
  CANVAS_DIMENSIONS,
  CANVAS_DIMENSION_LABELS,
  type CanvasDimension,
  type CanvasItem
} from "../../domain/models/CanvasItem";
import type { CaseStatus } from "../../domain/models/CaseStatus";
import { MockAIProvider, parseAnalyzeNarrativeResult, type AIProvider } from "../../providers/ai";
import { applyAnalyzeNarrativeSuggestions, editAISuggestion, acceptAISuggestion, rejectAISuggestion } from "./aiSuggestionActions";
import {
  createCanvasItem,
  deleteCanvasItem,
  listCanvasItemsByCase,
  updateCanvasItem
} from "../../providers/storage/canvasStorage";
import { CoveragePanel } from "./CoveragePanel";
import { QuestionPanel } from "./QuestionPanel";
import { StatementCard } from "./statement-card";
import { StatementEditor } from "./StatementEditor";
import { Button } from "../../app/ui/Button";
import "./canvas-page.css";

type Props = {
  caseId: string;
  initialNarrative: string;
  caseStatus: CaseStatus;
  aiProvider?: AIProvider;
  onItemsChange?: (items: CanvasItem[]) => void;
};

export function CanvasPage({ caseId, initialNarrative, caseStatus, aiProvider, onItemsChange }: Props) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [addingDimension, setAddingDimension] = useState<CanvasDimension | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [analyzingNarrative, setAnalyzingNarrative] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisEmptyMessage, setAnalysisEmptyMessage] = useState<string | null>(null);
  const provider = useMemo(() => aiProvider ?? new MockAIProvider(), [aiProvider]);

  const refresh = () => {
    const listed = listCanvasItemsByCase(caseId);
    setItems(listed);
    onItemsChange?.(listed);
  };

  useEffect(() => {
    refresh();
    setAnalysisError(null);
    setAnalysisEmptyMessage(null);
  }, [caseId]);

  const editingItem = editingId ? items.find((item) => item.id === editingId) ?? null : null;

  return (
    <section className="dw-canvas-page">
      <h3>Decision Canvas</h3>

      <div className="dw-canvas-page__actions">
        <Button
          type="button"
          onClick={async () => {
            setAnalyzingNarrative(true);
            setAnalysisError(null);
            setAnalysisEmptyMessage(null);

            try {
              const rawResult = await provider.analyzeNarrative({
                caseId,
                initialNarrative,
                existingItems: listCanvasItemsByCase(caseId)
              });
              const result = parseAnalyzeNarrativeResult(rawResult);

              if (result.suggestions.length === 0) {
                setAnalysisEmptyMessage("No se identificaron sugerencias para este relato.");
              } else {
                applyAnalyzeNarrativeSuggestions(caseId, result.suggestions);
              }

              refresh();
            } catch {
              setAnalysisError("No se pudieron procesar las sugerencias del relato.");
            } finally {
              setAnalyzingNarrative(false);
            }
          }}
        >
          Analizar relato
        </Button>

        {analyzingNarrative ? <p>Analizando relato...</p> : null}
        {analysisError ? (
          <p className="dw-canvas-page__alert" role="alert">
            {analysisError}
          </p>
        ) : null}
        {analysisEmptyMessage ? <p>{analysisEmptyMessage}</p> : null}
      </div>

      <CoveragePanel items={items} />
      <QuestionPanel
        caseId={caseId}
        initialNarrative={initialNarrative}
        caseStatus={caseStatus}
        items={items}
        provider={provider}
        onItemsUpdated={refresh}
      />
      <div className="dw-canvas-page__grid">
        {CANVAS_DIMENSIONS.map((dimension) => {
          const dimensionItems = items.filter((item) => item.dimension === dimension);
          const isAdding = addingDimension === dimension;

          return (
            <section key={dimension} className="dw-canvas-dimension">
              <h4>{CANVAS_DIMENSION_LABELS[dimension]}</h4>

              {dimensionItems.length === 0 ? <p className="dw-canvas-dimension__empty">Sin contenido</p> : null}

              {dimensionItems.map((item) =>
                editingItem && editingItem.id === item.id ? (
                  <StatementEditor
                    key={item.id}
                    submitLabel="Guardar"
                    initialContent={item.content}
                    initialEpistemicType={item.epistemicType}
                    onCancel={() => setEditingId(null)}
                    onSubmit={({ content, epistemicType }) => {
                      updateCanvasItem(caseId, item.id, { content, epistemicType });
                      setEditingId(null);
                      refresh();
                    }}
                  />
                ) : (
                  <StatementCard
                    key={item.id}
                    statement={item}
                    onEdit={() => setEditingId(item.id)}
                    onDelete={() => {
                      deleteCanvasItem(caseId, item.id);
                      refresh();
                    }}
                    onAcceptAI={() => {
                      acceptAISuggestion(caseId, item.id);
                      refresh();
                    }}
                    onEditAI={(content) => {
                      editAISuggestion(caseId, item.id, content);
                      refresh();
                    }}
                    onRejectAI={() => {
                      rejectAISuggestion(caseId, item.id);
                      refresh();
                    }}
                  />
                )
              )}

              {isAdding ? (
                <StatementEditor
                  submitLabel="Agregar"
                  onCancel={() => setAddingDimension(null)}
                  onSubmit={({ content, epistemicType }) => {
                    createCanvasItem({
                      caseId,
                      dimension,
                      content,
                      epistemicType
                    });
                    setAddingDimension(null);
                    refresh();
                  }}
                />
              ) : (
                <Button type="button" variant="ghost" onClick={() => setAddingDimension(dimension)}>
                  + Agregar
                </Button>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
