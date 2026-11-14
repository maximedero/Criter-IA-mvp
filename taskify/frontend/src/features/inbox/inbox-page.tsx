import { FormEvent, useEffect, useState } from "react";
import { CaseItem, createCase, listCases } from "../../services/api-client";

type Props = {
  onOpenCase: (caseId: string) => void;
};

export function InboxPage({ onOpenCase }: Props) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [title, setTitle] = useState("");
  const [informalDescription, setInformalDescription] = useState("");

  const refresh = async () => {
    const data = await listCases();
    setCases(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const created = await createCase({ title, informalDescription });
    setTitle("");
    setInformalDescription("");
    await refresh();
    onOpenCase(created.id);
  };

  return (
    <main>
      <h1>Decision Inbox</h1>
      <form onSubmit={onSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del caso" required />
        <textarea value={informalDescription} onChange={(e) => setInformalDescription(e.target.value)} placeholder="Descripción informal" required />
        <button type="submit">Nuevo caso</button>
      </form>
      <ul>
        {cases.map((c) => (
          <li key={c.id}>
            <button onClick={() => onOpenCase(c.id)}>{c.title}</button> - {c.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
