import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice8";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

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

async function setupCaseToCriticalReview(page: import("@playwright/test").Page) {
  await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  await addItem(page, 0, "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.", "FACT");
  await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  await addItem(page, 2, "El respaldo documental todavía no está consolidado para cuantificar afectados.", "FACT");
  await addItem(page, 3, "200 usuarios quedarán sin servicio.", "FACT");
  await addItem(page, 4, "No conocemos el plazo definitivo de contratación.", "MISSING_INFORMATION");
  await addItem(page, 6, "Una prórroga contractual podría ser una alternativa.", "ASSUMPTION");
  await addItem(page, 7, "Que mi jefe vea el tema.", "HUMAN_EVALUATION");

  await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await expect(page.getByRole("heading", { name: "REVISIÓN CRÍTICA" })).toBeVisible();
}

async function resolveBlockersAndCompleteReview(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await expect(page.getByText("Impacto cuantitativo sin sustento suficiente")).toBeVisible();

  await page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" }).getByRole("button", { name: "Editar item" }).click();
  await page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" }).getByRole("button", { name: "Marcar como resuelto por edición" }).click();

  await page.locator("article", { hasText: "Intervención requerida poco accionable" }).getByRole("button", { name: "Editar item" }).click();
  await page.locator("article", { hasText: "Intervención requerida poco accionable" }).getByRole("button", { name: "Marcar como resuelto por edición" }).click();

  await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  await expect(page.getByText(/\d+ advertencias abiertas/)).toBeVisible();

  await page.getByRole("button", { name: "Completar revisión" }).click();
  await expect(page.getByText("Revisión completada. El caso puede avanzar a evaluación humana.").first()).toBeVisible();
}

test("slice8 dynamics human severity main flow", async ({ page }) => {
  await createCase(page);
  await setupCaseToCriticalReview(page);
  await resolveBlockersAndCompleteReview(page);

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

  await expect(page.getByRole("button", { name: "Avanzar a evaluación humana" })).toBeVisible();
  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();

  await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Sin evaluar" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Baja" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Media" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Alta" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Crítica" })).not.toBeChecked();
  await expect(page.getByText("Evaluación realizada por el usuario.")).toBeVisible();

  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  await expect(page.getByText("Seleccioná una gravedad antes de continuar.")).toBeVisible();

  await page.getByRole("radio", { name: "Alta" }).click();
  await page
    .getByLabel("Fundamento de la evaluación (opcional)")
    .fill(
      "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
    );
  await page.getByRole("button", { name: "Guardar evaluación" }).click();

  await expect(page.getByText("Evaluación guardada.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  await expect(page.getByText(/Advertencias abiertas: \d+/)).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByRole("radio", { name: "Alta" })).toBeChecked();
  await expect(page.getByLabel("Fundamento de la evaluación (opcional)")).toHaveValue(
    "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
  );
  await expect(page.getByText("Evaluación realizada por el usuario.")).toBeVisible();
  await expect(page.getByText(/Advertencias abiertas: \d+/)).toBeVisible();

  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  await expect(page.getByText("El caso está listo para preparar el brief.")).toBeVisible();

  await expect(page.getByText(/Resumen ejecutivo|vista expandida|Aprobar brief|READY_TO_ESCALATE/i)).toHaveCount(0);

  const counters = await page.evaluate(() => {
    const raw = localStorage.getItem("dw.ai.observation");
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as {
      analyzeNarrative: number;
      suggestNextQuestion: number;
      reviewCase: number;
      generateBrief: number;
    };
  });

  expect(counters?.analyzeNarrative).toBe(0);
  expect(counters?.suggestNextQuestion).toBe(0);
  expect(counters?.reviewCase).toBe(0);
  expect(counters?.generateBrief).toBe(0);
});

test("slice8 gate revoked by coverage degradation", async ({ page }) => {
  await createCase(page, "Slice8 Gate Revoked");
  await setupCaseToCriticalReview(page);
  await resolveBlockersAndCompleteReview(page);

  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: "Alta" }).click();
  await page.getByLabel("Fundamento de la evaluación (opcional)").fill("texto humano");
  await page.getByRole("button", { name: "Guardar evaluación" }).click();

  await page.getByRole("button", { name: "Eliminar" }).nth(5).click();
  await expect(page.getByText("5 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByText("Faltan dimensiones para cobertura mínima.")).toBeVisible();

  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Faltan dimensiones para cobertura mínima." })).toBeVisible();

  await expect(page.getByRole("radio", { name: "Alta" })).toBeChecked();
  await expect(page.getByLabel("Fundamento de la evaluación (opcional)")).toHaveValue("texto humano");
  await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
});
