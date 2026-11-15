import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

test("slice1 dynamics inbox flow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();

  await expect(page.getByText(TITLE)).toBeVisible();
  await expect(page.getByText("Borrador")).toBeVisible();

  await page.reload();

  await expect(page.getByText(TITLE)).toBeVisible();
  await expect(page.getByText("Borrador")).toBeVisible();

  await page.getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByText("Detalle de caso")).toBeVisible();
  await expect(page.getByText(TITLE)).toBeVisible();
  await expect(page.getByText(NARRATIVE)).toBeVisible();
});
