import { FormEvent, useState } from "react";
import { type EpistemicType } from "../../domain/models/CanvasItem";
import { Button } from "../../app/ui/Button";
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
    <form onSubmit={handleSubmit} className="dw-statement-editor">
      <label>
        Contenido
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          aria-invalid={contentError ? "true" : "false"}
          aria-describedby={contentError ? "statement-editor-content-error" : undefined}
        />
      </label>
      {contentError ? (
        <p id="statement-editor-content-error" className="dw-canvas-alert" role="alert">
          {contentError}
        </p>
      ) : null}

      <EpistemicTypeSelector value={epistemicType} onChange={setEpistemicType} />

      <div className="dw-statement-editor__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
