import { useState } from "react";
import {
  EPISTEMIC_TYPE_LABELS,
  type CanvasItem
} from "../../domain/models/CanvasItem";

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
    <article>
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
                <textarea value={editedContent} onChange={(event) => setEditedContent(event.target.value)} />
              </label>
              {editError ? <p>{editError}</p> : null}
              <div>
                <button type="button" onClick={() => setEditingAi(false)}>
                  Cancelar edición
                </button>
                <button type="submit">Guardar edición</button>
              </div>
            </form>
          ) : (
            <>
              <button type="button" onClick={onAcceptAI}>
                Aceptar
              </button>
              <button type="button" onClick={() => setEditingAi(true)}>
                Editar
              </button>
              <button type="button" onClick={onRejectAI}>
                Rechazar
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          <button type="button" onClick={onEdit}>
            Editar
          </button>
          <button type="button" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
