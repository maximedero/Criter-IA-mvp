import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";

type Props = {
  controlText: string;
  aiText: string;
  onSubmitScores: (scores: Record<string, number>) => void;
};

const criteria = [
  "comprension_situacion",
  "comprension_relevancia",
  "claridad_consecuencias",
  "visibilidad_evidencia",
  "visibilidad_incertidumbre",
  "claridad_alternativas",
  "claridad_pedido",
  "determinar_proximo_paso"
] as const;

export function ComparisonPage({ controlText, aiText, onSubmitScores }: Props) {
  const scores: Record<string, number> = {};
  criteria.forEach((c) => {
    scores[c] = 3;
  });

  return (
    <section className="dw-comparison-page">
      <h2>Comparación ciega</h2>
      <div className="dw-comparison-page__grid">
        <article>{controlText}</article>
        <article>{aiText}</article>
      </div>
      <Button type="button" onClick={() => onSubmitScores(scores)}>
        Guardar evaluación
      </Button>
    </section>
  );
}
