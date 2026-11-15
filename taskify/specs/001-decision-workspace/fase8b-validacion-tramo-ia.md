# Fase 8B — Validación del tramo aumentado con IA

## Objetivo

Validar explícitamente el tramo aumentado con IA del MVP, separado del tramo determinístico ya validado en Fase 8:

relato inicial → `analyzeNarrative` → sugerencias IA → validación humana → cobertura parcial → `suggestNextQuestion` → preguntas → respuestas humanas → cobertura mínima o detención legítima.

## Alcance y reglas aplicadas

- No se reimplementó la Fase 8.
- No se modificaron reglas centrales de dominio ni de estados.
- No se agregaron funcionalidades de producto.
- Cada escenario inició con:
  - caso nuevo;
  - relato inicial;
  - Canvas vacío;
  - cobertura 0/6.
- No se sembraron `CanvasItem` iniciales.
- No se saltaron `analyzeNarrative` ni `suggestNextQuestion`.

## Metodología

Se ejecutó una prueba integrada para cada caso (Dynamics, SharePoint/Nintex, Producción) con el siguiente patrón:

1. Crear caso y verificar Canvas inicial vacío.
2. Verificar cobertura inicial 0/6.
3. Ejecutar `Analizar relato`.
4. Registrar sugerencias IA y aplicar acciones humanas:
   - al menos 1 aceptar;
   - al menos 1 editar;
   - al menos 1 rechazar (cuando hay suficientes sugerencias).
5. Verificar cobertura parcial luego de sugerencias (`>0/6` y `<6/6`).
6. Ejecutar preguntas contextuales con `Obtener siguiente pregunta` / `Siguiente pregunta`.
7. Registrar preguntas y respuestas humanas.
8. Forzar al menos una abstención con `No lo sé` en SharePoint y Producción.
9. Verificar ausencia de transición automática de estado.
10. Verificar guardrails de no invención.

## Resultados por caso

### Caso Dynamics

- Cobertura inicial: 0/6.
- Sugerencias IA: 3.
- Acciones humanas sobre sugerencias:
  - aceptadas: 1;
  - editadas: 1;
  - rechazadas: 1.
- Cobertura después de sugerencias: 1/6.
- Preguntas contextuales: 5.
- Respuestas normales: 5.
- "No lo sé": 0.
- Detenciones: 0.
- Cobertura final: 6/6.
- Datos faltantes descubiertos: 1.
- Transición automática: no.

### Caso SharePoint/Nintex

- Cobertura inicial: 0/6.
- Sugerencias IA: 3.
- Acciones humanas sobre sugerencias:
  - aceptadas: 1;
  - editadas: 1;
  - rechazadas: 1.
- Cobertura después de sugerencias: 1/6.
- Preguntas contextuales: 4.
- Respuestas normales: 3.
- "No lo sé": 1.
- Detenciones: 1.
- Cobertura final: 5/6 (detención legítima del tramo aumentado).
- Datos faltantes descubiertos: 1.
- Transición automática: no.

### Caso Producción

- Cobertura inicial: 0/6.
- Sugerencias IA: 3.
- Acciones humanas sobre sugerencias:
  - aceptadas: 1;
  - editadas: 1;
  - rechazadas: 1.
- Cobertura después de sugerencias: 2/6.
- Preguntas contextuales: 2.
- Respuestas normales: 1.
- "No lo sé": 1.
- Detenciones: 1.
- Cobertura final: 4/6 (detención legítima por información faltante relevante).
- Datos faltantes descubiertos: 1.
- Transición automática: no.

## Tabla comparativa

| Métrica | Dynamics | SharePoint/Nintex | Producción |
|---|---:|---:|---:|
| Sugerencias totales | 3 | 3 | 3 |
| Aceptadas | 1 | 1 | 1 |
| Editadas | 1 | 1 | 1 |
| Rechazadas | 1 | 1 | 1 |
| Cobertura después de sugerencias | 1/6 | 1/6 | 2/6 |
| Preguntas totales | 5 | 4 | 2 |
| Respuestas normales | 5 | 3 | 1 |
| "No lo sé" | 0 | 1 | 1 |
| Omitidas | 0 | 0 | 0 |
| Detenciones | 0 | 1 | 1 |
| Cobertura final | 6/6 | 5/6 | 4/6 |
| Datos faltantes descubiertos | 1 | 1 | 1 |
| Hechos inventados | 0 | 0 | 0 |
| Cifras inventadas | 0 | 0 | 0 |
| Fechas inventadas | 0 | 0 | 0 |
| Fuentes inventadas | 0 | 0 | 0 |

## Qué demostró realmente esta prueba

### A. Generalización del workflow determinístico

No fue el foco principal de Fase 8B, pero se mantuvo consistente: no hubo transición automática y el flujo conservó control humano.

### B. Generalización del tramo aumentado

Sí quedó validada en los tres dominios:
- `analyzeNarrative` produjo sugerencias > 0;
- hubo validación humana sobre sugerencias;
- `suggestNextQuestion` produjo preguntas > 0;
- hubo respuestas humanas y abstenciones explícitas (`No lo sé`) donde correspondía;
- el sistema no inventó datos para cerrar faltantes.

### C. Lo que sigue sin estar validado por usar MockAIProvider

- Variabilidad real de un modelo generativo en producción.
- Robustez de calidad semántica fuera de fixtures controlados.
- Comportamiento frente a relatos ambiguos no contemplados por fixtures.

## Guardrails

En los tres casos:
- hechos inventados = 0;
- cifras inventadas = 0;
- fechas inventadas = 0;
- fuentes inventadas = 0;
- sin transición automática indebida.

Además, en esta fase no se ejecutaron tramos de gravedad ni aprobación; por lo tanto no hubo intervención IA sobre decisiones humanas.

## Pruebas ejecutadas

- `npm run test:e2e:fase8b --workspace frontend` ✅
- `npm run test:unit --workspace frontend` ✅
- `npm run test:component --workspace frontend` ✅
- `npm run build --workspace frontend` ✅

## Artefactos generados

- `specs/001-decision-workspace/fase8b/dynamics.json`
- `specs/001-decision-workspace/fase8b/sharepoint.json`
- `specs/001-decision-workspace/fase8b/produccion.json`

## Decisión

**FASE 8 COMPLETA**

Justificación:
- `suggestions > 0` en 3/3;
- `questions > 0` en 3/3;
- Canvas inicial vacío en 3/3;
- cobertura inicial 0/6 en 3/3;
- cobertura después de sugerencias < 6/6 en 3/3;
- acciones humanas sobre sugerencias en 3/3;
- respuestas humanas a preguntas en 3/3;
- en SharePoint y Producción hubo abstención explícita con `No lo sé`;
- guardrails sin violaciones.
