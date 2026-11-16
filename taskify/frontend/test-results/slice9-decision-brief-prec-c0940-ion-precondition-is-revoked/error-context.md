# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice9-decision-brief-preconditions.spec.ts >> blocks brief actions when a generation precondition is revoked
- Location: tests\e2e\slice9-decision-brief-preconditions.spec.ts:59:1

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
        - text: Contrato Dynamics 365 Slice9 Preconditions
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
  3   | const TITLE = "Contrato Dynamics 365 Slice9 Preconditions";
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
  59  | test("blocks brief actions when a generation precondition is revoked", async ({ page }) => {
  60  |   await createCase(page);
  61  |   await setupCaseToBriefDraft(page);
  62  | 
  63  |   await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  64  |   await expect(page.getByRole("tab", { name: "Brief ejecutivo" })).toBeVisible();
  65  | 
  66  |   const baseline = await page.evaluate(() => {
  67  |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
  68  |     const caseId = cases[0]?.id;
  69  |     const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
  70  |     const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
  71  |     return {
  72  |       caseId,
  73  |       brief: briefMap[caseId],
  74  |       severity: severityMap[caseId]
  75  |     };
  76  |   });
  77  | 
  78  |   expect(baseline.brief.current.status).toBe("GENERATED");
  79  |   expect(baseline.severity.severity).toBe("HIGH");
  80  | 
  81  |   await page.evaluate(() => {
  82  |     const zero = {
  83  |       analyzeNarrative: 0,
  84  |       suggestNextQuestion: 0,
  85  |       reviewCase: 0,
  86  |       generateBrief: 0
  87  |     };
  88  | 
  89  |     (window as unknown as {
  90  |       __DW_AI_OBSERVATION__?: {
  91  |         analyzeNarrative: number;
  92  |         suggestNextQuestion: number;
  93  |         reviewCase: number;
  94  |         generateBrief: number;
  95  |       };
  96  |     }).__DW_AI_OBSERVATION__ = zero;
  97  | 
  98  |     localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  99  |   });
  100 | 
  101 |   const canvasRegion = page.locator("section").filter({ has: page.getByRole("heading", { name: "Lienzo de decisión" }) }).first();
  102 |   const interventionSection = canvasRegion.locator("section").filter({ has: page.getByRole("heading", { name: "Intervención requerida" }) }).first();
  103 |   const interventionCard = interventionSection.locator("article").filter({
  104 |     hasText: "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
  105 |   });
  106 |   await interventionCard.getByRole("button", { name: "Eliminar" }).click();
  107 | 
  108 |   const coverageAfterRevoke = await page.evaluate(() => {
  109 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
  110 |     const caseId = cases[0]?.id;
  111 |     const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
  112 |     const items = (canvas[caseId] ?? []) as Array<{ dimension: string; validationStatus: string }>;
  113 |     const active = items.filter((item) => item.validationStatus !== "REJECTED");
  114 |     const required = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
  115 |     const covered = required.filter((dimension) => active.some((item) => item.dimension === dimension)).length;
  116 |     return { covered, hasIntervention: active.some((item) => item.dimension === "INTERVENTION") };
  117 |   });
  118 | 
  119 |   expect(coverageAfterRevoke.covered).toBe(5);
  120 |   expect(coverageAfterRevoke.hasIntervention).toBe(false);
  121 |   await expect(page.getByText(/5 de 6 dimensiones mínimas cubiertas\.?/)).toBeVisible();
  122 |   await expect(interventionSection.getByRole("heading", { name: "Intervención requerida" })).toBeVisible();
  123 | 
  124 |   await expect(page.locator('p[role="alert"]', { hasText: "La cobertura mínima ya no está completa." })).toBeVisible();
  125 | 
  126 |   const regenerateButton = page.getByRole("button", { name: "Regenerar borrador" });
  127 |   const generateButton = page.getByRole("button", { name: "Generar borrador de brief" });
  128 | 
  129 |   if (await regenerateButton.isVisible()) {
  130 |     if (await regenerateButton.isEnabled()) {
  131 |       page.once("dialog", async (dialog) => {
  132 |         await dialog.dismiss();
  133 |       });
  134 |       await regenerateButton.click();
  135 |     } else {
  136 |       await expect(regenerateButton).toBeDisabled();
  137 |     }
  138 |   } else {
  139 |     await expect(generateButton).toBeDisabled();
  140 |   }
  141 | 
  142 |   await expect(page.locator('p[role="alert"]', { hasText: "La cobertura mínima ya no está completa." })).toBeVisible();
  143 |   await expect(page.getByRole("button", { name: "Marcar brief como revisado" })).toBeDisabled();
  144 | 
  145 |   const afterBlockedAttempt = await page.evaluate(() => {
  146 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
  147 |     const caseId = cases[0]?.id;
  148 |     const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
  149 |     const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
  150 |     const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
  151 | 
  152 |     return {
  153 |       caseStatus: cases[0]?.status,
  154 |       brief: briefMap[caseId],
```