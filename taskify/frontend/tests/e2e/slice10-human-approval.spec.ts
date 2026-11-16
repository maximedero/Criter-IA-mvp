import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice10";
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

  await expect(page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/)).toBeVisible();

  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  await page.getByRole("button", { name: "Completar revisión" }).click();

  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: "Alta" }).click();
  await page.getByRole("button", { name: "Guardar evaluación" }).click();
  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();

  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  page.once("dialog", async (dialog) => {
    if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
      await dialog.accept();
    }
  });
  await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
}

test("slice10 dynamics human approval flow", async ({ page }) => {
  await createCase(page);
  await setupCaseToReviewedBrief(page);

  await page.evaluate(() => {
    const zero = {
      analyzeNarrative: 0,
      suggestNextQuestion: 0,
      reviewCase: 0,
      generateBrief: 0
    };
    localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  });

  await expect(page.getByRole("heading", { name: "APROBACIÓN HUMANA" })).toBeVisible();
  await expect(page.getByText("Se cumplen las condiciones para aprobar el brief.")).toBeVisible();
  await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();

  await page.getByRole("button", { name: "Aprobar brief" }).click();

  const dialog = page.getByRole("dialog", { name: "Confirmar aprobación" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Estás por marcar este caso como LISTO PARA ELEVAR.")).toBeVisible();
  await expect(dialog).toContainText("Caso");
  await expect(dialog).toContainText(TITLE);
  await expect(dialog).toContainText("Versión del brief");
  await expect(dialog).toContainText("v1");
  await expect(dialog).toContainText("Gravedad");
  await expect(dialog).toContainText("Alta");
  await expect(dialog.getByText("Evaluación de gravedad realizada por el usuario.")).toBeVisible();

  await dialog.getByRole("button", { name: "Cancelar" }).click();

  const afterCancel = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const approvals = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return {
      caseStatus: cases[0]?.status,
      approval: approvals[caseId] ?? null,
      counters
    };
  });

  expect(afterCancel.caseStatus).toBe("BRIEF_DRAFT");
  expect(afterCancel.approval?.status).toBe("NOT_APPROVED");
  expect(afterCancel.approval?.approvedAt).toBeNull();
  expect(afterCancel.counters.generateBrief).toBe(0);
  expect(afterCancel.counters.analyzeNarrative).toBe(0);
  expect(afterCancel.counters.suggestNextQuestion).toBe(0);
  expect(afterCancel.counters.reviewCase).toBe(0);

  await page.getByRole("button", { name: "Aprobar brief" }).click();
  await page.getByRole("button", { name: "Confirmar aprobación" }).click();

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();
  await expect(page.getByText("El brief fue revisado y aprobado por el usuario.").first()).toBeVisible();
  await expect(page.getByText("Aprobación realizada por el usuario.").first()).toBeVisible();
  await expect(
    page.getByText("Listo para elevar indica preparación del brief, no aprobación de la decisión por parte del destinatario.")
  ).toBeVisible();

  const afterConfirm = await page.evaluate(() => {
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

  expect(afterConfirm.caseStatus).toBe("READY_TO_ESCALATE");
  expect(afterConfirm.approval.status).toBe("APPROVED");
  expect(afterConfirm.approval.approvedBy).toBe("USER");
  expect(afterConfirm.approval.confirmedBriefVersion).toBe(1);
  expect(afterConfirm.approval.approvedAt).toBeTruthy();
  expect(Array.isArray(afterConfirm.approval.checklistSnapshot.checks)).toBe(true);

  expect(afterConfirm.counters.generateBrief).toBe(0);
  expect(afterConfirm.counters.analyzeNarrative).toBe(0);
  expect(afterConfirm.counters.suggestNextQuestion).toBe(0);
  expect(afterConfirm.counters.reviewCase).toBe(0);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();
  await expect(page.getByText("Este brief corresponde a una versión aprobada.")).toBeVisible();

  const afterReload = await page.evaluate(() => {
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return counters;
  });

  expect(afterReload.generateBrief).toBe(0);
  expect(afterReload.analyzeNarrative).toBe(0);
  expect(afterReload.suggestNextQuestion).toBe(0);
  expect(afterReload.reviewCase).toBe(0);
});
