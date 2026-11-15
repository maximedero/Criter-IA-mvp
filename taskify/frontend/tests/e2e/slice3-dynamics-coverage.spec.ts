import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

test("slice3 dynamics coverage engine flow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();

  await page.getByRole("button", { name: "Abrir" }).click();

  await page.getByRole("button", { name: "+ Agregar" }).first().click();
  await page.getByLabel("Contenido").fill("El contrato con el proveedor venció el 31/10/2026.");
  await page.locator("form").first().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(1).click();
  await page.getByLabel("Contenido").last().fill("Actualmente no pueden iniciarse nuevos proyectos ni tareas.");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill(
      "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario."
    );
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill("Nuevas necesidades sobre las soluciones podrían quedar sin capacidad de atención externa.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill("No conocemos cuándo termina exactamente el proyecto actual.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(7).click();
  await page
    .getByLabel("Contenido")
    .last()
    .fill(
      "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
    );
  await page.getByLabel("Tipo epistemológico").last().selectOption("HUMAN_EVALUATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
  await expect(page.getByText("Listo para elevar")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
  await expect(page.getByText("Listo para elevar")).toHaveCount(0);
});
