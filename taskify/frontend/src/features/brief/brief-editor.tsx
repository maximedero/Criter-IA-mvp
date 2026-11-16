import { useState } from "react";
import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";

type Props = {
  initialContent: string;
};

export function BriefEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);

  return (
    <section className="dw-brief-editor">
      <h2>Brief ejecutivo</h2>
      <textarea aria-label="Editor de brief ejecutivo" value={content} onChange={(e) => setContent(e.target.value)} rows={12} />
      <Button type="button" variant="ghost" onClick={() => navigator.clipboard.writeText(content)}>
        Copiar brief
      </Button>
    </section>
  );
}
