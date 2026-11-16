import { expect, test } from "@playwright/test";

async function createCase(page: import("@playwright/test").Page, title: string, narrative: string) {
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

async function moveToBriefDraft(page: import("@playwright/test").Page, severityLabel: "Alta" | "Media" | "Baja" | "Crítica") {
  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  await page.getByRole("button", { name: "Completar revisión" }).click();
  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: severityLabel }).click();
  await page.getByRole("button", { name: "Guardar evaluación" }).click();
  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  await expect(page.getByRole("tab", { name: "Comunicación ejecutiva" })).toBeVisible();
}

test("producción: communication mantiene frontera epistemológica y permite copiar", async ({ page }) => {
  await createCase(
    page,
    "Producción executive communication",
    "Las líneas de producción tuvieron microcortes durante los últimos tres turnos y distintos equipos técnicos reportaron comportamientos intermitentes en sistemas de control. No está claro si el origen está en red, energía o integración entre componentes. Hay registros parciales y percepciones de operadores, pero no existe todavía una línea de causalidad validada de punta a punta."
  );

  await addItem(page, 0, "Se registraron microcortes en tres turnos consecutivos.", "FACT");
  await addItem(page, 1, "Participan varias áreas técnicas en la investigación.", "FACT");
  await addItem(page, 2, "Hay registros parciales de eventos y telemetría incompleta.", "FACT");
  await addItem(page, 3, "Existe riesgo de afectar continuidad operativa si el patrón persiste.", "INFERENCE");
  await addItem(page, 4, "No hay evidencia suficiente para estimar probabilidad confiable.", "MISSING_INFORMATION");
  await addItem(page, 7, "Definir si se habilita análisis transversal y refuerzo de recolección de información.", "HUMAN_EVALUATION");

  await moveToBriefDraft(page, "Alta");

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

  const communication = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    return briefs[caseId]?.current?.communication;
  });

  expect(communication.email.subject.length).toBeGreaterThan(0);
  expect(communication.email.body).toContain("gravedad fue evaluada por el usuario");
  expect(communication.email.body.toLowerCase()).toContain("incertidumbre");
  expect(communication.email.body.toLowerCase()).toContain("te solicito");

  const combined = `${communication.email.body} ${communication.message.body}`.toLowerCase();
  expect(combined).not.toMatch(/\d+%/);
  expect(combined).not.toMatch(/probabilidad\s+de\s+\d/);

  await page.getByRole("button", { name: "Copiar como correo" }).click();
  await expect(page.getByText("Correo copiado.")).toBeVisible();

  await page.getByRole("button", { name: "Copiar como mensaje" }).click();
  await expect(page.getByText("Mensaje copiado.")).toBeVisible();

  const copied = await page.evaluate(() => {
    const state = (window as unknown as { __EXEC_CLIPBOARD__?: { value: string } }).__EXEC_CLIPBOARD__;
    return state?.value ?? "";
  });

  expect(copied.startsWith("Asunto:")).toBe(false);
});

test("sharepoint/nintex: communication no inventa cantidades y preserva incertidumbre", async ({ page }) => {
  await createCase(
    page,
    "SharePoint Nintex executive communication",
    "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización."
  );

  await addItem(page, 0, "Microsoft informó fin de soporte para workflows de SharePoint en julio de 2026.", "FACT");
  await addItem(page, 1, "Existen soluciones que dependen de workflows con Nintex.", "FACT");
  await addItem(page, 2, "El proyecto de modernización tuvo demoras.", "FACT");
  await addItem(page, 3, "Puede existir riesgo de discontinuidad si no se completa la migración.", "INFERENCE");
  await addItem(page, 4, "No hay inventario completo y validado de aplicaciones/usuarios/workflows afectados.", "MISSING_INFORMATION");
  await addItem(page, 6, "La alternativa tecnológica definitiva aún requiere validación integral.", "ASSUMPTION");
  await addItem(page, 7, "Solicitar definición de priorización y plan de relevamiento transversal.", "HUMAN_EVALUATION");

  await moveToBriefDraft(page, "Media");

  const communication = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    return briefs[caseId]?.current?.communication;
  });

  expect(communication.email.body.toLowerCase()).toContain("incertidumbre");
  expect(communication.email.body.toLowerCase()).toContain("alternativa");
  expect(communication.message.body.length).toBeLessThan(communication.email.body.length);

  const combined = `${communication.email.body} ${communication.message.body}`.toLowerCase();
  expect(combined).not.toMatch(/\b\d+\s+(aplicaciones|usuarios|workflows)\b/);

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

  await page.getByRole("button", { name: "Copiar como mensaje" }).click();
  await expect(page.getByText("Mensaje copiado.")).toBeVisible();
});
