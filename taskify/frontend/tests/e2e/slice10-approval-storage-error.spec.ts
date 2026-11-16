import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice10 Storage";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";

async function createCase(page: import("@playwright/test").Page, title = TITLE) {
  await page.goto("/");
  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(title);
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

async function setupCaseToReviewedBrief(page: import("@playwright/test").Page) {
  await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  await addItem(page, 0, "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT");
  await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  await addItem(page, 2, "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT");
  await addItem(page, 3, "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE");
  await addItem(page, 4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  await addItem(
    page,
    7,
    "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
    "HUMAN_EVALUATION"
  );

  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await page.getByRole("button", { name: "Completar revisión" }).click();
  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: "Alta" }).click();
  await page.getByRole("button", { name: "Guardar evaluación" }).click();
  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();

  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  await page.getByRole("tab", { name: "Brief ejecutivo" }).click();
  page.once("dialog", async (dialog) => {
    if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
      await dialog.accept();
    }
  });
  await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
}

test("approval storage error keeps BRIEF_DRAFT and not approved", async ({ page }) => {
  await createCase(page);
  await setupCaseToReviewedBrief(page);

  await page.evaluate(() => {
    localStorage.setItem(
      "dw.ai.observation",
      JSON.stringify({ analyzeNarrative: 0, suggestNextQuestion: 0, reviewCase: 0, generateBrief: 0 })
    );

    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "dw.humanBriefApprovals") {
        throw new Error("storage failure");
      }
      return original.call(this, key, value);
    };
  });

  await page.getByRole("button", { name: "Aprobar brief" }).click();
  await page.getByRole("button", { name: "Confirmar aprobación" }).click();

  await expect(page.getByRole("alert")).toHaveText("No se pudo guardar la aprobación.");

  const state = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const approvals = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");

    return {
      caseStatus: cases[0]?.status,
      approval: approvals[caseId],
      counters
    };
  });

  expect(state.caseStatus).toBe("BRIEF_DRAFT");
  expect(state.approval?.status).toBe("NOT_APPROVED");
  expect(state.counters.generateBrief).toBe(0);
  expect(state.counters.analyzeNarrative).toBe(0);
  expect(state.counters.suggestNextQuestion).toBe(0);
  expect(state.counters.reviewCase).toBe(0);
});
