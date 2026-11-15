import { useState } from "react";
import {
  EPISTEMIC_TYPE_LABELS,
  type CanvasItem
} from "../../domain/models/CanvasItem";
import { Button } from "../../app/ui/Button";

type Props = {
  statement: CanvasItem;
  onEdit: () => void;
  onDelete: () => void;
  onAcceptAI?: () => void;
  onEditAI?: (content: string) => void;
  onRejectAI?: () => void;
};

export function StatementCard({ statement, onEdit, onDelete, onAcceptAI, onEditAI, onRejectAI }: Props) {
  const [editingAi, setEditingAi] = useState(false);
  const [editedContent, setEditedContent] = useState(statement.content);
  const [editError, setEditError] = useState<string | null>(null);

  const isAi = statement.origin === "AI";
  const isPendingAi = isAi && statement.validationStatus === "PENDING";

  if (statement.validationStatus === "REJECTED") {
    return null;
  }

  return (
    <article className="dw-statement-card">
      {isAi ? <p>Sugerido por IA</p> : null}
      <p>{statement.content}</p>
      <small>{EPISTEMIC_TYPE_LABELS[statement.epistemicType]}</small>

      {isAi && statement.aiSuggestion ? (
        <>
          <p>
            <strong>Por qué se sugiere:</strong> {statement.aiSuggestion.rationale}
          </p>
          <p>Origen de la sugerencia: relato inicial.</p>
        </>
      ) : null}

      {isAi && statement.validationStatus === "VALIDATED" ? <p>Validado por el usuario.</p> : null}
      {isAi && statement.validationStatus === "EDITED" ? <p>Editado por el usuario.</p> : null}

      {isPendingAi ? (
        <div>
          {editingAi ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = editedContent.trim();

                if (!trimmed) {
                  setEditError("Contenido es obligatorio");
                  return;
                }

                setEditError(null);
                onEditAI?.(trimmed);
                setEditingAi(false);
              }}
            >
              <label>
                Editar sugerencia
                <textarea
                  value={editedContent}
                  onChange={(event) => setEditedContent(event.target.value)}
                  aria-invalid={editError ? "true" : "false"}
                  aria-describedby={editError ? `statement-card-edit-error-${statement.id}` : undefined}
                />
              </label>
              {editError ? (
                <p id={`statement-card-edit-error-${statement.id}`} className="dw-canvas-alert" role="alert">
                  {editError}
                </p>
              ) : null}
              <div className="dw-statement-card__actions">
                <Button type="button" variant="ghost" onClick={() => setEditingAi(false)}>
                  Cancelar edición
                </Button>
                <Button type="submit">Guardar edición</Button>
              </div>
            </form>
          ) : (
            <div className="dw-statement-card__actions">
              <Button type="button" onClick={onAcceptAI}>
                Aceptar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditingAi(true)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" onClick={onRejectAI}>
                Rechazar
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="dw-statement-card__actions">
          <Button type="button" variant="ghost" onClick={onEdit}>
            Editar
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      )}
    </article>
  );
}
