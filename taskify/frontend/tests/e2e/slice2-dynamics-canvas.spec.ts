import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

const CONTEXT_CONTENT = "El contrato con el proveedor venció el 31/10/2026.";
const UNCERTAINTY_CONTENT = "No conocemos cuándo termina exactamente el proyecto actual.";

test("slice2 dynamics manual canvas flow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();

  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByRole("heading", { name: "Decision Canvas" })).toBeVisible();

  await page.getByRole("button", { name: "+ Agregar" }).first().click();
  await page.getByLabel("Contenido").fill(CONTEXT_CONTENT);
  await page.locator("form").first().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
  await page.getByLabel("Contenido").last().fill(UNCERTAINTY_CONTENT);
  await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await expect(page.getByText(CONTEXT_CONTENT, { exact: true })).toBeVisible();
  await expect(page.getByText(UNCERTAINTY_CONTENT, { exact: true })).toBeVisible();

  await page.reload();

  await page.getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByText(CONTEXT_CONTENT, { exact: true })).toBeVisible();
  await expect(page.getByText(UNCERTAINTY_CONTENT, { exact: true })).toBeVisible();
});
