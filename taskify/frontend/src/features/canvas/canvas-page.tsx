import { useEffect, useState } from "react";
import { createStatement, listStatements, Statement } from "../../services/api-client";
import { StatementCard } from "./statement-card";
import { QuestionPanel } from "./question-panel";

const dimensions = [
  "contexto_senal",
  "exposicion",
  "evidencia",
  "impactos",
  "incertidumbres",
  "escenarios",
  "alternativas",
  "intervencion_requerida"
] as const;

type Props = {
  caseId: string;
};

export function CanvasPage({ caseId }: Props) {
  const [statements, setStatements] = useState<Statement[]>([]);

  const refresh = async () => {
    const data = await listStatements(caseId);
    setStatements(data);
  };

  useEffect(() => {
    refresh();
  }, [caseId]);

  const addDraftStatement = async (dimensionType: string) => {
    await createStatement(caseId, {
      dimensionType,
      content: `Pendiente en ${dimensionType}`,
      epistemicType: "dato_faltante"
    });
    await refresh();
  };

  return (
    <main>
      <h1>Decision Canvas</h1>
      <QuestionPanel caseId={caseId} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {dimensions.map((dimension) => {
          const first = statements.find((s) => s.dimensionType === dimension);
          return (
            <section key={dimension}>
              <h2>{dimension}</h2>
              <StatementCard statement={first} />
              <button onClick={() => addDraftStatement(dimension)}>Agregar elemento</button>
            </section>
          );
        })}
      </div>
    </main>
  );
}
