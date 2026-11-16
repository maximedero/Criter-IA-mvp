# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice10-human-approval.spec.ts >> slice10 dynamics human approval flow
- Location: tests\e2e\slice10-human-approval.spec.ts:58:1

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
        - text: Contrato Dynamics 365 Slice10
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
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | const TITLE = "Contrato Dynamics 365 Slice10";
  4   | const NARRATIVE =
  5   |   "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.";
  6   | 
  7   | async function createCase(page: import("@playwright/test").Page, title = TITLE) {
  8   |   await page.goto("/");
  9   |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  10  |   await page.getByLabel("Título").fill(title);
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
  23  | async function setupCaseToReviewedBrief(page: import("@playwright/test").Page) {
  24  |   await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  25  |   await addItem(page, 0, "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT");
  26  |   await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  27  |   await addItem(page, 2, "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT");
  28  |   await addItem(page, 3, "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE");
  29  |   await addItem(page, 4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  30  |   await addItem(
  31  |     page,
  32  |     7,
  33  |     "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
  34  |     "HUMAN_EVALUATION"
  35  |   );
  36  | 
  37  |   await expect(page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/)).toBeVisible();
  38  | 
  39  |   await page.getByRole("button", { name: "Iniciar revisión" }).click();
  40  |   await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  41  |   await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  42  |   await page.getByRole("button", { name: "Completar revisión" }).click();
  43  | 
  44  |   await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  45  |   await page.getByRole("radio", { name: "Alta" }).click();
  46  |   await page.getByRole("button", { name: "Guardar evaluación" }).click();
> 47  |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
      |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  48  | 
  49  |   await page.getByRole("button", { name: "Generar borrador de brief" }).click();
  50  |   page.once("dialog", async (dialog) => {
  51  |     if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
  52  |       await dialog.accept();
  53  |     }
  54  |   });
  55  |   await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
  56  | }
  57  | 
  58  | test("slice10 dynamics human approval flow", async ({ page }) => {
  59  |   await createCase(page);
  60  |   await setupCaseToReviewedBrief(page);
  61  | 
  62  |   await page.evaluate(() => {
  63  |     const zero = {
  64  |       analyzeNarrative: 0,
  65  |       suggestNextQuestion: 0,
  66  |       reviewCase: 0,
  67  |       generateBrief: 0
  68  |     };
  69  |     localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  70  |   });
  71  | 
  72  |   await expect(page.getByRole("heading", { name: "APROBACIÓN HUMANA" })).toBeVisible();
  73  |   await expect(page.getByText("Se cumplen las condiciones para aprobar el brief.")).toBeVisible();
  74  |   await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  75  | 
  76  |   await page.getByRole("button", { name: "Aprobar brief" }).click();
  77  | 
  78  |   const dialog = page.getByRole("dialog", { name: "Confirmar aprobación" });
  79  |   await expect(dialog).toBeVisible();
  80  |   await expect(dialog.getByText("Estás por marcar este caso como LISTO PARA ELEVAR.")).toBeVisible();
  81  |   await expect(dialog).toContainText("Caso");
  82  |   await expect(dialog).toContainText(TITLE);
  83  |   await expect(dialog).toContainText("Versión del brief");
  84  |   await expect(dialog).toContainText("v1");
  85  |   await expect(dialog).toContainText("Gravedad");
  86  |   await expect(dialog).toContainText("Alta");
  87  |   await expect(dialog.getByText("Evaluación de gravedad realizada por el usuario.")).toBeVisible();
  88  | 
  89  |   await dialog.getByRole("button", { name: "Cancelar" }).click();
  90  | 
  91  |   const afterCancel = await page.evaluate(() => {
  92  |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
  93  |     const caseId = cases[0]?.id;
  94  |     const approvals = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
  95  |     const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
  96  |     return {
  97  |       caseStatus: cases[0]?.status,
  98  |       approval: approvals[caseId] ?? null,
  99  |       counters
  100 |     };
  101 |   });
  102 | 
  103 |   expect(afterCancel.caseStatus).toBe("BRIEF_DRAFT");
  104 |   expect(afterCancel.approval?.status).toBe("NOT_APPROVED");
  105 |   expect(afterCancel.approval?.approvedAt).toBeNull();
  106 |   expect(afterCancel.counters.generateBrief).toBe(0);
  107 |   expect(afterCancel.counters.analyzeNarrative).toBe(0);
  108 |   expect(afterCancel.counters.suggestNextQuestion).toBe(0);
  109 |   expect(afterCancel.counters.reviewCase).toBe(0);
  110 | 
  111 |   await page.getByRole("button", { name: "Aprobar brief" }).click();
  112 |   await page.getByRole("button", { name: "Confirmar aprobación" }).click();
  113 | 
  114 |   await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();
  115 |   await expect(page.getByText("El brief fue revisado y aprobado por el usuario.").first()).toBeVisible();
  116 |   await expect(page.getByText("Aprobación realizada por el usuario.").first()).toBeVisible();
  117 |   await expect(
  118 |     page.getByText("Listo para elevar indica preparación del brief, no aprobación de la decisión por parte del destinatario.")
  119 |   ).toBeVisible();
  120 | 
  121 |   const afterConfirm = await page.evaluate(() => {
  122 |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; status: string }>;
  123 |     const caseId = cases[0]?.id;
  124 |     const approvals = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
  125 |     const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
  126 |     return {
  127 |       caseStatus: cases[0]?.status,
  128 |       approval: approvals[caseId],
  129 |       counters
  130 |     };
  131 |   });
  132 | 
  133 |   expect(afterConfirm.caseStatus).toBe("READY_TO_ESCALATE");
  134 |   expect(afterConfirm.approval.status).toBe("APPROVED");
  135 |   expect(afterConfirm.approval.approvedBy).toBe("USER");
  136 |   expect(afterConfirm.approval.confirmedBriefVersion).toBe(1);
  137 |   expect(afterConfirm.approval.approvedAt).toBeTruthy();
  138 |   expect(Array.isArray(afterConfirm.approval.checklistSnapshot.checks)).toBe(true);
  139 | 
  140 |   expect(afterConfirm.counters.generateBrief).toBe(0);
  141 |   expect(afterConfirm.counters.analyzeNarrative).toBe(0);
  142 |   expect(afterConfirm.counters.suggestNextQuestion).toBe(0);
  143 |   expect(afterConfirm.counters.reviewCase).toBe(0);
  144 | 
  145 |   await page.reload();
  146 |   await page.getByRole("button", { name: "Abrir" }).click();
  147 | 
```