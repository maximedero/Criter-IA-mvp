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

const SHAREPOINT_CASE: Phase8CaseDefinition = {
  key: "sharepoint",
  title: "Fase8 SharePoint Nintex",
  narrative:
    "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar.",
  severity: "Alta",
  questionPlan: [
    {
      question: "¿Qué procesos de negocio podrían interrumpirse si un workflow deja de funcionar?",
      mode: "ANSWER",
      answer: "Podrían interrumpirse circuitos administrativos y de aprobación documental en soluciones todavía no modernizadas."
    },
    {
      question: "¿Qué evidencia disponible respalda el estado actual de migración y las dependencias remanentes?",
      mode: "DONT_KNOW"
    },
    {
      question: "¿Qué información clave todavía falta para estimar la exposición de continuidad?",
      mode: "ANSWER",
      answer:
        "Falta relevar qué soluciones siguen en SharePoint 2016, qué procesos dependen de cada workflow y qué alternativa manual existe para cada caso."
    }
  ],
  manualAlternative:
    "Una alternativa es priorizar primero los workflows con mayor impacto operativo, pero requiere validación del criterio de prioridad.",
  manualScenario:
    "Si un workflow crítico deja de funcionar sin alternativa manual, podría detenerse temporalmente el proceso asociado.",
  humanIntervention:
    "Solicito patrocinio para completar el relevamiento de dependencias y definir un plan de mitigación de continuidad.",
  expectedCoverageHardestDimension: "EVIDENCE"
};

test("fase8-sharepoint valida flujo estructural completo", async ({ page }) => {
  await createCase(page, SHAREPOINT_CASE.title, SHAREPOINT_CASE.narrative);

  const suggestions = await acceptNarrativeSuggestions(page);
  await runContextualQuestions(page, SHAREPOINT_CASE);
  await addOptionalScenarioAndAlternative(page, SHAREPOINT_CASE);

  const reviewInit = await runCriticalReviewAndResolve(page);
  await runHumanSeverity(page, SHAREPOINT_CASE.severity);
  await generateAndReviewBrief(page);
  await runHumanApproval(page);

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();

  const metrics = await collectMetrics(page, SHAREPOINT_CASE, suggestions, reviewInit);
  savePhase8Artifact(metrics);

  expect(metrics.approval.finalStatus).toBe("READY_TO_ESCALATE");
});
