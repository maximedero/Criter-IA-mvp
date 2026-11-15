import { expect, test } from "@playwright/test";

const TITLE_A = "Contrato Dynamics 365 - A";
const TITLE_B = "Contrato Dynamics 365 - B";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

test("slice5 dynamics mock ai workflow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE_A);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText("0 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByText("Sugerido por IA")).toHaveCount(0);

  await page.getByRole("button", { name: "Analizar relato" }).click();

  await expect(page.getByText("Sugerido por IA")).toHaveCount(3);
  await expect(page.getByText("0 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page
    .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
    .getByRole("button", { name: "Aceptar" })
    .click();

  await expect(page.getByText("1 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByText("Validado por el usuario.")).toBeVisible();

  await page
    .locator("article", { hasText: "Actualmente no pueden iniciarse nuevos proyectos ni tareas." })
    .getByRole("button", { name: "Aceptar" })
    .click();

  await expect(page.getByText("2 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page
    .locator("article", { hasText: "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso." })
    .getByRole("button", { name: "Editar" })
    .click();
  await page.getByLabel("Editar sugerencia").fill("El proveedor continúa únicamente hasta finalizar el proyecto actual.");
  await page.getByRole("button", { name: "Guardar edición" }).click();

  await expect(page.getByText("Editado por el usuario.")).toBeVisible();
  await expect(page.getByText("El proveedor continúa únicamente hasta finalizar el proyecto actual.")).toBeVisible();

  await page.getByRole("button", { name: "Volver al Inbox" }).click();

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE_B);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();

  await page.getByRole("row", { name: new RegExp(TITLE_B) }).getByRole("button", { name: "Abrir" }).click();

  await page.getByRole("button", { name: "Analizar relato" }).click();
  await expect(page.getByText("Sugerido por IA")).toHaveCount(3);

  await page
    .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
    .getByRole("button", { name: "Rechazar" })
    .click();

  await expect(page.getByText("Sugerido por IA")).toHaveCount(2);
  await expect(page.getByText("0 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page.reload();

  await page.getByRole("row", { name: new RegExp(TITLE_A) }).getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByText("Validado por el usuario.")).toHaveCount(2);
  await expect(page.getByText("Editado por el usuario.")).toBeVisible();

  await page.getByRole("button", { name: "Volver al Inbox" }).click();
  await page.getByRole("row", { name: new RegExp(TITLE_B) }).getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByText("Sugerido por IA")).toHaveCount(2);

  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toHaveCount(0);
  await expect(page.getByText("Revisión crítica pendiente.")).toHaveCount(0);
});
