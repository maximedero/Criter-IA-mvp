import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice9 Preconditions";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";

async function createCase(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();
}

async function addItem(page: import("@playwright/test").Page, sectionIndex: number, content: string, epistemicType = "FACT") {
  await page.getByRole("button", { name: "+ Agregar" }).nth(sectionIndex).click();
  await page.getByLabel("Contenido").last().fill(content);
  await page.getByLabel("Tipo epistemológico").last().selectOption(epistemicType);
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
}

async function setupCaseToBriefDraft(page: import("@playwright/test").Page) {
  await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  await addItem(page, 0, "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT");
  await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  await addItem(page, 2, "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT");
  await addItem(page, 3, "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE");
  await addItem(page, 4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  await addItem(page, 4, "No conocemos la demanda de nuevos trabajos durante los próximos meses.", "MISSING_INFORMATION");
  await addItem(page, 6, "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.", "ASSUMPTION");
  await addItem(
    page,
    7,
    "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
    "HUMAN_EVALUATION"
  );

  await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  await page.getByRole("button", { name: "Completar revisión" }).click();

  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: "Alta" }).click();
  await page
    .getByLabel("Fundamento de la evaluación (opcional)")
    .fill(
      "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
    );
  await page.getByRole("button", { name: "Guardar evaluación" }).click();
  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();

  await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
}

test("blocks brief actions when a generation precondition is revoked", async ({ page }) => {
  await createCase(page);
  await setupCaseToBriefDraft(page);

  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  await expect(page.getByRole("tab", { name: "Brief ejecutivo" })).toBeVisible();

  const baseline = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
    return {
      caseId,
      brief: briefMap[caseId],
      severity: severityMap[caseId]
    };
  });

  expect(baseline.brief.current.status).toBe("GENERATED");
  expect(baseline.severity.severity).toBe("HIGH");

  await page.evaluate(() => {
    const zero = {
      analyzeNarrative: 0,
      suggestNextQuestion: 0,
      reviewCase: 0,
      generateBrief: 0
    };

    (window as unknown as {
      __DW_AI_OBSERVATION__?: {
        analyzeNarrative: number;
        suggestNextQuestion: number;
        reviewCase: number;
        generateBrief: number;
      };
    }).__DW_AI_OBSERVATION__ = zero;

    localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  });

  const canvasRegion = page.locator("section").filter({ has: page.getByRole("heading", { name: "Decision Canvas" }) }).first();
  const interventionSection = canvasRegion.locator("section").filter({ has: page.getByRole("heading", { name: "Intervención requerida" }) }).first();
  const interventionCard = interventionSection.locator("article").filter({
    hasText: "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
  });
  await interventionCard.getByRole("button", { name: "Eliminar" }).click();

  const coverageAfterRevoke = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
    const items = (canvas[caseId] ?? []) as Array<{ dimension: string; validationStatus: string }>;
    const active = items.filter((item) => item.validationStatus !== "REJECTED");
    const required = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
    const covered = required.filter((dimension) => active.some((item) => item.dimension === dimension)).length;
    return { covered, hasIntervention: active.some((item) => item.dimension === "INTERVENTION") };
  });

  expect(coverageAfterRevoke.covered).toBe(5);
  expect(coverageAfterRevoke.hasIntervention).toBe(false);
  await expect(page.getByText(/5 de 6 dimensiones mínimas cubiertas\.?/)).toBeVisible();
  await expect(interventionSection.getByRole("heading", { name: "Intervención requerida" })).toBeVisible();

  await expect(page.locator('p[role="alert"]', { hasText: "La cobertura mínima ya no está completa." })).toBeVisible();

  const regenerateButton = page.getByRole("button", { name: "Regenerar borrador" });
  const generateButton = page.getByRole("button", { name: "Generar borrador de brief" });

  if (await regenerateButton.isVisible()) {
    if (await regenerateButton.isEnabled()) {
      page.once("dialog", async (dialog) => {
        await dialog.dismiss();
      });
      await regenerateButton.click();
    } else {
      await expect(regenerateButton).toBeDisabled();
    }
  } else {
    await expect(generateButton).toBeDisabled();
  }

  await expect(page.locator('p[role="alert"]', { hasText: "La cobertura mínima ya no está completa." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Marcar brief como revisado" })).toBeDisabled();

  const afterBlockedAttempt = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");

    return {
      caseStatus: cases[0]?.status,
      brief: briefMap[caseId],
      severity: severityMap[caseId],
      counters
    };
  });

  expect(afterBlockedAttempt.caseStatus).toBe("BRIEF_DRAFT");
  expect(afterBlockedAttempt.brief.current.status).toBe("GENERATED");
  expect(afterBlockedAttempt.brief.current.version).toBe(1);
  expect(afterBlockedAttempt.severity.severity).toBe("HIGH");
  expect(afterBlockedAttempt.severity.rationale).toContain("Considero alta la gravedad");

  expect(afterBlockedAttempt.counters.generateBrief).toBe(0);
  expect(afterBlockedAttempt.counters.analyzeNarrative).toBe(0);
  expect(afterBlockedAttempt.counters.suggestNextQuestion).toBe(0);
  expect(afterBlockedAttempt.counters.reviewCase).toBe(0);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText(/5 de 6 dimensiones mínimas cubiertas\.?/)).toBeVisible();
  await expect(page.locator('p[role="alert"]', { hasText: "La cobertura mínima ya no está completa." })).toBeVisible();

  const afterReload = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");

    return {
      brief: briefMap[caseId],
      severity: severityMap[caseId],
      counters
    };
  });

  expect(afterReload.brief.current.status).toBe("GENERATED");
  expect(afterReload.severity.severity).toBe("HIGH");
  expect(afterReload.counters.generateBrief).toBe(0);
  expect(afterReload.counters.analyzeNarrative).toBe(0);
  expect(afterReload.counters.suggestNextQuestion).toBe(0);
  expect(afterReload.counters.reviewCase).toBe(0);
});
