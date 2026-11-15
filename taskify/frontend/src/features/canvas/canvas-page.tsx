import { useEffect, useState } from "react";
import {
  CANVAS_DIMENSIONS,
  CANVAS_DIMENSION_LABELS,
  type CanvasDimension,
  type CanvasItem
} from "../../domain/models/CanvasItem";
import {
  createCanvasItem,
  deleteCanvasItem,
  listCanvasItemsByCase,
  updateCanvasItem
} from "../../providers/storage/canvasStorage";
import { CoveragePanel } from "./CoveragePanel";
import { StatementCard } from "./statement-card";
import { StatementEditor } from "./StatementEditor";

type Props = {
  caseId: string;
  onItemsChange?: (items: CanvasItem[]) => void;
};

export function CanvasPage({ caseId, onItemsChange }: Props) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [addingDimension, setAddingDimension] = useState<CanvasDimension | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => {
    const listed = listCanvasItemsByCase(caseId);
    setItems(listed);
    onItemsChange?.(listed);
  };

  useEffect(() => {
    refresh();
  }, [caseId]);

  const editingItem = editingId ? items.find((item) => item.id === editingId) ?? null : null;

  return (
    <section>
      <h3>Decision Canvas</h3>
      <CoveragePanel items={items} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {CANVAS_DIMENSIONS.map((dimension) => {
          const dimensionItems = items.filter((item) => item.dimension === dimension);
          const isAdding = addingDimension === dimension;

          return (
            <section key={dimension}>
              <h4>{CANVAS_DIMENSION_LABELS[dimension]}</h4>

              {dimensionItems.length === 0 ? <p>Sin contenido</p> : null}

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
                <button type="button" onClick={() => setAddingDimension(dimension)}>
                  + Agregar
                </button>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
