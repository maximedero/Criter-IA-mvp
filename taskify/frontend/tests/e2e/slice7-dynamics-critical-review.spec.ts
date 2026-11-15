import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice7";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

async function createCase(page: import("@playwright/test").Page, title: string) {
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

async function setupSlice7DynamicsCase(page: import("@playwright/test").Page) {
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

test("slice7 dynamics critical review main flow", async ({ page }) => {
  await createCase(page, TITLE);
  await setupSlice7DynamicsCase(page);

  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();

  await expect(page.getByText("Vencimiento y continuidad requieren aclaración")).toBeVisible();
  await expect(page.getByText("Impacto cuantitativo sin sustento suficiente")).toBeVisible();
  await expect(page.getByText("Alternativa todavía no confirmada")).toBeVisible();
  await expect(page.getByText("Intervención requerida poco accionable")).toBeVisible();

  await expect(page.getByText("2 bloqueos abiertos")).toBeVisible();
  await expect(page.getByText("2 advertencias abiertas")).toBeVisible();
  await expect(page.getByText("No podés completar la revisión mientras existan bloqueos críticos abiertos.")).toBeVisible();

  const contradiction = page.locator("article", { hasText: "Vencimiento y continuidad requieren aclaración" });
  await contradiction.getByLabel("Aclaración").fill(
    "El contrato venció formalmente, pero existe una continuidad transitoria autorizada únicamente para finalizar el proyecto en curso."
  );
  await contradiction.getByRole("button", { name: "Aclarar" }).click();
  await expect(contradiction.getByText("Resuelto por aclaración")).toBeVisible();

  const unsupported = page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" });
  await unsupported.getByRole("button", { name: "Editar item" }).click();
  await unsupported.getByRole("button", { name: "Marcar como resuelto por edición" }).click();
  await expect(unsupported.getByText("Resuelto por edición")).toBeVisible();

  await page.getByRole("button", { name: "Editar" }).nth(3).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill("Existen usuarios potencialmente expuestos, pero todavía no contamos con información suficiente para cuantificarlos.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
  await page.getByRole("button", { name: "Guardar" }).click();

  const intervention = page.locator("article", { hasText: "Intervención requerida poco accionable" });
  await intervention.getByRole("button", { name: "Editar item" }).click();
  await intervention.getByRole("button", { name: "Marcar como resuelto por edición" }).click();

  await page.getByRole("button", { name: "Editar" }).nth(5).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill(
      "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
    );
  await page.getByLabel("Tipo epistemológico").last().selectOption("HUMAN_EVALUATION");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  await expect(page.getByText("1 advertencias abiertas")).toBeVisible();

  await page.getByRole("button", { name: "Completar revisión" }).click();
  await expect(page.getByText("Revisión completada. El caso puede avanzar a evaluación humana.").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toHaveCount(0);

  await page.reload();
  await page.getByRole("row", { name: new RegExp(TITLE) }).getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText("Revisión completada. El caso puede avanzar a evaluación humana.").first()).toBeVisible();
  await expect(page.locator("article", { hasText: "Alternativa todavía no confirmada" }).getByText("Abierto")).toBeVisible();
});

test("slice7 coverage degradation blocks completion", async ({ page }) => {
  await createCase(page, "Slice7 Coverage Degradation");
  await setupSlice7DynamicsCase(page);

  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();

  const unsupported = page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" });
  const intervention = page.locator("article", { hasText: "Intervención requerida poco accionable" });

  await unsupported.getByRole("button", { name: "Editar item" }).click();
  await unsupported.getByRole("button", { name: "Marcar como resuelto por edición" }).click();

  await intervention.getByRole("button", { name: "Editar item" }).click();
  await intervention.getByRole("button", { name: "Marcar como resuelto por edición" }).click();

  await page.getByRole("button", { name: "Eliminar" }).last().click();

  await expect(page.getByText("La cobertura mínima dejó de cumplirse después de los cambios.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Completar revisión" })).toBeDisabled();
  await expect(page.getByText("Revisión crítica pendiente.")).toBeVisible();
});
