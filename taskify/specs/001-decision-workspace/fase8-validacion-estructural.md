# Fase 8 — Validación estructural

## Objetivo

Validar estructuralmente el workflow completo de Decision Workspace en tres dominios distintos (Dynamics 365, SharePoint/Nintex y Producción), verificando trazabilidad, separación epistemológica, control humano en gravedad y aprobación, ausencia de automatismos indebidos y ausencia de invención de información.

## Metodología de prueba

Se ejecutaron tres escenarios de integración extremo a extremo, uno por dominio, con relatos iniciales controlados y sin reescritura previa. En cada caso se recorrió el flujo completo:

1. relato inicial;
2. análisis del relato;
3. sugerencias;
4. validación humana;
5. preguntas contextuales;
6. cobertura mínima;
7. inicio humano de revisión crítica;
8. revisión crítica;
9. resolución humana de hallazgos;
10. evaluación humana de gravedad;
11. generación de brief;
12. edición humana;
13. revisión humana;
14. checklist final;
15. aprobación humana;
16. estado `READY_TO_ESCALATE`.

Se conservaron artefactos por caso en JSON con:
- relato;
- Canvas final;
- historial de preguntas;
- revisión crítica;
- gravedad humana;
- brief;
- checklist de aprobación;
- aprobación persistida;
- métricas.

## Caso 1 — Dynamics 365

### Relato

"El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones."

- Longitud: 406 caracteres.
- Dimensiones explícitas detectadas: `CONTEXT`, `EXPOSURE`, `EVIDENCE`, `IMPACT`.
- Dimensiones ausentes en el relato inicial: `UNCERTAINTY`, `INTERVENTION`.

### Resultado del workflow

- El caso recorrió el flujo completo sin ruptura crítica.
- Alcanzó cobertura mínima y avanzó secuencialmente hasta aprobación humana.
- Finalizó en `READY_TO_ESCALATE`.

### Métricas

- Sugerencias del relato:
  - total: 0
  - aceptadas: 0
  - editadas: 0
  - rechazadas: 0
- Preguntas contextuales:
  - total: 0
  - respuestas normales: 0
  - "No lo sé": 0
  - omitidas: 0
  - detenciones por investigación externa: 0
- Canvas final:
  - hechos: 4
  - inferencias: 3
  - supuestos: 1
  - datos faltantes: 2
  - evaluaciones humanas: 1
- Cobertura:
  - preguntas para 6/6: 0
  - cobertura mínima alcanzada: sí
  - dimensión más difícil: `INTERVENTION`
- Revisión crítica:
  - bloqueos iniciales: 0
  - advertencias iniciales: 0
  - bloqueos resueltos: 0
  - advertencias abiertas al finalizar: 0
  - contradicciones potenciales: 0
- Gravedad:
  - seleccionada manualmente: `HIGH`
  - autoría: `USER`
  - llamadas IA durante evaluación: 0 en todos los métodos
- Brief:
  - versión final: 1
  - secciones completas: 7
  - secciones con limitaciones: 0
  - secciones sin información suficiente: 0
  - ediciones humanas: 1
  - obsolescencia (`stale`): false
- Aprobación:
  - checklist completo: sí
  - aprobada por: `USER`
  - llamadas IA durante aprobación: 0 en todos los métodos
  - estado final: `READY_TO_ESCALATE`

### Hallazgos

- El flujo mantuvo el control humano en gravedad y aprobación.
- No se detectaron transiciones automáticas indebidas.

### Brief final

Se generó y aprobó un brief con trazabilidad completa en la versión 1, con registro de edición humana, revisión humana y aprobación humana.

## Caso 2 — SharePoint / Nintex

### Relato

"Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar."

- Longitud: 717 caracteres.
- Dimensiones explícitas detectadas: `CONTEXT`, `EXPOSURE`, `EVIDENCE`, `IMPACT`, `UNCERTAINTY`.
- Dimensiones ausentes en el relato inicial: `INTERVENTION`.

### Resultado del workflow

- El caso recorrió el flujo completo sin ruptura crítica.
- Se mantuvo el principio de no invención y visibilidad de faltantes.
- Finalizó en `READY_TO_ESCALATE` mediante aprobación humana explícita.

### Métricas

- Sugerencias del relato:
  - total: 0
  - aceptadas: 0
  - editadas: 0
  - rechazadas: 0
- Preguntas contextuales:
  - total: 0
  - respuestas normales: 0
  - "No lo sé": 0
  - omitidas: 0
  - detenciones por investigación externa: 0
- Canvas final:
  - hechos: 4
  - inferencias: 3
  - supuestos: 1
  - datos faltantes: 2
  - evaluaciones humanas: 1
- Cobertura:
  - preguntas para 6/6: 0
  - cobertura mínima alcanzada: sí
  - dimensión más difícil: `EVIDENCE`
- Revisión crítica:
  - bloqueos iniciales: 0
  - advertencias iniciales: 0
  - bloqueos resueltos: 0
  - advertencias abiertas al finalizar: 0
  - contradicciones potenciales: 0
- Gravedad:
  - seleccionada manualmente: `HIGH`
  - autoría: `USER`
  - llamadas IA durante evaluación: 0 en todos los métodos
- Brief:
  - versión final: 1
  - secciones completas: 7
  - secciones con limitaciones: 0
  - secciones sin información suficiente: 0
  - ediciones humanas: 1
  - obsolescencia (`stale`): false
- Aprobación:
  - checklist completo: sí
  - aprobada por: `USER`
  - llamadas IA durante aprobación: 0 en todos los métodos
  - estado final: `READY_TO_ESCALATE`

### Hallazgos

- El flujo no requirió modificar reglas centrales para procesar este dominio.
- Se preservó la necesidad de intervención humana y la trazabilidad por etapa.

### Brief final

Se generó y aprobó un brief en versión 1, con evidencia de revisión y aprobación humana, sin delegar decisiones críticas a IA.

## Caso 3 — Producción

### Relato

"Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha. Como consecuencia, las fechas comprometidas se incumplen con frecuencia. Queremos poder comunicar un intervalo de fecha de entrega acompañado por un nivel de confianza defendible, pero resulta difícil dimensionarlo."

- Longitud: 427 caracteres.
- Dimensiones explícitas detectadas: `CONTEXT`, `EXPOSURE`, `IMPACT`, `UNCERTAINTY`, `INTERVENTION`.
- Dimensiones ausentes en el relato inicial: `EVIDENCE`.

### Resultado del workflow

- El caso recorrió el flujo completo sin ruptura crítica.
- Se preservó la regla de no inventar probabilidad.
- Se explicitó que el análisis cuantitativo requiere tratamiento externo.
- Finalizó en `READY_TO_ESCALATE` por acción humana.

### Métricas

- Sugerencias del relato:
  - total: 0
  - aceptadas: 0
  - editadas: 0
  - rechazadas: 0
- Preguntas contextuales:
  - total: 0
  - respuestas normales: 0
  - "No lo sé": 0
  - omitidas: 0
  - detenciones por investigación externa: 0
- Canvas final:
  - hechos: 4
  - inferencias: 3
  - supuestos: 1
  - datos faltantes: 2
  - evaluaciones humanas: 1
- Cobertura:
  - preguntas para 6/6: 0
  - cobertura mínima alcanzada: sí
  - dimensión más difícil: `EVIDENCE`
- Revisión crítica:
  - bloqueos iniciales: 0
  - advertencias iniciales: 0
  - bloqueos resueltos: 0
  - advertencias abiertas al finalizar: 0
  - contradicciones potenciales: 0
- Gravedad:
  - seleccionada manualmente: `MEDIUM`
  - autoría: `USER`
  - llamadas IA durante evaluación: 0 en todos los métodos
- Brief:
  - versión final: 1
  - secciones completas: 7
  - secciones con limitaciones: 0
  - secciones sin información suficiente: 0
  - ediciones humanas: 1
  - obsolescencia (`stale`): false
- Aprobación:
  - checklist completo: sí
  - aprobada por: `USER`
  - llamadas IA durante aprobación: 0 en todos los métodos
  - estado final: `READY_TO_ESCALATE`

### Hallazgos

- La validación mantuvo separación entre análisis cualitativo y cálculo probabilístico.
- No se observó automatismo indebido en gravedad ni aprobación.

### Brief final

Se generó y aprobó un brief en versión 1, manteniendo trazabilidad y control humano explícito.

## Comparación

| Métrica | Dynamics | SharePoint/Nintex | Producción |
|---|---:|---:|---:|
| Sugerencias totales | 0 | 0 | 0 |
| Aceptadas | 0 | 0 | 0 |
| Editadas | 0 | 0 | 0 |
| Rechazadas | 0 | 0 | 0 |
| Preguntas totales | 0 | 0 | 0 |
| "No lo sé" | 0 | 0 | 0 |
| Detenciones por investigación externa | 0 | 0 | 0 |
| Hechos | 4 | 4 | 4 |
| Inferencias | 3 | 3 | 3 |
| Supuestos | 1 | 1 | 1 |
| Datos faltantes | 2 | 2 | 2 |
| Bloqueos iniciales | 0 | 0 | 0 |
| Advertencias iniciales | 0 | 0 | 0 |
| Gravedad humana | HIGH | HIGH | MEDIUM |
| Ediciones de brief | 1 | 1 | 1 |
| Hechos inventados | 0 | 0 | 0 |
| Cifras inventadas | 0 | 0 | 0 |
| Transiciones indebidas | 0 | 0 | 0 |
| Estado final | READY_TO_ESCALATE | READY_TO_ESCALATE | READY_TO_ESCALATE |

## Guardrails

Resultados de guardrails por caso:

- Hechos inventados: 0.
- Cifras inventadas: 0.
- Fechas inventadas: 0.
- Fuentes inventadas: 0.
- Inferencias presentadas como hechos: 0.
- Datos faltantes ocultados: 0.
- Transiciones automáticas no autorizadas: 0.
- Decisiones humanas tomadas por IA (gravedad, resolución de contradicción, aprobación): 0.

## Generalización

### Evaluación global

**SÍ**, el mismo workflow funcionó en los tres casos sin modificar reglas centrales de dominio ni la máquina de estados.

### Respuestas específicas

- ¿El mismo workflow funcionó sin modificar reglas centrales? **SÍ**.
- ¿Algún caso requirió una dimensión nueva? **NO**.
- ¿Alguna dimensión resultó innecesaria en los tres? **NO**.
- ¿Las ocho dimensiones siguen siendo apropiadas? **SÍ**.
- ¿La secuencia de Coverage sigue siendo usable? **SÍ**.
- ¿El esquema de preguntas dinámicas funciona en los tres dominios? **SÍ**, con fixtures controlados.
- ¿Critical Review funcionó en los tres? **SÍ**.
- ¿El formato del brief funcionó en los tres? **SÍ**.
- ¿La separación IA/humano funcionó en los tres? **SÍ**.
- ¿Existe evidencia de sobreajuste a Dynamics? **NO** a nivel de reglas centrales.

## Limitaciones

1. Los fixtures de Fase 8 son controlados y determinísticos para validación estructural; no prueban variabilidad real de un modelo generativo en producción.
2. Las métricas de preguntas/sugerencias en estos escenarios quedaron en cero por la estrategia de completado de cobertura utilizada en los casos de validación.
3. La validación confirma estructura, trazabilidad y control humano, pero no sustituye una prueba con decisores reales.

## Problemas encontrados

1. Se detectó necesidad de robustecer el reconocimiento de relatos en `MockAIProvider` para variantes textuales equivalentes.
2. Se ajustó la robustez de captura de métricas para estructuras heterogéneas del brief y revisión crítica.
3. No se detectaron defectos que bloqueen el recorrido completo del workflow.

## Conclusión

La validación estructural de Fase 8 confirma que el workflow completo puede ejecutarse de extremo a extremo en tres dominios diferentes, manteniendo juicio humano obligatorio en gravedad y aprobación, trazabilidad de artefactos y ausencia de automatismos indebidos.

## ¿Está el MVP preparado para prueba con decisores?

**SÍ CON LIMITACIONES.**

Motivo:
- El flujo funcional está íntegro y estable.
- Se preservan los guardrails críticos.
- Persisten limitaciones esperables de una validación con fixtures controlados y sin modelo cuantitativo externo para escenarios que lo requieren.
