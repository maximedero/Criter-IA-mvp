import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice9";
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

test("slice9 dynamics main flow", async ({ page }) => {
  await createCase(page);
  await setupCaseToBriefDraft(page);

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

  await expect(page.getByRole("button", { name: "Generar borrador de brief" })).toBeVisible();
  await page.getByRole("button", { name: "Generar borrador de brief" }).click();

  await expect(page.getByRole("tab", { name: "Brief ejecutivo" })).toBeVisible();
  await page.getByRole("tab", { name: "Brief ejecutivo" }).click();

  const briefRegion = page.getByRole("region", { name: "Preparación del brief" });

  await expect(
    briefRegion.getByText(
      "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual."
    )
  ).toBeVisible();
  await expect(
    briefRegion.getByText(
      "Actualmente no pueden iniciarse nuevos proyectos ni tareas. Esta restricción expone la capacidad de atender nuevas necesidades sobre las soluciones."
    )
  ).toBeVisible();
  await expect(
    briefRegion
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "Impactos posibles" }) })
      .locator("p")
      .first()
  ).toHaveText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.");
  await expect(
    briefRegion.getByText(
      "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses, según conocimiento aportado por el usuario."
    )
  ).toBeVisible();
  await expect(
    briefRegion.getByText(
      "No se conoce cuándo termina exactamente el proyecto actual ni cuál será la demanda de nuevos trabajos durante los próximos meses."
    )
  ).toBeVisible();
  await expect(
    briefRegion
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "Escenarios / alternativas" }) })
      .locator("p")
      .first()
  ).toHaveText("Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.");
  await expect(briefRegion.getByText("Gravedad: Alta")).toBeVisible();
  await expect(briefRegion.getByText("Evaluación realizada por el usuario.")).toBeVisible();
  await expect(
    briefRegion.getByText("Se necesita que el superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.")
  ).toBeVisible();

  await page.getByRole("tab", { name: "Vista expandida" }).click();
  await expect(briefRegion.getByRole("heading", { name: "Hechos" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Inferencias" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Supuestos" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Datos faltantes" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Evaluaciones humanas" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Warnings abiertos" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Findings resueltos" })).toBeVisible();
  await expect(briefRegion.getByRole("heading", { name: "Trazabilidad por sección" })).toBeVisible();

  await page.getByRole("tab", { name: "Brief ejecutivo" }).click();
  await page.getByRole("button", { name: "Editar Por qué importa" }).click();
  await page
    .getByLabel("Por qué importa")
    .fill(
      "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades."
    );
  await page.getByRole("button", { name: "Guardar edición" }).click();
  await expect(
    page.getByText(
      "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades."
    )
  ).toBeVisible();

  page.on("dialog", async (dialog) => {
    if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
      await dialog.accept();
    }
  });

  await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
  await expect(page.getByText("Brief revisado por el usuario.")).toBeVisible();
  await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  await expect(page.getByText(/aprobado|listo para elevar/i)).toHaveCount(0);

  const counters = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  expect(counters.generateBrief).toBe(1);
  expect(counters.analyzeNarrative).toBe(0);
  expect(counters.suggestNextQuestion).toBe(0);
  expect(counters.reviewCase).toBe(0);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();
  await page.getByRole("tab", { name: "Brief ejecutivo" }).click();

  await expect(page.getByText("Brief revisado por el usuario.")).toBeVisible();
  await expect(
    page.getByText(
      "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades."
    )
  ).toBeVisible();
  await expect(page.getByText("Gravedad: Alta")).toBeVisible();

  const countersAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  expect(countersAfterReload.generateBrief).toBe(1);
});
