import {
  EPISTEMIC_TYPE_LABELS,
  type CanvasItem
} from "../../domain/models/CanvasItem";

type Props = {
  statement: CanvasItem;
  onEdit: () => void;
  onDelete: () => void;
};

export function StatementCard({ statement, onEdit, onDelete }: Props) {
  return (
    <article>
      <p>{statement.content}</p>
      <small>{EPISTEMIC_TYPE_LABELS[statement.epistemicType]}</small>
      <div>
        <button type="button" onClick={onEdit}>
          Editar
        </button>
        <button type="button" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </article>
  );
}
