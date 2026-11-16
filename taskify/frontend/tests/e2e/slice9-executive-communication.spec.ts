import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 ExecutiveCommunication";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";

async function createCase(page: import("@playwright/test").Page, title = TITLE, narrative = NARRATIVE) {
  await page.goto("/");
  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("¿Qué está pasando?").fill(narrative);
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

  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await page.getByRole("button", { name: "Completar revisión" }).click();

  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: "Alta" }).click();
  await page.getByRole("button", { name: "Guardar evaluación" }).click();
  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();

  await page.evaluate(() => {
    const zero = {
      analyzeNarrative: 0,
      suggestNextQuestion: 0,
      reviewCase: 0,
      generateBrief: 0
    };

    (window as unknown as { __DW_AI_OBSERVATION__?: typeof zero }).__DW_AI_OBSERVATION__ = zero;
    localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  });

  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  await expect(page.getByRole("tab", { name: "Comunicación ejecutiva" })).toBeVisible();
}

test("copia correo y mensaje, maneja error de clipboard, edición y persistencia sin afectar workflow", async ({ page }) => {
  await createCase(page);
  await setupCaseToBriefDraft(page);

  const clipboardState = await page.evaluate(() => {
    const state = {
      mode: "ok" as "ok" | "fail",
      value: ""
    };

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText(text: string) {
          if (state.mode === "fail") {
            return Promise.reject(new Error("fail"));
          }
          state.value = text;
          return Promise.resolve();
        }
      }
    });

    (window as unknown as { __EXEC_CLIPBOARD__?: typeof state }).__EXEC_CLIPBOARD__ = state;
    return true;
  });
  expect(clipboardState).toBe(true);

  const baseline = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const approval = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
    return {
      caseId,
      caseStatus: cases[0]?.status,
      briefStatus: briefs[caseId]?.current?.status,
      reviewedByUser: briefs[caseId]?.current?.reviewedByUser,
      approval: approval[caseId] ?? null,
      counters: JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}")
    };
  });

  await page.getByRole("button", { name: "Copiar como correo" }).click();
  await expect(page.getByText("Correo copiado.")).toBeVisible();

  const copiedEmail = await page.evaluate(() => {
    const state = (window as unknown as { __EXEC_CLIPBOARD__?: { value: string } }).__EXEC_CLIPBOARD__;
    return state?.value ?? "";
  });

  expect(copiedEmail.startsWith("Asunto: ")).toBe(true);
  expect(copiedEmail.includes("\n\n")).toBe(true);

  await page.getByRole("button", { name: "Copiar como mensaje" }).click();
  await expect(page.getByText("Mensaje copiado.")).toBeVisible();

  const copiedMessage = await page.evaluate(() => {
    const state = (window as unknown as { __EXEC_CLIPBOARD__?: { value: string } }).__EXEC_CLIPBOARD__;
    return state?.value ?? "";
  });

  expect(copiedMessage.startsWith("Asunto:")).toBe(false);
  expect(copiedMessage.includes("dw-")).toBe(false);

  await page.evaluate(() => {
    const state = (window as unknown as { __EXEC_CLIPBOARD__?: { mode: "ok" | "fail" } }).__EXEC_CLIPBOARD__;
    if (state) {
      state.mode = "fail";
    }
  });

  await page.getByRole("button", { name: "Copiar como mensaje" }).click();
  await expect(page.getByText("No se pudo copiar el contenido. Seleccionalo manualmente.")).toBeVisible();
  await expect(page.getByText(/Resumen ejecutivo|Contrato vencido|continuidad transitoria/i).first()).toBeVisible();

  await page.getByRole("button", { name: "Editar mensaje" }).click();
  const editedMessage = "Texto exacto editado para mensaje ejecutivo.";
  await page.getByLabel("Mensaje").fill(editedMessage);
  await page.getByRole("button", { name: "Guardar edición" }).click();
  await expect(page.getByText(editedMessage)).toBeVisible();

  const afterEdit = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const current = briefs[caseId]?.current;
    const approval = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
    return {
      caseStatus: cases[0]?.status,
      briefStatus: current?.status,
      reviewedByUser: current?.reviewedByUser,
      messageBody: current?.communication?.message?.body,
      messageEditedByUser: current?.communication?.message?.editedByUser,
      messageUpdatedAt: current?.communication?.message?.updatedAt,
      severity: current?.executive?.severity?.value,
      approval: approval[caseId] ?? null,
      counters: JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}")
    };
  });

  expect(afterEdit.messageBody).toBe(editedMessage);
  expect(afterEdit.messageEditedByUser).toBe(true);
  expect(typeof afterEdit.messageUpdatedAt).toBe("string");
  expect(afterEdit.messageUpdatedAt.length).toBeGreaterThan(0);
  expect(afterEdit.caseStatus).toBe(baseline.caseStatus);
  expect(afterEdit.severity).toBe("HIGH");
  expect(afterEdit.counters.generateBrief).toBe(1);
  expect(afterEdit.counters.reviewCase).toBe(0);
  expect(afterEdit.counters.analyzeNarrative).toBe(0);
  expect(afterEdit.counters.suggestNextQuestion).toBe(0);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByRole("tab", { name: "Comunicación ejecutiva" })).toBeVisible();
  await expect(page.getByText(editedMessage)).toBeVisible();

  const afterReload = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const current = briefs[caseId]?.current;
    return {
      messageBody: current?.communication?.message?.body,
      messageEditedByUser: current?.communication?.message?.editedByUser
    };
  });

  expect(afterReload.messageBody).toBe(editedMessage);
  expect(afterReload.messageEditedByUser).toBe(true);
});

test("stale bloquea copias y regeneración reactiva copy con nueva versión", async ({ page }) => {
  await createCase(page, "Dynamics stale communication");
  await setupCaseToBriefDraft(page);

  await page.evaluate(() => {
    const state = { value: "" };
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText(text: string) {
          state.value = text;
          return Promise.resolve();
        }
      }
    });
    (window as unknown as { __EXEC_CLIPBOARD__?: typeof state }).__EXEC_CLIPBOARD__ = state;
  });

  const baseline = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    return { caseId, version: briefs[caseId]?.current?.version, stale: briefs[caseId]?.stale };
  });

  expect(baseline.version).toBe(1);
  expect(baseline.stale).toBe(false);

  const canvasRegion = page.locator("section").filter({ has: page.getByRole("heading", { name: "Decision Canvas" }) }).first();
  const impactsSection = canvasRegion.locator("section").filter({ has: page.getByRole("heading", { name: "Impactos posibles" }) }).first();

  const originalImpactCard = impactsSection.locator("article").filter({
    hasText: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
  });

  await originalImpactCard.getByRole("button", { name: "Editar" }).click();
  await impactsSection.locator("form").getByLabel("Contenido").fill(
    "Nuevas necesidades correctivas y evolutivas podrían quedar temporalmente sin capacidad de atención externa."
  );
  await impactsSection.locator("form").getByRole("button", { name: "Guardar" }).click();

  await expect(page.locator('p[role="alert"]', { hasText: "El análisis cambió después de generar este brief." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar como correo" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Copiar como mensaje" })).toBeDisabled();

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Regenerar borrador" }).click();

  await expect(page.getByText("El análisis cambió después de generar este brief.")).toHaveCount(0);

  const afterRegenerate = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const current = briefs[caseId]?.current;
    return {
      stale: briefs[caseId]?.stale,
      version: current?.version,
      emailBody: current?.communication?.email?.body,
      messageBody: current?.communication?.message?.body
    };
  });

  expect(afterRegenerate.stale).toBe(false);
  expect(afterRegenerate.version).toBe(2);
  expect(afterRegenerate.emailBody).toContain("Nuevas necesidades correctivas y evolutivas podrían quedar temporalmente sin capacidad de atención externa.");
  expect(afterRegenerate.messageBody).toContain("Incertidumbre principal");

  await page.getByRole("button", { name: "Copiar como mensaje" }).click();
  await expect(page.getByText("Mensaje copiado.")).toBeVisible();
});
