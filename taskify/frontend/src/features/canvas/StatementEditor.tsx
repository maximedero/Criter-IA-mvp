import { FormEvent, useState } from "react";
import { type EpistemicType } from "../../domain/models/CanvasItem";
import { EpistemicTypeSelector } from "./EpistemicTypeSelector";

type Props = {
  submitLabel: string;
  initialContent?: string;
  initialEpistemicType?: EpistemicType;
  onCancel: () => void;
  onSubmit: (payload: { content: string; epistemicType: EpistemicType }) => void;
};

export function StatementEditor({
  submitLabel,
  initialContent = "",
  initialEpistemicType = "FACT",
  onCancel,
  onSubmit
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [epistemicType, setEpistemicType] = useState<EpistemicType>(initialEpistemicType);
  const [contentError, setContentError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) {
      setContentError("Contenido es obligatorio");
      return;
    }

    setContentError(null);
    onSubmit({ content: trimmed, epistemicType });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Contenido
        <textarea value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      {contentError ? <p>{contentError}</p> : null}

      <EpistemicTypeSelector value={epistemicType} onChange={setEpistemicType} />

      <div>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
