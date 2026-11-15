import { expect, test } from "@playwright/test";

const TITLE = "Contrato Dynamics 365 Slice6";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

test("slice6 dynamics contextual assistance flow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(TITLE);
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();

  await page.getByRole("button", { name: "Analizar relato" }).click();
  await expect(page.getByText("Sugerido por IA")).toHaveCount(3);

  await page
    .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
    .getByRole("button", { name: "Aceptar" })
    .click();
  await page
    .locator("article", { hasText: "Actualmente no pueden iniciarse nuevos proyectos ni tareas." })
    .getByRole("button", { name: "Aceptar" })
    .click();

  await expect(page.getByText("2 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page.getByRole("button", { name: "Obtener siguiente pregunta" }).click();
  await expect(page.getByText("¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?")).toBeVisible();

  await page
    .getByLabel("Respuesta")
    .fill("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.");
  await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();

  await expect(page.getByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).toBeVisible();
  await expect(page.getByText("3 de 6 dimensiones mínimas cubiertas.")).toBeVisible();

  await page.getByRole("button", { name: "Siguiente pregunta", exact: true }).click();
  await expect(
    page.getByText("¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?")
  ).toBeVisible();

  await page.getByRole("button", { name: "No lo sé" }).click();

  await expect(
    page.getByText(
      "No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones."
    )
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "Evidencia" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Incertidumbres y datos faltantes" })).toBeVisible();

  await page.getByRole("button", { name: "Siguiente pregunta", exact: true }).click();
  await expect(page.getByText("La evidencia necesaria requiere investigación o consulta externa").first()).toBeVisible();

  await page.reload();
  await page.getByRole("row", { name: new RegExp(TITLE) }).getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).toBeVisible();
  await expect(
    page.getByText(
      "No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones."
    )
  ).toBeVisible();
  await expect(page.getByText("La evidencia necesaria requiere investigación o consulta externa").first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toHaveCount(0);
});

test("slice6 minimum coverage stop does not auto transition", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill("Slice6 Full Coverage");
  await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();

  await page.getByRole("button", { name: "Analizar relato" }).click();

  await page
    .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
    .getByRole("button", { name: "Aceptar" })
    .click();
  await page
    .locator("article", { hasText: "Actualmente no pueden iniciarse nuevos proyectos ni tareas." })
    .getByRole("button", { name: "Aceptar" })
    .click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
  await page.getByLabel("Contenido").fill("Existe respaldo documental interno sobre necesidad de continuidad.");
  await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
  await page.getByLabel("Contenido").fill("Sin continuidad podrían quedar sin atención requerimientos de mantenimiento.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
  await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
  await page.getByLabel("Contenido").fill("No conocemos el plazo definitivo de contratación.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(7).click();
  await page.getByLabel("Contenido").fill("Se requiere que el superior priorice y consulte alternativas con Compras.");
  await page.getByLabel("Tipo epistemológico").last().selectOption("HUMAN_EVALUATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();

  await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();

  await page.getByRole("button", { name: "Obtener siguiente pregunta" }).click();

  await expect(page.getByText("Ya existe cobertura mínima").first()).toBeVisible();

  await expect(page.getByText("Revisión crítica pendiente.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
});
