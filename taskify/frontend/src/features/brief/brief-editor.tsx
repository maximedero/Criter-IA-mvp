import { useState } from "react";

type Props = {
  initialContent: string;
  onApprove: () => void;
};

export function BriefEditor({ initialContent, onApprove }: Props) {
  const [content, setContent] = useState(initialContent);

  return (
    <section>
      <h2>Brief ejecutivo</h2>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} />
      <button onClick={() => navigator.clipboard.writeText(content)}>Copiar brief</button>
      <button onClick={onApprove}>Aprobar brief</button>
    </section>
  );
}
