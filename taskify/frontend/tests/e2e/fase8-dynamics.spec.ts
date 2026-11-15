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

const DYNAMICS_CASE: Phase8CaseDefinition = {
  key: "dynamics",
  title: "Fase8 Dynamics 365",
  narrative:
    "El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones.",
  severity: "Alta",
  questionPlan: [
    {
      question: "¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?",
      mode: "ANSWER",
      answer: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
    },
    {
      question: "¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?",
      mode: "ANSWER",
      answer: "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario."
    },
    {
      question: "¿Qué información relevante todavía no conocés para evaluar este riesgo?",
      mode: "ANSWER",
      answer: "No conocemos cuándo termina exactamente el proyecto actual ni la demanda de nuevos trabajos de mantenimiento en los próximos meses."
    },
    {
      question: "¿Qué necesitás concretamente que tu superior comprenda, consulte, priorice, autorice, decida o escale?",
      mode: "ANSWER",
      answer: "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
    }
  ],
  manualAlternative: "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.",
  manualScenario: "Si la contratación se demora más de lo esperado, podrían acumularse necesidades sin cobertura externa.",
  humanIntervention:
    "Solicito que el nivel superior priorice una decisión sobre alternativas contractuales y un plan de continuidad operativa.",
  expectedCoverageHardestDimension: "INTERVENTION"
};

test("fase8-dynamics valida flujo estructural completo", async ({ page }) => {
  await createCase(page, DYNAMICS_CASE.title, DYNAMICS_CASE.narrative);

  const suggestions = await acceptNarrativeSuggestions(page);
  await runContextualQuestions(page, DYNAMICS_CASE);
  await addOptionalScenarioAndAlternative(page, DYNAMICS_CASE);

  const reviewInit = await runCriticalReviewAndResolve(page);
  await runHumanSeverity(page, DYNAMICS_CASE.severity);
  await generateAndReviewBrief(page);
  await runHumanApproval(page);

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();

  const metrics = await collectMetrics(page, DYNAMICS_CASE, suggestions, reviewInit);
  savePhase8Artifact(metrics);

  expect(metrics.approval.finalStatus).toBe("READY_TO_ESCALATE");
});
