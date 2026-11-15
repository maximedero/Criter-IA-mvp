import { expect, test } from "@playwright/test";
import {
  type Phase8CaseDefinition,
  collectMetrics,
  createCase,
  generateAndReviewBrief,
  runContextualQuestions,
  runCriticalReviewAndResolve,
  runHumanApproval,
  runHumanSeverity,
  savePhase8Artifact,
  acceptNarrativeSuggestions,
  addOptionalScenarioAndAlternative
} from "./fase8-workflow-utils";

const PRODUCCION_CASE: Phase8CaseDefinition = {
  key: "produccion",
  title: "Fase8 Producción",
  narrative:
    "Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha. Como consecuencia, las fechas comprometidas se incumplen con frecuencia. Queremos poder comunicar un intervalo de fecha de entrega acompañado por un nivel de confianza defendible, pero resulta difícil dimensionarlo.",
  severity: "Media",
  questionPlan: [
    {
      question: "¿Qué compromisos o áreas quedan más expuestos cuando se incumple una fecha comprometida?",
      mode: "ANSWER",
      answer: "Quedan expuestos los compromisos con clientes y la coordinación entre planificación, producción y despacho."
    },
    {
      question: "¿Qué consecuencias operativas concretas se observan cuando no se cumple la fecha comprometida?",
      mode: "ANSWER",
      answer: "Se reprograman órdenes, se descoordina la cadena interna y se deteriora la previsibilidad de entrega comprometida."
    },
    {
      question: "¿Qué información histórica o registros internos hoy existen sobre cumplimiento de fechas?",
      mode: "ANSWER",
      answer: "Existen registros operativos dispersos por área, pero todavía no están consolidados en un indicador común de cumplimiento."
    },
    {
      question: "¿Qué datos cuantitativos faltan para estimar un nivel de confianza de entrega?",
      mode: "ANSWER",
      answer:
        "Faltan series históricas comparables por etapa, variabilidad por proceso y trazabilidad de cuellos de botella. Se requiere análisis cuantitativo externo."
    }
  ],
  manualAlternative:
    "Una alternativa es comprometer ventanas de entrega por etapa crítica en lugar de una fecha puntual hasta contar con base cuantitativa suficiente.",
  manualScenario:
    "Si la variabilidad operativa se mantiene sin medición comparable, la confiabilidad de los compromisos seguirá siendo baja.",
  humanIntervention:
    "Solicito definir un alcance de medición y patrocinio para un análisis cuantitativo externo sobre cumplimiento de fechas.",
  expectedCoverageHardestDimension: "EVIDENCE"
};

test("fase8-produccion valida flujo estructural completo", async ({ page }) => {
  await createCase(page, PRODUCCION_CASE.title, PRODUCCION_CASE.narrative);

  const suggestions = await acceptNarrativeSuggestions(page);
  await runContextualQuestions(page, PRODUCCION_CASE);
  await addOptionalScenarioAndAlternative(page, PRODUCCION_CASE);

  const reviewInit = await runCriticalReviewAndResolve(page);
  await runHumanSeverity(page, PRODUCCION_CASE.severity);
  await generateAndReviewBrief(page);
  await runHumanApproval(page);

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();

  const metrics = await collectMetrics(page, PRODUCCION_CASE, suggestions, reviewInit);
  savePhase8Artifact(metrics);

  expect(metrics.approval.finalStatus).toBe("READY_TO_ESCALATE");
});
