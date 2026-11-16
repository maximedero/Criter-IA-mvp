# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slice6-dynamics-contextual-assistance.spec.ts >> slice6 dynamics contextual assistance flow
- Location: tests\e2e\slice6-dynamics-contextual-assistance.spec.ts:7:1

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
- main [ref=e3]:
  - heading "Espacio de decisiones" [level=1] [ref=e4]
  - generic [ref=e5]:
    - heading "Detalle de caso" [level=2] [ref=e6]
    - generic [ref=e7]:
      - paragraph [ref=e8]:
        - strong [ref=e9]: "Título:"
        - text: Contrato Dynamics 365 Slice6
      - paragraph [ref=e10]:
        - strong [ref=e11]: "Estado:"
        - text: Borrador
      - paragraph [ref=e12]:
        - strong [ref=e13]: "Relato inicial:"
        - text: El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.
    - paragraph [ref=e15]:
      - strong [ref=e16]: "Estado:"
      - text: Borrador
    - generic [ref=e17]:
      - heading "Lienzo de decisión" [level=3] [ref=e18]
      - button "Analizar relato" [ref=e20] [cursor=pointer]
      - generic [ref=e22]:
        - heading "COBERTURA DEL ANÁLISIS" [level=4] [ref=e23]
        - list [ref=e24]:
          - listitem [ref=e25]: ✓ Situación
          - listitem [ref=e26]: ✓ Exposición
          - listitem [ref=e27]: ○ Impacto
          - listitem [ref=e28]: ○ Evidencia
          - listitem [ref=e29]: ○ Incertidumbre
          - listitem [ref=e30]: ○ Intervención requerida
        - paragraph [ref=e31]: 2 de 6 dimensiones mínimas cubiertas.
        - paragraph [ref=e32]: "Falta:"
        - list [ref=e33]:
          - listitem [ref=e34]: Impacto
          - listitem [ref=e35]: Evidencia
          - listitem [ref=e36]: Incertidumbre
          - listitem [ref=e37]: Intervención requerida
      - region "Asistencia contextual" [ref=e38]:
        - heading "ASISTENCIA CONTEXTUAL" [level=4] [ref=e39]
        - button "Obtener siguiente pregunta" [ref=e40] [cursor=pointer]
        - paragraph [ref=e42]: Pregunta activa cargada.
        - generic [ref=e43]:
          - heading "Pregunta activa" [level=5] [ref=e44]
          - paragraph [ref=e45]:
            - strong [ref=e46]: "Dimensión:"
            - text: Impactos posibles
          - paragraph [ref=e47]:
            - strong [ref=e48]: "Pregunta:"
            - text: ¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?
          - paragraph [ref=e49]:
            - strong [ref=e50]: "Por qué importa:"
            - text: Esta información permite dimensionar el posible impacto operativo.
          - generic [ref=e51]:
            - generic [ref=e52]:
              - text: Respuesta
              - textbox "Respuesta" [active] [ref=e53]: Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.
            - generic [ref=e54]:
              - text: Tipo epistemológico
              - combobox "Tipo epistemológico" [ref=e55]:
                - option "Hecho"
                - option "Inferencia" [selected]
                - option "Supuesto"
                - option "Dato faltante"
                - option "Evaluación humana"
            - generic [ref=e56]:
              - button "Agregar respuesta al lienzo" [ref=e57] [cursor=pointer]
              - button "No lo sé" [ref=e59] [cursor=pointer]
              - button "Omitir por ahora" [ref=e61] [cursor=pointer]
        - paragraph [ref=e63]: "Cobertura actual: 2 de 6"
        - paragraph [ref=e64]: "Dimensiones faltantes: Impacto, Evidencia, Incertidumbre, Intervención requerida"
      - generic [ref=e65]:
        - generic [ref=e66]:
          - heading "Contexto y señal" [level=4] [ref=e67]
          - article [ref=e68]:
            - paragraph [ref=e69]: Sugerido por IA
            - paragraph [ref=e70]: El contrato con el proveedor venció el 31/10/2026.
            - generic [ref=e71]: Hecho
            - paragraph [ref=e72]:
              - strong [ref=e73]: "Por qué se sugiere:"
              - text: El relato presenta explícitamente el vencimiento y su fecha.
            - paragraph [ref=e74]: "Origen de la sugerencia: relato inicial."
            - paragraph [ref=e75]: Validado por el usuario.
            - generic [ref=e76]:
              - button "Editar" [ref=e77] [cursor=pointer]
              - button "Eliminar" [ref=e79] [cursor=pointer]
          - article [ref=e81]:
            - paragraph [ref=e82]: Sugerido por IA
            - paragraph [ref=e83]: El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.
            - generic [ref=e84]: Hecho
            - paragraph [ref=e85]:
              - strong [ref=e86]: "Por qué se sugiere:"
              - text: El relato describe explícitamente una condición transitoria posterior al vencimiento.
            - paragraph [ref=e87]: "Origen de la sugerencia: relato inicial."
            - generic [ref=e89]:
              - button "Aceptar" [ref=e90] [cursor=pointer]
              - button "Editar" [ref=e92] [cursor=pointer]
              - button "Rechazar" [ref=e94] [cursor=pointer]
          - button "+ Agregar" [ref=e96] [cursor=pointer]
        - generic [ref=e98]:
          - heading "Exposición" [level=4] [ref=e99]
          - article [ref=e100]:
            - paragraph [ref=e101]: Sugerido por IA
            - paragraph [ref=e102]: Actualmente no pueden iniciarse nuevos proyectos ni tareas.
            - generic [ref=e103]: Hecho
            - paragraph [ref=e104]:
              - strong [ref=e105]: "Por qué se sugiere:"
              - text: El relato expresa una restricción operativa vigente.
            - paragraph [ref=e106]: "Origen de la sugerencia: relato inicial."
            - paragraph [ref=e107]: Validado por el usuario.
            - generic [ref=e108]:
              - button "Editar" [ref=e109] [cursor=pointer]
              - button "Eliminar" [ref=e111] [cursor=pointer]
          - button "+ Agregar" [ref=e113] [cursor=pointer]
        - generic [ref=e115]:
          - heading "Evidencia" [level=4] [ref=e116]
          - paragraph [ref=e117]: Sin contenido
          - button "+ Agregar" [ref=e118] [cursor=pointer]
        - generic [ref=e120]:
          - heading "Impactos posibles" [level=4] [ref=e121]
          - paragraph [ref=e122]: Sin contenido
          - button "+ Agregar" [ref=e123] [cursor=pointer]
        - generic [ref=e125]:
          - heading "Incertidumbres y datos faltantes" [level=4] [ref=e126]
          - paragraph [ref=e127]: Sin contenido
          - button "+ Agregar" [ref=e128] [cursor=pointer]
        - generic [ref=e130]:
          - heading "Escenarios" [level=4] [ref=e131]
          - paragraph [ref=e132]: Sin contenido
          - button "+ Agregar" [ref=e133] [cursor=pointer]
        - generic [ref=e135]:
          - heading "Alternativas" [level=4] [ref=e136]
          - paragraph [ref=e137]: Sin contenido
          - button "+ Agregar" [ref=e138] [cursor=pointer]
        - generic [ref=e140]:
          - heading "Intervención requerida" [level=4] [ref=e141]
          - paragraph [ref=e142]: Sin contenido
          - button "+ Agregar" [ref=e143] [cursor=pointer]
    - button "Volver a la bandeja" [ref=e145] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | const TITLE = "Contrato Dynamics 365 Slice6";
  4   | const NARRATIVE =
  5   |   "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";
  6   | 
  7   | test("slice6 dynamics contextual assistance flow", async ({ page }) => {
  8   |   await page.goto("/");
  9   | 
  10  |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  11  |   await page.getByLabel("Título").fill(TITLE);
  12  |   await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  13  |   await page.getByRole("button", { name: "Crear caso" }).click();
  14  |   await page.getByRole("button", { name: "Abrir" }).click();
  15  | 
  16  |   await page.getByRole("button", { name: "Analizar relato" }).click();
  17  |   await expect(page.getByText("Sugerido por IA")).toHaveCount(3);
  18  | 
  19  |   await page
  20  |     .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
  21  |     .getByRole("button", { name: "Aceptar" })
  22  |     .click();
  23  |   await page
  24  |     .locator("article", { hasText: "Actualmente no pueden iniciarse nuevos proyectos ni tareas." })
  25  |     .getByRole("button", { name: "Aceptar" })
  26  |     .click();
  27  | 
  28  |   await expect(page.getByText("2 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  29  | 
  30  |   await page.getByRole("button", { name: "Obtener siguiente pregunta" }).click();
  31  |   await expect(page.getByText("¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?")).toBeVisible();
  32  | 
  33  |   await page
  34  |     .getByLabel("Respuesta")
  35  |     .fill("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.");
> 36  |   await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      |                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  37  | 
  38  |   await expect(page.getByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).toBeVisible();
  39  |   await expect(page.getByText("3 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  40  | 
  41  |   await page.getByRole("button", { name: "Siguiente pregunta", exact: true }).click();
  42  |   await expect(
  43  |     page.getByText("¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?")
  44  |   ).toBeVisible();
  45  | 
  46  |   await page.getByRole("button", { name: "No lo sé" }).click();
  47  | 
  48  |   await expect(
  49  |     page.getByText(
  50  |       "No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones."
  51  |     )
  52  |   ).toBeVisible();
  53  | 
  54  |   await expect(page.getByRole("heading", { name: "Evidencia" })).toBeVisible();
  55  |   await expect(page.getByRole("heading", { name: "Incertidumbres y datos faltantes" })).toBeVisible();
  56  | 
  57  |   await page.getByRole("button", { name: "Siguiente pregunta", exact: true }).click();
  58  |   await expect(page.getByText("La evidencia necesaria requiere investigación o consulta externa").first()).toBeVisible();
  59  | 
  60  |   await page.reload();
  61  |   await page.getByRole("row", { name: new RegExp(TITLE) }).getByRole("button", { name: "Abrir" }).click();
  62  | 
  63  |   await expect(page.getByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).toBeVisible();
  64  |   await expect(
  65  |     page.getByText(
  66  |       "No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones."
  67  |     )
  68  |   ).toBeVisible();
  69  |   await expect(page.getByText("La evidencia necesaria requiere investigación o consulta externa").first()).toBeVisible();
  70  | 
  71  |   await expect(page.getByRole("button", { name: "Iniciar revisión" })).toHaveCount(0);
  72  | });
  73  | 
  74  | test("slice6 minimum coverage stop does not auto transition", async ({ page }) => {
  75  |   await page.goto("/");
  76  | 
  77  |   await page.getByRole("button", { name: "Nuevo caso" }).click();
  78  |   await page.getByLabel("Título").fill("Slice6 Full Coverage");
  79  |   await page.getByLabel("¿Qué está pasando?").fill(NARRATIVE);
  80  |   await page.getByRole("button", { name: "Crear caso" }).click();
  81  |   await page.getByRole("button", { name: "Abrir" }).click();
  82  | 
  83  |   await page.getByRole("button", { name: "Analizar relato" }).click();
  84  | 
  85  |   await page
  86  |     .locator("article", { hasText: "El contrato con el proveedor venció el 31/10/2026." })
  87  |     .getByRole("button", { name: "Aceptar" })
  88  |     .click();
  89  |   await page
  90  |     .locator("article", { hasText: "Actualmente no pueden iniciarse nuevos proyectos ni tareas." })
  91  |     .getByRole("button", { name: "Aceptar" })
  92  |     .click();
  93  | 
  94  |   await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
  95  |   await page.getByLabel("Contenido").fill("Existe respaldo documental interno sobre necesidad de continuidad.");
  96  |   await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();
  97  | 
  98  |   await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
  99  |   await page.getByLabel("Contenido").fill("Sin continuidad podrían quedar sin atención requerimientos de mantenimiento.");
  100 |   await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
  101 |   await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();
  102 | 
  103 |   await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
  104 |   await page.getByLabel("Contenido").fill("No conocemos el plazo definitivo de contratación.");
  105 |   await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
  106 |   await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();
  107 | 
  108 |   await page.getByRole("button", { name: "+ Agregar" }).nth(7).click();
  109 |   await page.getByLabel("Contenido").fill("Se requiere que el superior priorice y consulte alternativas con Compras.");
  110 |   await page.getByLabel("Tipo epistemológico").last().selectOption("HUMAN_EVALUATION");
  111 |   await page.locator("form").last().getByRole("button", { name: "Agregar" }).click();
  112 | 
  113 |   await expect(page.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
  114 |   await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
  115 | 
  116 |   await page.getByRole("button", { name: "Obtener siguiente pregunta" }).click();
  117 | 
  118 |   await expect(page.getByText("Ya existe cobertura mínima").first()).toBeVisible();
  119 | 
  120 |   await expect(page.getByText("Revisión crítica pendiente.")).toHaveCount(0);
  121 |   await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
  122 | });
  123 | 
```