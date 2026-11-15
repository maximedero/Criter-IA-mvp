import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice9 Stale";
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

test("marks a generated brief stale and requires explicit regeneration", async ({ page }) => {
  await createCase(page);
  await setupCaseToBriefDraft(page);

  const briefRegion = page.getByRole("region", { name: "Preparación del brief" });

  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  await expect(page.getByRole("tab", { name: "Brief ejecutivo" })).toBeVisible();

  await page.getByRole("button", { name: "Editar Por qué importa" }).click();
  const editedExecutiveText =
    "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades.";
  await page.getByLabel("Por qué importa").fill(editedExecutiveText);
  await page.getByRole("button", { name: "Guardar edición" }).click();

  const initialBriefState = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    return briefs[caseId] ?? null;
  });

  expect(initialBriefState?.stale).toBe(false);
  expect(initialBriefState?.current?.version).toBe(1);
  await expect(page.getByText("El análisis cambió después de generar este brief.")).toHaveCount(0);

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
  const impactsSection = canvasRegion.locator("section").filter({ has: page.getByRole("heading", { name: "Impactos posibles" }) }).first();

  const updatedImpactText =
    "Nuevas necesidades correctivas y evolutivas podrían quedar temporalmente sin capacidad de atención externa.";

  const originalImpactCard = impactsSection.locator("article").filter({
    hasText: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
  });

  await originalImpactCard.getByRole("button", { name: "Editar" }).click();
  await impactsSection.locator("form").getByLabel("Contenido").fill(updatedImpactText);
  await impactsSection.locator("form").getByRole("button", { name: "Guardar" }).click();
  await expect(impactsSection.getByText(updatedImpactText)).toBeVisible();

  const updatedCanvasImpact = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
    const items = (canvas[caseId] ?? []) as Array<{ dimension: string; content: string }>;
    return items.find((item) => item.dimension === "IMPACT")?.content ?? null;
  });

  expect(updatedCanvasImpact).toBe(updatedImpactText);

  await expect(page.locator('p[role="alert"]', { hasText: "El análisis cambió después de generar este brief." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Regenerar borrador" })).toBeVisible();
  await expect(page.getByText(editedExecutiveText)).toBeVisible();
  await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();

  const staleRecord = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    return briefs[caseId] ?? null;
  });

  expect(staleRecord?.stale).toBe(true);
  expect(staleRecord?.current?.version).toBe(1);

  const countersBeforeRegenerate = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  expect(countersBeforeRegenerate.generateBrief).toBe(0);
  expect(countersBeforeRegenerate.analyzeNarrative).toBe(0);
  expect(countersBeforeRegenerate.suggestNextQuestion).toBe(0);
  expect(countersBeforeRegenerate.reviewCase).toBe(0);

  await expect(page.getByRole("button", { name: "Marcar brief como revisado" })).toBeDisabled();

  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Regenerar borrador" }).click();

  const afterCancel = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return { brief: briefs[caseId], counters };
  });

  expect(afterCancel.counters.generateBrief).toBe(0);
  expect(afterCancel.brief.current.version).toBe(1);
  expect(afterCancel.brief.stale).toBe(true);

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Regenerar borrador" }).click();

  await expect(page.getByText("El análisis cambió después de generar este brief.")).toHaveCount(0);
  const afterRegenerate = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return { caseStatus: cases[0]?.status, brief: briefs[caseId], counters };
  });

  expect(afterRegenerate.counters.generateBrief).toBe(1);
  expect(afterRegenerate.counters.analyzeNarrative).toBe(0);
  expect(afterRegenerate.counters.suggestNextQuestion).toBe(0);
  expect(afterRegenerate.counters.reviewCase).toBe(0);

  expect(afterRegenerate.caseStatus).toBe("BRIEF_DRAFT");
  expect(afterRegenerate.brief.current.version).toBe(2);
  expect(afterRegenerate.brief.current.status).toBe("GENERATED");
  expect(afterRegenerate.brief.current.reviewedByUser).toBe(false);
  expect(afterRegenerate.brief.current.reviewedAt).toBeNull();
  expect(afterRegenerate.brief.stale).toBe(false);
  expect(afterRegenerate.brief.current.executive.possibleImpacts.content).toBe(updatedImpactText);
  expect(afterRegenerate.brief.current.expanded.inferences.some((item: { content: string }) => item.content === updatedImpactText)).toBe(true);
  expect(afterRegenerate.brief.history.length).toBeGreaterThan(0);
  expect(afterRegenerate.brief.history[afterRegenerate.brief.history.length - 1].version).toBe(1);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();

  const afterReload = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return { brief: briefs[caseId], counters };
  });

  expect(afterReload.brief.current.version).toBe(2);
  expect(afterReload.brief.current.executive.possibleImpacts.content).toBe(updatedImpactText);
  expect(afterReload.brief.current.expanded.inferences.some((item: { content: string }) => item.content === updatedImpactText)).toBe(true);
  expect(afterReload.brief.history.length).toBeGreaterThan(0);
  expect(afterReload.brief.stale).toBe(false);
  expect(afterReload.counters.generateBrief).toBe(1);
});
