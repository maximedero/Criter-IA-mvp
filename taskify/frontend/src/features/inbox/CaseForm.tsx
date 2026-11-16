import { FormEvent, useState } from "react";
import { Button } from "../../app/ui/Button";

type Props = {
  onCancel: () => void;
  onCreate: (payload: { title: string; initialNarrative: string }) => void;
};

export function CaseForm({ onCancel, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [initialNarrative, setInitialNarrative] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const safeTitle = title.trim();
    const safeNarrative = initialNarrative.trim();

    const hasTitleError = !safeTitle;
    const hasNarrativeError = !safeNarrative;

    setTitleError(hasTitleError ? "Título es obligatorio" : null);
    setNarrativeError(hasNarrativeError ? "¿Qué está pasando? es obligatorio" : null);

    if (hasTitleError || hasNarrativeError) {
      return;
    }

    onCreate({ title: safeTitle, initialNarrative: safeNarrative });
    setTitle("");
    setInitialNarrative("");
  };

  return (
    <form onSubmit={onSubmit} aria-label="create-case-form">
      <h2>Nuevo caso</h2>
      <label>
        Título
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={titleError ? "true" : "false"}
          aria-describedby={titleError ? "case-form-title-error" : undefined}
        />
      </label>
      {titleError ? (
        <p id="case-form-title-error" role="alert">
          {titleError}
        </p>
      ) : null}

      <label>
        ¿Qué está pasando?
        <textarea
          value={initialNarrative}
          onChange={(e) => setInitialNarrative(e.target.value)}
          aria-invalid={narrativeError ? "true" : "false"}
          aria-describedby={narrativeError ? "case-form-narrative-error" : undefined}
        />
      </label>
      {narrativeError ? (
        <p id="case-form-narrative-error" role="alert">
          {narrativeError}
        </p>
      ) : null}

      <div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear caso</Button>
      </div>
    </form>
  );
}
