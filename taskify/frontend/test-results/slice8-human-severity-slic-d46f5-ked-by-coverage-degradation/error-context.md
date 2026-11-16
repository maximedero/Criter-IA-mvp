# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice8-human-severity.spec.ts >> slice8 gate revoked by coverage degradation
- Location: tests\e2e\slice8-human-severity.spec.ts:142:1

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
        - text: Slice8 Gate Revoked
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
          - listitem [ref=e29]: ○ Incertidumbre
          - listitem [ref=e30]: ✓ Intervención requerida
        - paragraph [ref=e31]: 5 de 6 dimensiones mínimas cubiertas.
        - paragraph [ref=e32]: "Falta:"
        - list [ref=e33]:
          - listitem [ref=e34]: Incertidumbre
      - generic [ref=e35]:
        - generic [ref=e36]:
          - heading "Contexto y señal" [level=4] [ref=e37]
          - article [ref=e38]:
            - paragraph [ref=e39]: El contrato con el proveedor venció el 31/10/2026.
            - generic [ref=e40]: Hecho
            - generic [ref=e41]:
              - button "Editar" [ref=e42] [cursor=pointer]
              - button "Eliminar" [ref=e44] [cursor=pointer]
          - article [ref=e46]:
            - paragraph [ref=e47]: El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.
            - generic [ref=e48]: Hecho
            - generic [ref=e49]:
              - button "Editar" [ref=e50] [cursor=pointer]
              - button "Eliminar" [ref=e52] [cursor=pointer]
          - button "+ Agregar" [ref=e54] [cursor=pointer]
        - generic [ref=e56]:
          - heading "Exposición" [level=4] [ref=e57]
          - article [ref=e58]:
            - paragraph [ref=e59]: Actualmente no pueden iniciarse nuevos proyectos ni tareas.
            - generic [ref=e60]: Hecho
            - generic [ref=e61]:
              - button "Editar" [ref=e62] [cursor=pointer]
              - button "Eliminar" [ref=e64] [cursor=pointer]
          - button "+ Agregar" [ref=e66] [cursor=pointer]
        - generic [ref=e68]:
          - heading "Evidencia" [level=4] [ref=e69]
          - article [ref=e70]:
            - paragraph [ref=e71]: El respaldo documental todavía no está consolidado para cuantificar afectados.
            - generic [ref=e72]: Hecho
            - generic [ref=e73]:
              - button "Editar" [ref=e74] [cursor=pointer]
              - button "Eliminar" [ref=e76] [cursor=pointer]
          - button "+ Agregar" [ref=e78] [cursor=pointer]
        - generic [ref=e80]:
          - heading "Impactos posibles" [level=4] [ref=e81]
          - article [ref=e82]:
            - paragraph [ref=e83]: 200 usuarios quedarán sin servicio.
            - generic [ref=e84]: Hecho
            - generic [ref=e85]:
              - button "Editar" [ref=e86] [cursor=pointer]
              - button "Eliminar" [ref=e88] [cursor=pointer]
          - button "+ Agregar" [ref=e90] [cursor=pointer]
        - generic [ref=e92]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=e93]
          - paragraph [ref=e94]: Sin contenido
          - button "+ Agregar" [ref=e95] [cursor=pointer]
        - generic [ref=e97]:
          - heading "Escenarios" [level=4] [ref=e98]
          - paragraph [ref=e99]: Sin contenido
          - button "+ Agregar" [ref=e100] [cursor=pointer]
        - generic [ref=e102]:
          - heading "Alternativas" [level=4] [ref=e103]
          - article [ref=e104]:
            - paragraph [ref=e105]: Una prórroga contractual podría ser una alternativa.
            - generic [ref=e106]: Supuesto
            - generic [ref=e107]:
              - button "Editar" [ref=e108] [cursor=pointer]
              - button "Eliminar" [ref=e110] [cursor=pointer]
          - button "+ Agregar" [ref=e112] [cursor=pointer]
        - generic [ref=e114]:
          - heading "Intervención requerida" [level=4] [ref=e115]
          - article [ref=e116]:
            - paragraph [ref=e117]: Que mi jefe vea el tema.
            - generic [ref=e118]: Evaluación humana
            - generic [ref=e119]:
              - button "Editar" [ref=e120] [cursor=pointer]
              - button "Eliminar" [ref=e122] [cursor=pointer]
          - button "+ Agregar" [ref=e124] [cursor=pointer]
    - region "Evaluación humana de gravedad" [ref=e126]:
      - heading "EVALUACIÓN HUMANA DE GRAVEDAD" [level=4] [ref=e127]
      - paragraph [ref=e128]: Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.
      - paragraph [ref=e129]: Evaluación realizada por el usuario.
      - paragraph [ref=e130]: "Advertencias abiertas: 2"
      - paragraph [ref=e131]: Faltan dimensiones para cobertura mínima.
      - list [ref=e132]:
        - listitem [ref=e133]: Incertidumbre
      - paragraph [ref=e134]:
        - strong [ref=e135]: "Gravedad:"
        - text: Alta
      - group "Gravedad del riesgo" [ref=e136]:
        - generic [ref=e138]:
          - radio "Sin evaluar" [disabled] [ref=e139]
          - text: Sin evaluar
        - generic [ref=e140]:
          - radio "Baja" [disabled] [ref=e141]
          - text: Baja
        - generic [ref=e142]:
          - radio "Media" [disabled] [ref=e143]
          - text: Media
        - generic [ref=e144]:
          - radio "Alta" [checked] [disabled] [ref=e145]
          - text: Alta
        - generic [ref=e146]:
          - radio "Crítica" [disabled] [ref=e147]
          - text: Crítica
      - generic [ref=e148]:
        - text: Fundamento de la evaluación (opcional)
        - textbox "Fundamento de la evaluación (opcional)" [disabled] [ref=e149]: texto humano
      - generic [ref=e150]:
        - button "Guardar evaluación" [disabled] [ref=e151]
        - button "Continuar a preparación del informe ejecutivo" [ref=e153] [cursor=pointer]
      - paragraph [ref=e155]: Evaluación guardada.
    - button "Volver a la bandeja" [ref=e156] [cursor=pointer]
```

# Test source

```ts
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
  91  |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
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
> 156 |   await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
      |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  157 |   await expect(page.getByRole("alert").filter({ hasText: "Faltan dimensiones para cobertura mínima." })).toBeVisible();
  158 | 
  159 |   await expect(page.getByRole("radio", { name: "Alta" })).toBeChecked();
  160 |   await expect(page.getByLabel("Fundamento de la evaluación (opcional)")).toHaveValue("texto humano");
  161 |   await expect(page.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeVisible();
  162 | });
  163 | 
```