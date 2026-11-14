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
    <section>
      <h2>Comparación ciega</h2>
      <div>
        <article>{controlText}</article>
        <article>{aiText}</article>
      </div>
      <button onClick={() => onSubmitScores(scores)}>Guardar evaluación</button>
    </section>
  );
}
