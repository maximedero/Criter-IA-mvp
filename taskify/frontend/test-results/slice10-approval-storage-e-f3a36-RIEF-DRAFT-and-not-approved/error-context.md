# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice10-approval-storage-error.spec.ts >> approval storage error keeps BRIEF_DRAFT and not approved
- Location: tests\e2e\slice10-approval-storage-error.spec.ts:54:1

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
        - text: Contrato Dynamics 365 Slice10 Storage
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
          - button "+ Agregar" [ref=e100] [cursor=pointer]
        - generic [ref=e102]:
          - heading "Escenarios" [level=4] [ref=e103]
          - paragraph [ref=e104]: Sin contenido
          - button "+ Agregar" [ref=e105] [cursor=pointer]
        - generic [ref=e107]:
          - heading "Alternativas" [level=4] [ref=e108]
          - paragraph [ref=e109]: Sin contenido
          - button "+ Agregar" [ref=e110] [cursor=pointer]
        - generic [ref=e112]:
          - heading "Intervención requerida" [level=4] [ref=e113]
          - article [ref=e114]:
            - paragraph [ref=e115]: Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.
            - generic [ref=e116]: Evaluación humana
            - generic [ref=e117]:
              - button "Editar" [ref=e118] [cursor=pointer]
              - button "Eliminar" [ref=e120] [cursor=pointer]
          - button "+ Agregar" [ref=e122] [cursor=pointer]
    - region "Evaluación humana de gravedad" [ref=e124]:
      - heading "EVALUACIÓN HUMANA DE GRAVEDAD" [level=4] [ref=e125]
      - paragraph [ref=e126]: Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.
      - paragraph [ref=e127]: Evaluación realizada por el usuario.
      - paragraph [ref=e128]:
        - strong [ref=e129]: "Gravedad:"
        - text: Alta
      - group "Gravedad del riesgo" [ref=e130]:
        - generic [ref=e132]:
          - radio "Sin evaluar" [ref=e133]
          - text: Sin evaluar
        - generic [ref=e134]:
          - radio "Baja" [ref=e135]
          - text: Baja
        - generic [ref=e136]:
          - radio "Media" [ref=e137]
          - text: Media
        - generic [ref=e138]:
          - radio "Alta" [checked] [ref=e139]
          - text: Alta
        - generic [ref=e140]:
          - radio "Crítica" [ref=e141]
          - text: Crítica
      - generic [ref=e142]:
        - text: Fundamento de la evaluación (opcional)
        - textbox "Fundamento de la evaluación (opcional)" [ref=e143]
      - generic [ref=e144]:
        - button "Guardar evaluación" [active] [ref=e145] [cursor=pointer]
        - button "Continuar a preparación del informe ejecutivo" [ref=e147] [cursor=pointer]
      - paragraph [ref=e149]: Evaluación completa. El caso puede avanzar a preparación del informe ejecutivo.
      - paragraph [ref=e150]: Evaluación guardada.
    - button "Volver a la bandeja" [ref=e151] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const TITLE = "Contrato Dynamics 365 Slice10 Storage";
  4  | const NARRATIVE =
  5  |   "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";
  6  | 
  7  | async function createCase(page: import("@playwright/test").Page, title = TITLE) {
  8  |   await page.goto("/");
  9  |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  10 |   await page.getByLabel("Título").fill(title);
  11 |   await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  12 |   await page.getByRole("button", { name: "Crear caso" }).click();
  13 |   await page.getByRole("button", { name: "Abrir" }).click();
  14 | }
  15 | 
  16 | async function addItem(page: import("@playwright/test").Page, sectionIndex: number, content: string, epistemicType = "FACT") {
  17 |   await page.getByRole("button", { name: "+ Agregar" }).nth(sectionIndex).click();
  18 |   await page.getByLabel("Contenido").last().fill(content);
  19 |   await page.getByLabel("Tipo epistemológico").last().selectOption(epistemicType);
  20 |   await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  21 | }
  22 | 
  23 | async function setupCaseToReviewedBrief(page: import("@playwright/test").Page) {
  24 |   await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  25 |   await addItem(page, 0, "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT");
  26 |   await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  27 |   await addItem(page, 2, "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT");
  28 |   await addItem(page, 3, "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE");
  29 |   await addItem(page, 4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  30 |   await addItem(
  31 |     page,
  32 |     7,
  33 |     "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
  34 |     "HUMAN_EVALUATION"
  35 |   );
  36 | 
  37 |   await page.getByRole("button", { name: "Iniciar revisión" }).click();
  38 |   await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  39 |   await page.getByRole("button", { name: "Completar revisión" }).click();
  40 |   await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  41 |   await page.getByRole("radio", { name: "Alta" }).click();
  42 |   await page.getByRole("button", { name: "Guardar evaluación" }).click();
> 43 |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
     |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  44 | 
  45 |   await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  46 |   page.once("dialog", async (dialog) => {
  47 |     if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
  48 |       await dialog.accept();
  49 |     }
  50 |   });
  51 |   await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
  52 | }
  53 | 
  54 | test("approval storage error keeps BRIEF_DRAFT and not approved", async ({ page }) => {
  55 |   await createCase(page);
  56 |   await setupCaseToReviewedBrief(page);
  57 | 
  58 |   await page.evaluate(() => {
  59 |     localStorage.setItem(
  60 |       "dw.ai.observation",
  61 |       JSON.stringify({ analyzeNarrative: 0, suggestNextQuestion: 0, reviewCase: 0, generateBrief: 0 })
  62 |     );
  63 | 
  64 |     const original = Storage.prototype.setItem;
  65 |     Storage.prototype.setItem = function (key: string, value: string) {
  66 |       if (key === "dw.humanBriefApprovals") {
  67 |         throw new Error("storage failure");
  68 |       }
  69 |       return original.call(this, key, value);
  70 |     };
  71 |   });
  72 | 
  73 |   await page.getByRole("button", { name: "Aprobar brief" }).click();
  74 |   await page.getByRole("button", { name: "Confirmar aprobación" }).click();
  75 | 
  76 |   await expect(page.getByRole("alert")).toHaveText("No se pudo guardar la aprobación.");
  77 | 
  78 |   const state = await page.evaluate(() => {
  79 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
  80 |     const caseId = cases[0]?.id;
  81 |     const approvals = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
  82 |     const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
  83 | 
  84 |     return {
  85 |       caseStatus: cases[0]?.status,
  86 |       approval: approvals[caseId],
  87 |       counters
  88 |     };
  89 |   });
  90 | 
  91 |   expect(state.caseStatus).toBe("BRIEF_DRAFT");
  92 |   expect(state.approval?.status).toBe("NOT_APPROVED");
  93 |   expect(state.counters.generateBrief).toBe(0);
  94 |   expect(state.counters.analyzeNarrative).toBe(0);
  95 |   expect(state.counters.suggestNextQuestion).toBe(0);
  96 |   expect(state.counters.reviewCase).toBe(0);
  97 | });
  98 | 
```