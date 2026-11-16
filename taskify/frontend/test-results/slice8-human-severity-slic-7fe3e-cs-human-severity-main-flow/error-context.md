# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice8-human-severity.spec.ts >> slice8 dynamics human severity main flow
- Location: tests\e2e\slice8-human-severity.spec.ts:55:1

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
        - text: Contrato Dynamics 365 Slice8
      - paragraph [ref=e10]:
        - strong [ref=e11]: "Estado:"
        - text: Evaluación humana
      - paragraph [ref=e12]:
        - strong [ref=e13]: "Relato inicial:"
        - text: El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.
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
            - paragraph [ref=e45]: El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.
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
            - paragraph [ref=e69]: El respaldo documental todavía no está consolidado para cuantificar afectados.
            - generic [ref=e70]: Hecho
            - generic [ref=e71]:
              - button "Editar" [ref=e72] [cursor=pointer]
              - button "Eliminar" [ref=e74] [cursor=pointer]
          - button "+ Agregar" [ref=e76] [cursor=pointer]
        - generic [ref=e78]:
          - heading "Impactos posibles" [level=4] [ref=e79]
          - article [ref=e80]:
            - paragraph [ref=e81]: 200 usuarios quedarán sin servicio.
            - generic [ref=e82]: Hecho
            - generic [ref=e83]:
              - button "Editar" [ref=e84] [cursor=pointer]
              - button "Eliminar" [ref=e86] [cursor=pointer]
          - button "+ Agregar" [ref=e88] [cursor=pointer]
        - generic [ref=e90]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=e91]
          - article [ref=e92]:
            - paragraph [ref=e93]: No conocemos el plazo definitivo de contratación.
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
          - article [ref=e109]:
            - paragraph [ref=e110]: Una prórroga contractual podría ser una alternativa.
            - generic [ref=e111]: Supuesto
            - generic [ref=e112]:
              - button "Editar" [ref=e113] [cursor=pointer]
              - button "Eliminar" [ref=e115] [cursor=pointer]
          - button "+ Agregar" [ref=e117] [cursor=pointer]
        - generic [ref=e119]:
          - heading "Intervención requerida" [level=4] [ref=e120]
          - article [ref=e121]:
            - paragraph [ref=e122]: Que mi jefe vea el tema.
            - generic [ref=e123]: Evaluación humana
            - generic [ref=e124]:
              - button "Editar" [ref=e125] [cursor=pointer]
              - button "Eliminar" [ref=e127] [cursor=pointer]
          - button "+ Agregar" [ref=e129] [cursor=pointer]
    - region "Evaluación humana de gravedad" [ref=e131]:
      - heading "EVALUACIÓN HUMANA DE GRAVEDAD" [level=4] [ref=e132]
      - paragraph [ref=e133]: Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.
      - paragraph [ref=e134]: Evaluación realizada por el usuario.
      - paragraph [ref=e135]: "Advertencias abiertas: 2"
      - paragraph [ref=e136]:
        - strong [ref=e137]: "Gravedad:"
        - text: Sin evaluar
      - paragraph [ref=e138]: No se puede preparar el informe ejecutivo hasta que el usuario complete esta evaluación.
      - group "Gravedad del riesgo" [ref=e139]:
        - generic [ref=e141]:
          - radio "Sin evaluar" [checked] [ref=e142]
          - text: Sin evaluar
        - generic [ref=e143]:
          - radio "Baja" [ref=e144]
          - text: Baja
        - generic [ref=e145]:
          - radio "Media" [ref=e146]
          - text: Media
        - generic [ref=e147]:
          - radio "Alta" [ref=e148]
          - text: Alta
        - generic [ref=e149]:
          - radio "Crítica" [ref=e150]
          - text: Crítica
      - generic [ref=e151]:
        - text: Fundamento de la evaluación (opcional)
        - textbox "Fundamento de la evaluación (opcional)" [ref=e152]
      - generic [ref=e153]:
        - button "Guardar evaluación" [ref=e154] [cursor=pointer]
        - button "Continuar a preparación del informe ejecutivo" [ref=e156] [cursor=pointer]
    - button "Volver a la bandeja" [ref=e158] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | const TITLE = "Contrato Dynamics 365 Slice8";
  4   | const NARRATIVE =
  5   |   "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";
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
  23  | async function setupCaseToCriticalReview(page: import("@playwright/test").Page) {
  24  |   await addItem(page, 0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  25  |   await addItem(page, 0, "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.", "FACT");
  26  |   await addItem(page, 1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  27  |   await addItem(page, 2, "El respaldo documental todavía no está consolidado para cuantificar afectados.", "FACT");
  28  |   await addItem(page, 3, "200 usuarios quedarán sin servicio.", "FACT");
  29  |   await addItem(page, 4, "No conocemos el plazo definitivo de contratación.", "MISSING_INFORMATION");
  30  |   await addItem(page, 6, "Una prórroga contractual podría ser una alternativa.", "ASSUMPTION");
  31  |   await addItem(page, 7, "Que mi jefe vea el tema.", "HUMAN_EVALUATION");
  32  | 
  33  |   await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  34  |   await page.getByRole("button", { name: "Iniciar revisión" }).click();
  35  |   await expect(page.getByRole("heading", { name: "REVISIÓN CRÍTICA" })).toBeVisible();
  36  | }
  37  | 
  38  | async function resolveBlockersAndCompleteReview(page: import("@playwright/test").Page) {
  39  |   await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();
  40  |   await expect(page.getByText("Impacto cuantitativo sin sustento suficiente")).toBeVisible();
  41  | 
  42  |   await page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" }).getByRole("button", { name: "Editar item" }).click();
  43  |   await page.locator("article", { hasText: "Impacto cuantitativo sin sustento suficiente" }).getByRole("button", { name: "Marcar como resuelto por edición" }).click();
  44  | 
  45  |   await page.locator("article", { hasText: "Intervención requerida poco accionable" }).getByRole("button", { name: "Editar item" }).click();
  46  |   await page.locator("article", { hasText: "Intervención requerida poco accionable" }).getByRole("button", { name: "Marcar como resuelto por edición" }).click();
  47  | 
  48  |   await expect(page.getByText("0 bloqueos abiertos")).toBeVisible();
  49  |   await expect(page.getByText(/\d+ advertencias abiertas/)).toBeVisible();
  50  | 
  51  |   await page.getByRole("button", { name: "Completar revisión" }).click();
  52  |   await expect(page.getByText("Revisión completada. El caso puede avanzar a evaluación humana.").first()).toBeVisible();
  53  | }
  54  | 
  55  | test("slice8 dynamics human severity main flow", async ({ page }) => {
  56  |   await createCase(page);
  57  |   await setupCaseToCriticalReview(page);
  58  |   await resolveBlockersAndCompleteReview(page);
  59  | 
  60  |   await page.evaluate(() => {
  61  |     const zero = {
  62  |       analyzeNarrative: 0,
  63  |       suggestNextQuestion: 0,
  64  |       reviewCase: 0,
  65  |       generateBrief: 0
  66  |     };
  67  | 
  68  |     (window as unknown as {
  69  |       __DW_AI_OBSERVATION__?: {
  70  |         analyzeNarrative: number;
  71  |         suggestNextQuestion: number;
  72  |         reviewCase: number;
  73  |         generateBrief: number;
  74  |       };
  75  |     }).__DW_AI_OBSERVATION__ = zero;
  76  | 
  77  |     localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  78  |   });
  79  | 
  80  |   await expect(page.getByRole("button", { name: "Avanzar a evaluación humana" })).toBeVisible();
  81  |   await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  82  | 
  83  |   await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  84  |   await expect(page.getByRole("radio", { name: "Sin evaluar" })).toBeChecked();
  85  |   await expect(page.getByRole("radio", { name: "Baja" })).not.toBeChecked();
  86  |   await expect(page.getByRole("radio", { name: "Media" })).not.toBeChecked();
  87  |   await expect(page.getByRole("radio", { name: "Alta" })).not.toBeChecked();
  88  |   await expect(page.getByRole("radio", { name: "Crítica" })).not.toBeChecked();
  89  |   await expect(page.getByText("Evaluación realizada por el usuario.")).toBeVisible();
  90  | 
> 91  |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
      |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  92  |   await expect(page.getByText("Seleccioná una gravedad antes de continuar.")).toBeVisible();
  93  | 
  94  |   await page.getByRole("radio", { name: "Alta" }).click();
  95  |   await page
  96  |     .getByLabel("Fundamento de la evaluación (opcional)")
  97  |     .fill(
  98  |       "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
  99  |     );
  100 |   await page.getByRole("button", { name: "Guardar evaluación" }).click();
  101 | 
  102 |   await expect(page.getByText("Evaluación guardada.")).toBeVisible();
  103 |   await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  104 |   await expect(page.getByText(/Advertencias abiertas: \d+/)).toBeVisible();
  105 | 
  106 |   await page.reload();
  107 |   await page.getByRole("button", { name: "Abrir" }).click();
  108 | 
  109 |   await expect(page.getByRole("radio", { name: "Alta" })).toBeChecked();
  110 |   await expect(page.getByLabel("Fundamento de la evaluación (opcional)")).toHaveValue(
  111 |     "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto."
  112 |   );
  113 |   await expect(page.getByText("Evaluación realizada por el usuario.")).toBeVisible();
  114 |   await expect(page.getByText(/Advertencias abiertas: \d+/)).toBeVisible();
  115 | 
  116 |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  117 |   await expect(page.getByText(/Estado:\s*Brief borrador/).first()).toBeVisible();
  118 |   await expect(page.getByText("El caso está listo para preparar el brief.")).toBeVisible();
  119 | 
  120 |   await expect(page.getByText(/Resumen ejecutivo|vista expandida|Aprobar brief|READY_TO_ESCALATE/i)).toHaveCount(0);
  121 | 
  122 |   const counters = await page.evaluate(() => {
  123 |     const raw = localStorage.getItem("dw.ai.observation");
  124 |     if (!raw) {
  125 |       return null;
  126 |     }
  127 | 
  128 |     return JSON.parse(raw) as {
  129 |       analyzeNarrative: number;
  130 |       suggestNextQuestion: number;
  131 |       reviewCase: number;
  132 |       generateBrief: number;
  133 |     };
  134 |   });
  135 | 
  136 |   expect(counters?.analyzeNarrative).toBe(0);
  137 |   expect(counters?.suggestNextQuestion).toBe(0);
  138 |   expect(counters?.reviewCase).toBe(0);
  139 |   expect(counters?.generateBrief).toBe(0);
  140 | });
  141 | 
  142 | test("slice8 gate revoked by coverage degradation", async ({ page }) => {
  143 |   await createCase(page, "Slice8 Gate Revoked");
  144 |   await setupCaseToCriticalReview(page);
  145 |   await resolveBlockersAndCompleteReview(page);
  146 | 
  147 |   await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  148 |   await page.getByRole("radio", { name: "Alta" }).click();
  149 |   await page.getByLabel("Fundamento de la evaluación (opcional)").fill("texto humano");
  150 |   await page.getByRole("button", { name: "Guardar evaluación" }).click();
  151 | 
  152 |   await page.getByRole("button", { name: "Eliminar" }).nth(5).click();
  153 |   await expect(page.getByText("5 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  154 |   await expect(page.getByText("Faltan dimensiones para cobertura mínima.")).toBeVisible();
  155 | 
  156 |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
  157 |   await expect(page.getByRole("alert").filter({ hasText: "Faltan dimensiones para cobertura mínima." })).toBeVisible();
  158 | 
  159 |   await expect(page.getByRole("radio", { name: "Alta" })).toBeChecked();
  160 |   await expect(page.getByLabel("Fundamento de la evaluación (opcional)")).toHaveValue("texto humano");
  161 |   await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  162 | });
  163 | 
```