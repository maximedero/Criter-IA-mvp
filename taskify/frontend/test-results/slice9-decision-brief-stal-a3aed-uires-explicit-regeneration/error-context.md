# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice9-decision-brief-stale.spec.ts >> marks a generated brief stale and requires explicit regeneration
- Location: tests\e2e\slice9-decision-brief-stale.spec.ts:59:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Continuar a preparación del brief' })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - heading "Espacio de decisiones" [level=1] [ref=e4]
  - generic [ref=e5]:
    - heading "Detalle de caso" [level=2] [ref=e6]
    - generic [ref=e7]:
      - paragraph [ref=e8]:
        - strong [ref=e9]: "Título:"
        - text: Contrato Dynamics 365 Slice9 Stale
      - paragraph [ref=e10]:
        - strong [ref=e11]: "Estado:"
        - text: Evaluación humana
      - paragraph [ref=e12]:
        - strong [ref=e13]: "Relato inicial:"
        - text: El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.
    - paragraph [ref=e15]:
      - strong [ref=e16]: "Estado:"
      - text: Evaluación humana
    - generic [ref=e17]:
      - heading "Lienzo de decisión" [level=3] [ref=e18]
      - button "Analizar relato" [ref=e20] [cursor=pointer]
      - generic [ref=e22]:
        - heading "COBERTURA DEL ANÁLISIS" [level=4] [ref=e23]
        - list [ref=e24]:
          - listitem [ref=e25]: ✓ Situación
          - listitem [ref=e26]: ✓ Exposición
          - listitem [ref=e27]: ✓ Impacto
          - listitem [ref=e28]: ✓ Evidencia
          - listitem [ref=e29]: ✓ Incertidumbre
          - listitem [ref=e30]: ✓ Intervención requerida
        - paragraph [ref=e31]: 6 de 6 dimensiones mínimas cubiertas.
        - paragraph [ref=e32]: Cobertura mínima alcanzada.
      - generic [ref=e33]:
        - generic [ref=e34]:
          - heading "Contexto y señal" [level=4] [ref=e35]
          - article [ref=e36]:
            - paragraph [ref=e37]: El contrato con el proveedor venció el 31/10/2026.
            - generic [ref=e38]: Hecho
            - generic [ref=e39]:
              - button "Editar" [ref=e40] [cursor=pointer]
              - button "Eliminar" [ref=e42] [cursor=pointer]
          - article [ref=e44]:
            - paragraph [ref=e45]: El proveedor continúa únicamente hasta finalizar el proyecto actual.
            - generic [ref=e46]: Hecho
            - generic [ref=e47]:
              - button "Editar" [ref=e48] [cursor=pointer]
              - button "Eliminar" [ref=e50] [cursor=pointer]
          - button "+ Agregar" [ref=e52] [cursor=pointer]
        - generic [ref=e54]:
          - heading "Exposición" [level=4] [ref=e55]
          - article [ref=e56]:
            - paragraph [ref=e57]: Actualmente no pueden iniciarse nuevos proyectos ni tareas.
            - generic [ref=e58]: Hecho
            - generic [ref=e59]:
              - button "Editar" [ref=e60] [cursor=pointer]
              - button "Eliminar" [ref=e62] [cursor=pointer]
          - button "+ Agregar" [ref=e64] [cursor=pointer]
        - generic [ref=e66]:
          - heading "Evidencia" [level=4] [ref=e67]
          - article [ref=e68]:
            - paragraph [ref=e69]: El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.
            - generic [ref=e70]: Hecho
            - generic [ref=e71]:
              - button "Editar" [ref=e72] [cursor=pointer]
              - button "Eliminar" [ref=e74] [cursor=pointer]
          - button "+ Agregar" [ref=e76] [cursor=pointer]
        - generic [ref=e78]:
          - heading "Impactos posibles" [level=4] [ref=e79]
          - article [ref=e80]:
            - paragraph [ref=e81]: Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.
            - generic [ref=e82]: Inferencia
            - generic [ref=e83]:
              - button "Editar" [ref=e84] [cursor=pointer]
              - button "Eliminar" [ref=e86] [cursor=pointer]
          - button "+ Agregar" [ref=e88] [cursor=pointer]
        - generic [ref=e90]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=e91]
          - article [ref=e92]:
            - paragraph [ref=e93]: No conocemos cuándo termina exactamente el proyecto actual.
            - generic [ref=e94]: Dato faltante
            - generic [ref=e95]:
              - button "Editar" [ref=e96] [cursor=pointer]
              - button "Eliminar" [ref=e98] [cursor=pointer]
          - article [ref=e100]:
            - paragraph [ref=e101]: No conocemos la demanda de nuevos trabajos durante los próximos meses.
            - generic [ref=e102]: Dato faltante
            - generic [ref=e103]:
              - button "Editar" [ref=e104] [cursor=pointer]
              - button "Eliminar" [ref=e106] [cursor=pointer]
          - button "+ Agregar" [ref=e108] [cursor=pointer]
        - generic [ref=e110]:
          - heading "Escenarios" [level=4] [ref=e111]
          - paragraph [ref=e112]: Sin contenido
          - button "+ Agregar" [ref=e113] [cursor=pointer]
        - generic [ref=e115]:
          - heading "Alternativas" [level=4] [ref=e116]
          - article [ref=e117]:
            - paragraph [ref=e118]: Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.
            - generic [ref=e119]: Supuesto
            - generic [ref=e120]:
              - button "Editar" [ref=e121] [cursor=pointer]
              - button "Eliminar" [ref=e123] [cursor=pointer]
          - button "+ Agregar" [ref=e125] [cursor=pointer]
        - generic [ref=e127]:
          - heading "Intervención requerida" [level=4] [ref=e128]
          - article [ref=e129]:
            - paragraph [ref=e130]: Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.
            - generic [ref=e131]: Evaluación humana
            - generic [ref=e132]:
              - button "Editar" [ref=e133] [cursor=pointer]
              - button "Eliminar" [ref=e135] [cursor=pointer]
          - button "+ Agregar" [ref=e137] [cursor=pointer]
    - region "Evaluación humana de gravedad" [ref=e139]:
      - heading "EVALUACIÓN HUMANA DE GRAVEDAD" [level=4] [ref=e140]
      - paragraph [ref=e141]: Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.
      - paragraph [ref=e142]: Evaluación realizada por el usuario.
      - paragraph [ref=e143]:
        - strong [ref=e144]: "Gravedad:"
        - text: Alta
      - group "Gravedad del riesgo" [ref=e145]:
        - generic [ref=e147]:
          - radio "Sin evaluar" [ref=e148]
          - text: Sin evaluar
        - generic [ref=e149]:
          - radio "Baja" [ref=e150]
          - text: Baja
        - generic [ref=e151]:
          - radio "Media" [ref=e152]
          - text: Media
        - generic [ref=e153]:
          - radio "Alta" [checked] [ref=e154]
          - text: Alta
        - generic [ref=e155]:
          - radio "Crítica" [ref=e156]
          - text: Crítica
      - generic [ref=e157]:
        - text: Fundamento de la evaluación (opcional)
        - textbox "Fundamento de la evaluación (opcional)" [ref=e158]: Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto.
      - generic [ref=e159]:
        - button "Guardar evaluación" [active] [ref=e160] [cursor=pointer]
        - button "Continuar a preparación del informe ejecutivo" [ref=e162] [cursor=pointer]
      - paragraph [ref=e164]: Evaluación completa. El caso puede avanzar a preparación del informe ejecutivo.
      - paragraph [ref=e165]: Evaluación guardada.
    - button "Volver a la bandeja" [ref=e166] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | const TITLE = "Contrato Dynamics 365 Slice9 Stale";
  4   | const NARRATIVE =
  5   |   "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";
  6   | 
  7   | async function createCase(page: import("@playwright/test").Page) {
  8   |   await page.goto("/");
  9   |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  10  |   await page.getByLabel("Título").fill(TITLE);
  11  |   await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  12  |   await page.getByRole("button", { name: "Crear caso" }).click();
  13  |   await page.getByRole("button", { name: "Abrir" }).click();
  14  | }
  15  | 
  16  | async function addItem(page: import("@playwright/test").Page, sectionIndex: number, content: string, epistemicType = "FACT") {
  17  |   await page.getByRole("button", { name: "+ Agregar" }).nth(sectionIndex).click();
  18  |   await page.getByLabel("Contenido").last().fill(content);
  19  |   await page.getByLabel("Tipo epistemológico").last().selectOption(epistemicType);
  20  |   await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  21  | }
  22  | 
  23  | async function setupCaseToBriefDraft(page: import("@playwright/test").Page) {
  24  |   await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  25  |   await addItem(page, 0, "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT");
  26  |   await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  27  |   await addItem(page, 2, "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT");
  28  |   await addItem(page, 3, "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE");
  29  |   await addItem(page, 4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  30  |   await addItem(page, 4, "No conocemos la demanda de nuevos trabajos durante los próximos meses.", "MISSING_INFORMATION");
  31  |   await addItem(page, 6, "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.", "ASSUMPTION");
  32  |   await addItem(
  33  |     page,
  34  |     7,
  35  |     "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
  36  |     "HUMAN_EVALUATION"
  37  |   );
  38  | 
  39  |   await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  40  | 
  41  |   await page.getByRole("button", { name: "Iniciar revisión" }).click();
  42  |   await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  43  |   await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  44  |   await page.getByRole("button", { name: "Completar revisión" }).click();
  45  | 
  46  |   await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  47  |   await page.getByRole("radio", { name: "Alta" }).click();
  48  |   await page
  49  |     .getByLabel("Fundamento de la evaluación (opcional)")
  50  |     .fill(
  51  |       "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
  52  |     );
  53  |   await page.getByRole("button", { name: "Guardar evaluación" }).click();
> 54  |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
      |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  55  | 
  56  |   await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  57  | }
  58  | 
  59  | test("marks a generated brief stale and requires explicit regeneration", async ({ page }) => {
  60  |   await createCase(page);
  61  |   await setupCaseToBriefDraft(page);
  62  | 
  63  |   const briefRegion = page.getByRole("region", { name: "Preparación del brief" });
  64  | 
  65  |   await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  66  |   await expect(page.getByRole("tab", { name: "Brief ejecutivo" })).toBeVisible();
  67  | 
  68  |   await page.getByRole("button", { name: "Editar Por qué importa" }).click();
  69  |   const editedExecutiveText =
  70  |     "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades.";
  71  |   await page.getByLabel("Por qué importa").fill(editedExecutiveText);
  72  |   await page.getByRole("button", { name: "Guardar edición" }).click();
  73  | 
  74  |   const initialBriefState = await page.evaluate(() => {
  75  |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
  76  |     const caseId = cases[0]?.id;
  77  |     const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
  78  |     return briefs[caseId] ?? null;
  79  |   });
  80  | 
  81  |   expect(initialBriefState?.stale).toBe(false);
  82  |   expect(initialBriefState?.current?.version).toBe(1);
  83  |   await expect(page.getByText("El análisis cambió después de generar este brief.")).toHaveCount(0);
  84  | 
  85  |   await page.evaluate(() => {
  86  |     const zero = {
  87  |       analyzeNarrative: 0,
  88  |       suggestNextQuestion: 0,
  89  |       reviewCase: 0,
  90  |       generateBrief: 0
  91  |     };
  92  | 
  93  |     (window as unknown as {
  94  |       __DW_AI_OBSERVATION__?: {
  95  |         analyzeNarrative: number;
  96  |         suggestNextQuestion: number;
  97  |         reviewCase: number;
  98  |         generateBrief: number;
  99  |       };
  100 |     }).__DW_AI_OBSERVATION__ = zero;
  101 | 
  102 |     localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  103 |   });
  104 | 
  105 |   const canvasRegion = page.locator("section").filter({ has: page.getByRole("heading", { name: "Lienzo de decisión" }) }).first();
  106 |   const impactsSection = canvasRegion.locator("section").filter({ has: page.getByRole("heading", { name: "Impactos posibles" }) }).first();
  107 | 
  108 |   const updatedImpactText =
  109 |     "Nuevas necesidades correctivas y evolutivas podrían quedar temporalmente sin capacidad de atención externa.";
  110 | 
  111 |   const originalImpactCard = impactsSection.locator("article").filter({
  112 |     hasText: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
  113 |   });
  114 | 
  115 |   await originalImpactCard.getByRole("button", { name: "Editar" }).click();
  116 |   await impactsSection.locator("form").getByLabel("Contenido").fill(updatedImpactText);
  117 |   await impactsSection.locator("form").getByRole("button", { name: "Guardar" }).click();
  118 |   await expect(impactsSection.getByText(updatedImpactText)).toBeVisible();
  119 | 
  120 |   const updatedCanvasImpact = await page.evaluate(() => {
  121 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
  122 |     const caseId = cases[0]?.id;
  123 |     const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
  124 |     const items = (canvas[caseId] ?? []) as Array<{ dimension: string; content: string }>;
  125 |     return items.find((item) => item.dimension === "IMPACT")?.content ?? null;
  126 |   });
  127 | 
  128 |   expect(updatedCanvasImpact).toBe(updatedImpactText);
  129 | 
  130 |   await expect(page.locator('p[role="alert"]', { hasText: "El análisis cambió después de generar este brief." })).toBeVisible();
  131 |   await expect(page.getByRole("button", { name: "Regenerar borrador" })).toBeVisible();
  132 |   await expect(page.getByText(editedExecutiveText)).toBeVisible();
  133 |   await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  134 | 
  135 |   const staleRecord = await page.evaluate(() => {
  136 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
  137 |     const caseId = cases[0]?.id;
  138 |     const briefs = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
  139 |     return briefs[caseId] ?? null;
  140 |   });
  141 | 
  142 |   expect(staleRecord?.stale).toBe(true);
  143 |   expect(staleRecord?.current?.version).toBe(1);
  144 | 
  145 |   const countersBeforeRegenerate = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  146 |   expect(countersBeforeRegenerate.generateBrief).toBe(0);
  147 |   expect(countersBeforeRegenerate.analyzeNarrative).toBe(0);
  148 |   expect(countersBeforeRegenerate.suggestNextQuestion).toBe(0);
  149 |   expect(countersBeforeRegenerate.reviewCase).toBe(0);
  150 | 
  151 |   await expect(page.getByRole("button", { name: "Marcar brief como revisado" })).toBeDisabled();
  152 | 
  153 |   page.once("dialog", async (dialog) => {
  154 |     await dialog.dismiss();
```