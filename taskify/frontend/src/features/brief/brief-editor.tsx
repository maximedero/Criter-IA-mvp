import { useState } from "react";

type Props = {
  initialContent: string;
};

export function BriefEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);

  return (
    <section>
      <h2>Brief ejecutivo</h2>
      <textarea aria-label="Editor de brief ejecutivo" value={content} onChange={(e) => setContent(e.target.value)} rows={12} />
      <button type="button" onClick={() => navigator.clipboard.writeText(content)}>
        Copiar brief
      </button>
    </section>
  );
}
