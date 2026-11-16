# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fase8-sharepoint.spec.ts >> fase8-sharepoint valida flujo estructural completo
- Location: tests\e2e\fase8-sharepoint.spec.ts:48:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('article').filter({ hasText: 'Sugerido por IA' }).first().getByRole('button', { name: 'Aceptar' })

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - heading "Espacio de decisiones" [level=1] [ref=f1e4]
  - generic [ref=f1e5]:
    - heading "Detalle de caso" [level=2] [ref=f1e6]
    - generic [ref=f1e7]:
      - paragraph [ref=f1e8]:
        - strong [ref=f1e9]: "Título:"
        - text: Fase8 SharePoint Nintex
      - paragraph [ref=f1e10]:
        - strong [ref=f1e11]: "Estado:"
        - text: Borrador
      - paragraph [ref=f1e12]:
        - strong [ref=f1e13]: "Relato inicial:"
        - text: Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar.
    - paragraph [ref=f1e15]:
      - strong [ref=f1e16]: "Estado:"
      - text: Borrador
    - generic [ref=f1e17]:
      - heading "Lienzo de decisión" [level=3] [ref=f1e18]
      - button "Analizar relato" [ref=f1e20] [cursor=pointer]
      - generic [ref=f1e22]:
        - heading "COBERTURA DEL ANÁLISIS" [level=4] [ref=f1e23]
        - list [ref=f1e24]:
          - listitem [ref=f1e25]: ✓ Situación
          - listitem [ref=f1e26]: ○ Exposición
          - listitem [ref=f1e27]: ○ Impacto
          - listitem [ref=f1e28]: ○ Evidencia
          - listitem [ref=f1e29]: ○ Incertidumbre
          - listitem [ref=f1e30]: ○ Intervención requerida
        - paragraph [ref=f1e31]: 1 de 6 dimensiones mínimas cubiertas.
        - paragraph [ref=f1e32]: "Falta:"
        - list [ref=f1e33]:
          - listitem [ref=f1e34]: Exposición
          - listitem [ref=f1e35]: Impacto
          - listitem [ref=f1e36]: Evidencia
          - listitem [ref=f1e37]: Incertidumbre
          - listitem [ref=f1e38]: Intervención requerida
      - region "Asistencia contextual" [ref=f1e39]:
        - heading "ASISTENCIA CONTEXTUAL" [level=4] [ref=f1e40]
        - button "Obtener siguiente pregunta" [ref=f1e41] [cursor=pointer]
        - paragraph [ref=f1e43]: "Cobertura actual: 1 de 6"
        - paragraph [ref=f1e44]: "Dimensiones faltantes: Exposición, Impacto, Evidencia, Incertidumbre, Intervención requerida"
      - generic [ref=f1e45]:
        - generic [ref=f1e46]:
          - heading "Contexto y señal" [level=4] [ref=f1e47]
          - article [ref=f1e48]:
            - paragraph [ref=f1e49]: Sugerido por IA
            - paragraph [ref=f1e50]: Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint utilizados por soluciones con Nintex Workflow.
            - generic [ref=f1e51]: Hecho
            - paragraph [ref=f1e52]:
              - strong [ref=f1e53]: "Por qué se sugiere:"
              - text: El relato indica explícitamente el hito de fin de soporte anunciado por Microsoft.
            - paragraph [ref=f1e54]: "Origen de la sugerencia: relato inicial."
            - paragraph [ref=f1e55]: Validado por el usuario.
            - generic [ref=f1e56]:
              - button "Editar" [ref=f1e57] [cursor=pointer]
              - button "Eliminar" [ref=f1e59] [cursor=pointer]
          - article [ref=f1e61]:
            - paragraph [ref=f1e62]: Sugerido por IA
            - paragraph [ref=f1e63]: La modernización comenzó en 2023 y transitó entre alternativas tecnológicas antes de definir un destino final.
            - generic [ref=f1e64]: Hecho
            - paragraph [ref=f1e65]:
              - strong [ref=f1e66]: "Por qué se sugiere:"
              - text: El relato detalla una secuencia temporal de decisiones de modernización.
            - paragraph [ref=f1e67]: "Origen de la sugerencia: relato inicial."
            - generic [ref=f1e69]:
              - button "Aceptar" [ref=f1e70] [cursor=pointer]
              - button "Editar" [ref=f1e72] [cursor=pointer]
              - button "Rechazar" [ref=f1e74] [cursor=pointer]
          - button "+ Agregar" [ref=f1e76] [cursor=pointer]
        - generic [ref=f1e78]:
          - heading "Exposición" [level=4] [ref=f1e79]
          - article [ref=f1e80]:
            - paragraph [ref=f1e81]: Sugerido por IA
            - paragraph [ref=f1e82]: Persisten soluciones en SharePoint 2016 con un motor de workflow sin soporte debido a demoras del proyecto de migración.
            - generic [ref=f1e83]: Hecho
            - paragraph [ref=f1e84]:
              - strong [ref=f1e85]: "Por qué se sugiere:"
              - text: El relato confirma exposición vigente por coexistencia de tecnología sin soporte.
            - paragraph [ref=f1e86]: "Origen de la sugerencia: relato inicial."
            - generic [ref=f1e88]:
              - button "Aceptar" [ref=f1e89] [cursor=pointer]
              - button "Editar" [ref=f1e91] [cursor=pointer]
              - button "Rechazar" [ref=f1e93] [cursor=pointer]
          - button "+ Agregar" [ref=f1e95] [cursor=pointer]
        - generic [ref=f1e97]:
          - heading "Evidencia" [level=4] [ref=f1e98]
          - paragraph [ref=f1e99]: Sin contenido
          - button "+ Agregar" [ref=f1e100] [cursor=pointer]
        - generic [ref=f1e102]:
          - heading "Impactos posibles" [level=4] [ref=f1e103]
          - paragraph [ref=f1e104]: Sin contenido
          - button "+ Agregar" [ref=f1e105] [cursor=pointer]
        - generic [ref=f1e107]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=f1e108]
          - paragraph [ref=f1e109]: Sin contenido
          - button "+ Agregar" [ref=f1e110] [cursor=pointer]
        - generic [ref=f1e112]:
          - heading "Escenarios" [level=4] [ref=f1e113]
          - paragraph [ref=f1e114]: Sin contenido
          - button "+ Agregar" [ref=f1e115] [cursor=pointer]
        - generic [ref=f1e117]:
          - heading "Alternativas" [level=4] [ref=f1e118]
          - paragraph [ref=f1e119]: Sin contenido
          - button "+ Agregar" [ref=f1e120] [cursor=pointer]
        - generic [ref=f1e122]:
          - heading "Intervención requerida" [level=4] [ref=f1e123]
          - paragraph [ref=f1e124]: Sin contenido
          - button "+ Agregar" [ref=f1e125] [cursor=pointer]
    - button "Volver a la bandeja" [ref=f1e127] [cursor=pointer]
```

# Test source

```ts
  52  |     questionsToSixOfSix: number;
  53  |     hardestDimension: string;
  54  |   };
  55  |   review: {
  56  |     initialBlockers: number;
  57  |     initialWarnings: number;
  58  |     resolvedBlockers: number;
  59  |     openWarningsAtEnd: number;
  60  |     potentialContradictions: number;
  61  |   };
  62  |   severity: {
  63  |     selected: string;
  64  |     assessedBy: string;
  65  |     aiCallsDuringSeverity: {
  66  |       analyzeNarrative: number;
  67  |       suggestNextQuestion: number;
  68  |       reviewCase: number;
  69  |       generateBrief: number;
  70  |     };
  71  |   };
  72  |   brief: {
  73  |     version: number;
  74  |     completeSections: number;
  75  |     sectionsWithLimitations: number;
  76  |     sectionsWithoutSufficientInformation: number;
  77  |     humanEdits: number;
  78  |     stale: boolean;
  79  |   };
  80  |   approval: {
  81  |     checklistComplete: boolean;
  82  |     approvedBy: string;
  83  |     aiCallsDuringApproval: {
  84  |       analyzeNarrative: number;
  85  |       suggestNextQuestion: number;
  86  |       reviewCase: number;
  87  |       generateBrief: number;
  88  |     };
  89  |     finalStatus: string;
  90  |   };
  91  |   guardrails: {
  92  |     inventedFacts: number;
  93  |     inventedFigures: number;
  94  |     inventedDates: number;
  95  |     inventedSources: number;
  96  |     inferencesAsFacts: number;
  97  |     hiddenMissingData: number;
  98  |     unauthorizedAutoTransitions: number;
  99  |     aiHumanDecisions: number;
  100 |   };
  101 |   artifacts: {
  102 |     canvas: unknown;
  103 |     aiSession: unknown;
  104 |     criticalReview: unknown;
  105 |     severityAssessment: unknown;
  106 |     briefRecord: unknown;
  107 |     approvalRecord: unknown;
  108 |   };
  109 | };
  110 | 
  111 | function zeroObservationCounters() {
  112 |   return {
  113 |     analyzeNarrative: 0,
  114 |     suggestNextQuestion: 0,
  115 |     reviewCase: 0,
  116 |     generateBrief: 0
  117 |   };
  118 | }
  119 | 
  120 | function detectExplicitDimensions(narrative: string): string[] {
  121 |   const checks: Array<{ label: string; test: RegExp }> = [
  122 |     { label: "CONTEXT", test: /venci|informó|necesitamos comprometer|evento|soporte/i },
  123 |     { label: "EXPOSURE", test: /no podemos|expuestos|incumplen|afect/i },
  124 |     { label: "EVIDENCE", test: /informó|proceso de compras|en 2023|históri|registros/i },
  125 |     { label: "IMPACT", test: /afectar|impacto|interrump|incumpl/i },
  126 |     { label: "UNCERTAINTY", test: /no resulta sencillo|no conocemos|difícil dimensionar|incertidumbre/i },
  127 |     { label: "INTERVENTION", test: /queremos|necesitamos|consulta|priorice|autorice|decida|escale/i }
  128 |   ];
  129 | 
  130 |   return checks.filter((item) => item.test.test(narrative)).map((item) => item.label);
  131 | }
  132 | 
  133 | export async function createCase(page: Page, title: string, narrative: string): Promise<void> {
  134 |   await page.goto("/");
  135 |   await page.evaluate(() => {
  136 |     localStorage.clear();
  137 |   });
  138 |   await page.reload();
  139 | 
  140 |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  141 |   await page.getByLabel("Título").fill(title);
  142 |   await page.getByLabel("¿Qué está pasando?").fill(narrative);
  143 |   await page.getByRole("button", { name: "Crear caso" }).click();
  144 |   await page.getByRole("button", { name: "Abrir" }).click();
  145 | }
  146 | 
  147 | export async function acceptNarrativeSuggestions(page: Page): Promise<{ total: number; accepted: number; edited: number; rejected: number }> {
  148 |   await page.getByRole("button", { name: "Analizar relato" }).click();
  149 | 
  150 |   const total = await page.getByText("Sugerido por IA").count();
  151 |   for (let index = 0; index < total; index += 1) {
> 152 |     await page.locator("article", { hasText: "Sugerido por IA" }).first().getByRole("button", { name: "Aceptar" }).click();
      |                                                                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  153 |   }
  154 | 
  155 |   await expect(page.getByText("Sugerido por IA")).toHaveCount(0);
  156 | 
  157 |   return {
  158 |     total,
  159 |     accepted: total,
  160 |     edited: 0,
  161 |     rejected: 0
  162 |   };
  163 | }
  164 | 
  165 | export async function runContextualQuestions(page: Page, definition: Phase8CaseDefinition): Promise<void> {
  166 |   const pending = [...definition.questionPlan];
  167 | 
  168 |   for (let index = 0; index < 10; index += 1) {
  169 |     if ((await page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/).count()) > 0) {
  170 |       break;
  171 |     }
  172 | 
  173 |     const triggerQuestionButton = page
  174 |       .getByRole("button", { name: "Obtener siguiente pregunta", exact: true })
  175 |       .or(page.getByRole("button", { name: "Siguiente pregunta", exact: true }));
  176 | 
  177 |     if ((await triggerQuestionButton.count()) === 0) {
  178 |       break;
  179 |     }
  180 | 
  181 |     await triggerQuestionButton.first().click();
  182 | 
  183 |     let matched: AnswerStep | null = null;
  184 |     for (const step of pending) {
  185 |       if ((await page.getByText(step.question).count()) > 0) {
  186 |         matched = step;
  187 |         break;
  188 |       }
  189 |     }
  190 | 
  191 |     if (matched) {
  192 |       if (matched.mode === "DONT_KNOW") {
  193 |         await page.getByRole("button", { name: "No lo sé" }).click();
  194 |       } else {
  195 |         await page.getByLabel("Respuesta").fill(matched.answer ?? "");
  196 |         await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
  197 |       }
  198 | 
  199 |       const indexToRemove = pending.findIndex((item) => item.question === matched?.question);
  200 |       if (indexToRemove >= 0) {
  201 |         pending.splice(indexToRemove, 1);
  202 |       }
  203 | 
  204 |       continue;
  205 |     }
  206 | 
  207 |     if ((await page.getByText(/respalda|evidencia disponible|registros internos/i).count()) > 0) {
  208 |       await page.getByLabel("Respuesta").fill("Existe respaldo documental de referencia y estado de avance relevado por el usuario.");
  209 |       await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
  210 |       continue;
  211 |     }
  212 | 
  213 |     if ((await page.getByText(/trabajos concretos|procesos de negocio|consecuencias operativas/i).count()) > 0) {
  214 |       await page.getByLabel("Respuesta").fill("Podrían afectarse tareas operativas relevantes y compromisos de continuidad del proceso.");
  215 |       await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
  216 |       continue;
  217 |     }
  218 | 
  219 |     if ((await page.getByText(/no conocés|información clave todavía falta|datos cuantitativos faltan/i).count()) > 0) {
  220 |       await page.getByLabel("Respuesta").fill("Persisten datos faltantes que deben relevarse antes de cerrar el análisis.");
  221 |       await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
  222 |       continue;
  223 |     }
  224 | 
  225 |     if ((await page.getByText(/necesitás concretamente|intervención concreta|decisión o priorización/i).count()) > 0) {
  226 |       await page.getByLabel("Respuesta").fill("Se requiere una intervención explícita del nivel superior para definir próximos pasos y priorización.");
  227 |       await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
  228 |       continue;
  229 |     }
  230 | 
  231 |     if ((await page.getByRole("button", { name: "No lo sé" }).count()) > 0) {
  232 |       await page.getByRole("button", { name: "No lo sé" }).click();
  233 |       continue;
  234 |     }
  235 | 
  236 |     break;
  237 |   }
  238 | 
  239 |   if ((await page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/).count()) === 0) {
  240 |     await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
  241 |     await page.getByLabel("Contenido").last().fill("Existe información de referencia interna pendiente de consolidación formal.");
  242 |     await page.getByLabel("Tipo epistemológico").last().selectOption("FACT");
  243 |     await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  244 | 
  245 |     await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
  246 |     await page.getByLabel("Contenido").last().fill("Podrían generarse impactos operativos relevantes si no se gestiona el riesgo a tiempo.");
  247 |     await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
  248 |     await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  249 | 
  250 |     await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
  251 |     await page.getByLabel("Contenido").last().fill("Persisten datos faltantes que requieren investigación externa antes de cerrar conclusiones.");
  252 |     await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
```