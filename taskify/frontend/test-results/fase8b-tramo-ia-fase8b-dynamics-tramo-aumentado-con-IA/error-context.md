# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fase8b-tramo-ia.spec.ts >> fase8b dynamics tramo aumentado con IA
- Location: tests\e2e\fase8b-tramo-ia.spec.ts:279:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Agregar respuesta al Canvas' })

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
        - text: Fase8B Dynamics
      - paragraph [ref=f1e10]:
        - strong [ref=f1e11]: "Estado:"
        - text: Borrador
      - paragraph [ref=f1e12]:
        - strong [ref=f1e13]: "Relato inicial:"
        - text: El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones.
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
        - paragraph [ref=f1e43]: Pregunta activa cargada.
        - generic [ref=f1e44]:
          - heading "Pregunta activa" [level=5] [ref=f1e45]
          - paragraph [ref=f1e46]:
            - strong [ref=f1e47]: "Dimensión:"
            - text: Exposición
          - paragraph [ref=f1e48]:
            - strong [ref=f1e49]: "Pregunta:"
            - text: ¿Qué sistemas, procesos, proyectos, áreas, personas o resultados podrían verse afectados?
          - paragraph [ref=f1e50]:
            - strong [ref=f1e51]: "Por qué importa:"
            - text: Esta información permite delimitar la exposición actual.
          - generic [ref=f1e52]:
            - generic [ref=f1e53]:
              - text: Respuesta
              - textbox "Respuesta" [active] [ref=f1e54]: Respuesta registrada por el usuario para completar la dimensión faltante del análisis.
            - generic [ref=f1e55]:
              - text: Tipo epistemológico
              - combobox "Tipo epistemológico" [ref=f1e56]:
                - option "Hecho"
                - option "Inferencia" [selected]
                - option "Supuesto"
                - option "Dato faltante"
                - option "Evaluación humana"
            - generic [ref=f1e57]:
              - button "Agregar respuesta al lienzo" [ref=f1e58] [cursor=pointer]
              - button "No lo sé" [ref=f1e60] [cursor=pointer]
              - button "Omitir por ahora" [ref=f1e62] [cursor=pointer]
        - paragraph [ref=f1e64]: "Cobertura actual: 1 de 6"
        - paragraph [ref=f1e65]: "Dimensiones faltantes: Exposición, Impacto, Evidencia, Incertidumbre, Intervención requerida"
      - generic [ref=f1e66]:
        - generic [ref=f1e67]:
          - heading "Contexto y señal" [level=4] [ref=f1e68]
          - article [ref=f1e69]:
            - paragraph [ref=f1e70]: Sugerido por IA
            - paragraph [ref=f1e71]: El contrato con el proveedor venció el 31/10/2026.
            - generic [ref=f1e72]: Hecho
            - paragraph [ref=f1e73]:
              - strong [ref=f1e74]: "Por qué se sugiere:"
              - text: El relato presenta explícitamente el vencimiento y su fecha.
            - paragraph [ref=f1e75]: "Origen de la sugerencia: relato inicial."
            - paragraph [ref=f1e76]: Validado por el usuario.
            - generic [ref=f1e77]:
              - button "Editar" [ref=f1e78] [cursor=pointer]
              - button "Eliminar" [ref=f1e80] [cursor=pointer]
          - article [ref=f1e82]:
            - paragraph [ref=f1e83]: Sugerido por IA
            - paragraph [ref=f1e84]: El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso. (aclarado por el usuario)
            - generic [ref=f1e85]: Hecho
            - paragraph [ref=f1e86]:
              - strong [ref=f1e87]: "Por qué se sugiere:"
              - text: El relato describe explícitamente una condición transitoria posterior al vencimiento.
            - paragraph [ref=f1e88]: "Origen de la sugerencia: relato inicial."
            - paragraph [ref=f1e89]: Editado por el usuario.
            - generic [ref=f1e90]:
              - button "Editar" [ref=f1e91] [cursor=pointer]
              - button "Eliminar" [ref=f1e93] [cursor=pointer]
          - button "+ Agregar" [ref=f1e95] [cursor=pointer]
        - generic [ref=f1e97]:
          - heading "Exposición" [level=4] [ref=f1e98]
          - button "+ Agregar" [ref=f1e99] [cursor=pointer]
        - generic [ref=f1e101]:
          - heading "Evidencia" [level=4] [ref=f1e102]
          - paragraph [ref=f1e103]: Sin contenido
          - button "+ Agregar" [ref=f1e104] [cursor=pointer]
        - generic [ref=f1e106]:
          - heading "Impactos posibles" [level=4] [ref=f1e107]
          - paragraph [ref=f1e108]: Sin contenido
          - button "+ Agregar" [ref=f1e109] [cursor=pointer]
        - generic [ref=f1e111]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=f1e112]
          - paragraph [ref=f1e113]: Sin contenido
          - button "+ Agregar" [ref=f1e114] [cursor=pointer]
        - generic [ref=f1e116]:
          - heading "Escenarios" [level=4] [ref=f1e117]
          - paragraph [ref=f1e118]: Sin contenido
          - button "+ Agregar" [ref=f1e119] [cursor=pointer]
        - generic [ref=f1e121]:
          - heading "Alternativas" [level=4] [ref=f1e122]
          - paragraph [ref=f1e123]: Sin contenido
          - button "+ Agregar" [ref=f1e124] [cursor=pointer]
        - generic [ref=f1e126]:
          - heading "Intervención requerida" [level=4] [ref=f1e127]
          - paragraph [ref=f1e128]: Sin contenido
          - button "+ Agregar" [ref=f1e129] [cursor=pointer]
    - button "Volver a la bandeja" [ref=f1e131] [cursor=pointer]
```

# Test source

```ts
  24  |   titulo: "Fase8B Dynamics",
  25  |   relato:
  26  |     "El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones.",
  27  |   requiereNoLoSe: false
  28  | };
  29  | 
  30  | const SHAREPOINT: CaseDefinition = {
  31  |   nombre: "sharepoint",
  32  |   titulo: "Fase8B SharePoint Nintex",
  33  |   relato:
  34  |     "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar.",
  35  |   requiereNoLoSe: true
  36  | };
  37  | 
  38  | const PRODUCCION: CaseDefinition = {
  39  |   nombre: "produccion",
  40  |   titulo: "Fase8B Producción",
  41  |   relato:
  42  |     "Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha. Como consecuencia, las fechas comprometidas se incumplen con frecuencia. Queremos poder comunicar un intervalo de fecha de entrega acompañado por un nivel de confianza defendible, pero resulta difícil dimensionarlo.",
  43  |   requiereNoLoSe: true
  44  | };
  45  | 
  46  | async function leerEstadoCaso(page: Page): Promise<string> {
  47  |   return page.evaluate(() => {
  48  |     const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
  49  |     return cases[0]?.status ?? "UNKNOWN";
  50  |   });
  51  | }
  52  | 
  53  | async function clickSiguientePregunta(page: Page): Promise<boolean> {
  54  |   const boton = page
  55  |     .getByRole("button", { name: "Obtener siguiente pregunta", exact: true })
  56  |     .or(page.getByRole("button", { name: "Siguiente pregunta", exact: true }));
  57  | 
  58  |   if ((await boton.count()) === 0) {
  59  |     return false;
  60  |   }
  61  | 
  62  |   await boton.first().click();
  63  |   return true;
  64  | }
  65  | 
  66  | async function responderPregunta(page: Page, caso: CaseDefinition, yaUsoNoLoSe: boolean): Promise<{ usadaNoLoSe: boolean; detalle: string | null; detencion: boolean }> {
  67  |   const mensajesDetencion = [
  68  |     "investigación o consulta externa",
  69  |     "No se identificó otra pregunta material",
  70  |     "Ya existe cobertura mínima"
  71  |   ];
  72  | 
  73  |   for (const mensaje of mensajesDetencion) {
  74  |     if ((await page.getByText(mensaje).count()) > 0) {
  75  |       return { usadaNoLoSe: false, detalle: null, detencion: true };
  76  |     }
  77  |   }
  78  | 
  79  |   const candidatos = [
  80  |     "¿Qué sistemas, procesos, proyectos, áreas, personas o resultados podrían verse afectados?",
  81  |     "¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?",
  82  |     "¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?",
  83  |     "¿Qué información relevante todavía no conocés para evaluar este riesgo?",
  84  |     "¿Qué necesitás concretamente que tu superior comprenda, consulte, priorice, autorice, decida o escale?",
  85  |     "¿Qué soluciones continúan dependiendo de workflows de SharePoint con Nintex?",
  86  |     "¿Qué procesos de negocio podrían interrumpirse si un workflow deja de funcionar?",
  87  |     "¿Qué evidencia disponible respalda el estado actual de migración y las dependencias remanentes?",
  88  |     "¿Qué información clave todavía falta para estimar la exposición de continuidad?",
  89  |     "¿Qué intervención concreta necesitás del nivel superior para reducir este riesgo?",
  90  |     "¿Qué compromisos o áreas quedan más expuestos cuando se incumple una fecha comprometida?",
  91  |     "¿Qué consecuencias operativas concretas se observan cuando no se cumple la fecha comprometida?",
  92  |     "¿Qué información histórica o registros internos hoy existen sobre cumplimiento de fechas?",
  93  |     "¿Qué datos cuantitativos faltan para estimar un nivel de confianza de entrega?",
  94  |     "¿Qué decisión o priorización necesitás del nivel superior para encarar este análisis de cumplimiento?"
  95  |   ];
  96  | 
  97  |   let preguntaDetectada: string | null = null;
  98  |   for (const candidato of candidatos) {
  99  |     if ((await page.getByText(candidato).count()) > 0) {
  100 |       preguntaDetectada = candidato;
  101 |       break;
  102 |     }
  103 |   }
  104 | 
  105 |   if (!preguntaDetectada) {
  106 |     return { usadaNoLoSe: false, detalle: null, detencion: false };
  107 |   }
  108 | 
  109 |   const convieneNoLoSe =
  110 |     caso.requiereNoLoSe &&
  111 |     !yaUsoNoLoSe &&
  112 |     /evidencia|información histórica|datos cuantitativos|soluciones continúan/i.test(preguntaDetectada);
  113 | 
  114 |   if (convieneNoLoSe && (await page.getByRole("button", { name: "No lo sé" }).count()) > 0) {
  115 |     await page.getByRole("button", { name: "No lo sé" }).click();
  116 |     return { usadaNoLoSe: true, detalle: preguntaDetectada, detencion: false };
  117 |   }
  118 | 
  119 |   if ((await page.getByLabel("Respuesta").count()) > 0) {
  120 |     const respuesta = /datos cuantitativos/i.test(preguntaDetectada)
  121 |       ? "Se requiere análisis cuantitativo externo para estimar confianza defendible."
  122 |       : "Respuesta registrada por el usuario para completar la dimensión faltante del análisis.";
  123 |     await page.getByLabel("Respuesta").fill(respuesta);
> 124 |     await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      |                                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  125 |     return { usadaNoLoSe: false, detalle: preguntaDetectada, detencion: false };
  126 |   }
  127 | 
  128 |   return { usadaNoLoSe: false, detalle: preguntaDetectada, detencion: false };
  129 | }
  130 | 
  131 | async function ejecutarTramoAumentado(page: Page, caso: CaseDefinition): Promise<Fase8bCaseMetrics> {
  132 |   await crearCasoVacio(page, caso.titulo, caso.relato);
  133 | 
  134 |   const canvasInicial = await obtenerEstadoCanvas(page);
  135 |   expect(canvasInicial.length).toBe(0);
  136 | 
  137 |   const coberturaInicial = await obtenerCoberturaActual(page);
  138 |   expect(coberturaInicial).toBe("0/6");
  139 | 
  140 |   await page.evaluate(() => {
  141 |     localStorage.setItem(
  142 |       "dw.ai.observation",
  143 |       JSON.stringify({
  144 |         analyzeNarrative: 0,
  145 |         suggestNextQuestion: 0,
  146 |         reviewCase: 0,
  147 |         generateBrief: 0
  148 |       })
  149 |     );
  150 |   });
  151 | 
  152 |   await page.getByRole("button", { name: "Analizar relato" }).click();
  153 | 
  154 |   const canvasConSugerencias = await obtenerEstadoCanvas(page);
  155 |   const sugerenciasPendientes = canvasConSugerencias.filter((item) => item.validationStatus === "PENDING");
  156 |   expect(sugerenciasPendientes.length).toBeGreaterThan(0);
  157 | 
  158 |   const detalleSugerencias = sugerenciasPendientes.map((item) => ({
  159 |     dimension: item.dimension,
  160 |     tipoEpistemologico: item.epistemicType,
  161 |     contenido: item.content
  162 |   }));
  163 | 
  164 |   let aceptadas = 0;
  165 |   let editadas = 0;
  166 |   let rechazadas = 0;
  167 | 
  168 |   if (sugerenciasPendientes[0]) {
  169 |     await page.locator("article", { hasText: sugerenciasPendientes[0].content }).getByRole("button", { name: "Aceptar" }).click();
  170 |     aceptadas += 1;
  171 |   }
  172 | 
  173 |   if (sugerenciasPendientes[1]) {
  174 |     const articulo = page.locator("article", { hasText: sugerenciasPendientes[1].content });
  175 |     await articulo.getByRole("button", { name: "Editar" }).click();
  176 |     await page.getByLabel("Editar sugerencia").fill(`${sugerenciasPendientes[1].content} (aclarado por el usuario)`);
  177 |     await page.getByRole("button", { name: "Guardar edición" }).click();
  178 |     editadas += 1;
  179 |   }
  180 | 
  181 |   if (sugerenciasPendientes[2]) {
  182 |     await page.locator("article", { hasText: sugerenciasPendientes[2].content }).getByRole("button", { name: "Rechazar" }).click();
  183 |     rechazadas += 1;
  184 |   }
  185 | 
  186 |   const coberturaDespuesSugerencias = await obtenerCoberturaActual(page);
  187 |   expect(coberturaNumerica(coberturaDespuesSugerencias)).toBeGreaterThan(0);
  188 |   expect(coberturaNumerica(coberturaDespuesSugerencias)).toBeLessThan(6);
  189 | 
  190 |   const preguntasDetalle: string[] = [];
  191 |   let respuestasNormales = 0;
  192 |   let noLoSe = 0;
  193 |   let detenciones = 0;
  194 |   let usoNoLoSe = false;
  195 | 
  196 |   for (let i = 0; i < 10; i += 1) {
  197 |     const cobertura = await obtenerCoberturaActual(page);
  198 |     if (cobertura === "6/6") {
  199 |       break;
  200 |     }
  201 | 
  202 |     const pudoPedir = await clickSiguientePregunta(page);
  203 |     if (!pudoPedir) {
  204 |       break;
  205 |     }
  206 | 
  207 |     const respuesta = await responderPregunta(page, caso, usoNoLoSe);
  208 | 
  209 |     if (respuesta.detalle) {
  210 |       preguntasDetalle.push(respuesta.detalle);
  211 |     }
  212 | 
  213 |     if (respuesta.detencion) {
  214 |       detenciones += 1;
  215 |       break;
  216 |     }
  217 | 
  218 |     if (respuesta.usadaNoLoSe) {
  219 |       noLoSe += 1;
  220 |       usoNoLoSe = true;
  221 |     } else if (respuesta.detalle) {
  222 |       respuestasNormales += 1;
  223 |     }
  224 |   }
```