import { FormEvent, useState } from "react";

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
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      {titleError ? <p>{titleError}</p> : null}

      <label>
        ¿Qué está pasando?
        <textarea value={initialNarrative} onChange={(e) => setInitialNarrative(e.target.value)} />
      </label>
      {narrativeError ? <p>{narrativeError}</p> : null}

      <div>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit">Crear caso</button>
      </div>
    </form>
  );
}
