# Tasks: Executive Communication Composer

**Input**: Constitution + `spec.md` + `plan.md` aprobados para `002-executive-communication-composer`  
**Alcance**: Iteración frontend-only con cambios mínimos sobre arquitectura actual.  
**Guardrail**: Sin backend, sin RealAIProvider, sin agentes, sin RAG, sin envío, sin integraciones externas.

---

## SLICE A — Contratos del compositor

### T001
- **ID**: T001
- **Slice**: SLICE A — Contratos del compositor
- **Archivos**:
  - `frontend/src/domain/models/DecisionBrief.ts`
- **Dependencias**: Ninguna
- **Criterio de aceptación**: Existe el modelo de input de composición con campos funcionales cerrados (`caseId`, `caseTitle`, `audience`, `validatedCanvasItems`, `criticalReview`, `openWarnings`, `humanSeverityAssessment`, `structuredBrief`, `requiredIntervention`, `language`).
- **Tests**: `frontend/tests/unit/brief-workflow.test.ts` (nuevo caso de contrato de input)
- **Paralelo**: No

### T002
- **ID**: T002
- **Slice**: SLICE A — Contratos del compositor
- **Archivos**:
  - `frontend/src/domain/models/DecisionBrief.ts`
- **Dependencias**: T001
- **Criterio de aceptación**: Existe el modelo de output compuesto con `email`, `message`, `traceability` y `compositionMetadata`.
- **Tests**: `frontend/tests/unit/mock-ai-provider.test.ts` (shape del resultado)
- **Paralelo**: No

### T003
- **ID**: T003
- **Slice**: SLICE A — Contratos del compositor
- **Archivos**:
  - `frontend/src/validation/aiSchemas.ts`
- **Dependencias**: T001, T002
- **Criterio de aceptación**: Schemas Zod validan input/output de composición y rechazan campos fuera de alcance.
- **Tests**: `frontend/tests/unit/brief-workflow.test.ts` + nuevos tests de parseo en `frontend/tests/unit/mock-ai-provider.test.ts`
- **Paralelo**: No

### T004
- **ID**: T004
- **Slice**: SLICE A — Contratos del compositor
- **Archivos**:
  - `frontend/src/domain/workflow/briefWorkflow.ts`
  - `frontend/src/validation/aiSchemas.ts`
- **Dependencias**: T003
- **Criterio de aceptación**: Grounding contractual filtra automáticamente sólo `VALIDATED`/`EDITED` y excluye `PENDING`/`REJECTED`/`SUPERSEDED`.
- **Tests**:
  - `frontend/tests/unit/brief-workflow.test.ts` (filtros de input)
  - `frontend/tests/unit/mock-ai-provider.test.ts` (no uso de contenido excluido)
- **Paralelo**: No

---

## SLICE B — Composición narrativa

### T005
- **ID**: T005
- **Slice**: SLICE B — Composición narrativa
- **Archivos**:
  - `frontend/src/providers/ai/MockAIProvider.ts`
  - `frontend/src/providers/ai/aiParsing.ts`
- **Dependencias**: T004
- **Criterio de aceptación**: Prompt/instrucción RCTA queda explícito y auditable para correo + mensaje, en español y con prudencia epistemológica.
- **Tests**: `frontend/tests/unit/mock-ai-provider.test.ts` (comportamiento narrativo base)
- **Paralelo**: No

### T006
- **ID**: T006
- **Slice**: SLICE B — Composición narrativa
- **Archivos**:
  - `frontend/src/providers/ai/MockAIProvider.ts`
  - `frontend/src/domain/workflow/briefWorkflow.ts`
- **Dependencias**: T005
- **Criterio de aceptación**: Regla anti-mapeo mecánico detecta headings rígidos, estructura 1:1 por dimensión, repetición excesiva, lenguaje interno y falta de cierre con pedido/pregunta.
- **Tests**: `frontend/tests/unit/mock-ai-provider.test.ts` + test comparativo mecánico vs compuesto
- **Paralelo**: No

### T007
- **ID**: T007
- **Slice**: SLICE B — Composición narrativa
- **Archivos**:
  - `frontend/src/providers/ai/MockAIProvider.ts`
  - `frontend/tests/e2e/slice9-executive-communication-scenarios.spec.ts`
- **Dependencias**: T006
- **Criterio de aceptación**: Fixture Dynamics produce correo/mensaje narrativos sin inventar alcance contractual, tiempos de Compras ni impactos no validados.
- **Tests**: E2E Dynamics + unit provider para fixture Dynamics
- **Paralelo**: Sí (con T008 y T009)

### T008
- **ID**: T008
- **Slice**: SLICE B — Composición narrativa
- **Archivos**:
  - `frontend/src/providers/ai/MockAIProvider.ts`
  - `frontend/tests/e2e/slice9-executive-communication-scenarios.spec.ts`
- **Dependencias**: T006
- **Criterio de aceptación**: Fixture SharePoint/Nintex no inventa cantidades, criticidad, costo ni probabilidad.
- **Tests**: E2E SharePoint/Nintex + unit provider para fixture SharePoint
- **Paralelo**: Sí (con T007 y T009)

### T009
- **ID**: T009
- **Slice**: SLICE B — Composición narrativa
- **Archivos**:
  - `frontend/src/providers/ai/MockAIProvider.ts`
  - `frontend/tests/e2e/slice9-executive-communication-scenarios.spec.ts`
- **Dependencias**: T006
- **Criterio de aceptación**: Fixture Producción expresa múltiples áreas, falta de evidencia consolidada para probabilidad y pedido de intervención transversal sin inventar fechas/intervalos/porcentajes.
- **Tests**: E2E Producción + unit provider para fixture Producción
- **Paralelo**: Sí (con T007 y T008)

---

## SLICE C — Persistencia

### T010
- **ID**: T010
- **Slice**: SLICE C — Persistencia
- **Archivos**:
  - `frontend/src/domain/models/DecisionBrief.ts`
- **Dependencias**: T002
- **Criterio de aceptación**: `DecisionBrief` incorpora estructura final de comunicación compuesta y metadatos requeridos sin romper contratos actuales.
- **Tests**: `frontend/tests/unit/brief-workflow.test.ts` (compatibilidad de modelo)
- **Paralelo**: No

### T011
- **ID**: T011
- **Slice**: SLICE C — Persistencia
- **Archivos**:
  - `frontend/src/providers/storage/briefStorage.ts`
- **Dependencias**: T010
- **Criterio de aceptación**: `briefStorage` persiste comunicación compuesta, conserva historial y evita sobrescribir versión válida cuando falla regeneración.
- **Tests**: `frontend/tests/unit/brief-storage-error.test.ts`
- **Paralelo**: No

### T012
- **ID**: T012
- **Slice**: SLICE C — Persistencia
- **Archivos**:
  - `frontend/src/providers/storage/briefStorage.ts`
  - `frontend/tests/unit/brief-storage-error.test.ts`
- **Dependencias**: T011
- **Criterio de aceptación**: Migración legacy no destructiva normaliza registros sin `communication`; briefs legacy siguen consultables.
- **Tests**: nuevos casos legacy en `brief-storage-error.test.ts`
- **Paralelo**: No

### T013
- **ID**: T013
- **Slice**: SLICE C — Persistencia
- **Archivos**:
  - `frontend/src/providers/storage/briefStorage.ts`
  - `frontend/src/domain/workflow/briefWorkflow.ts`
- **Dependencias**: T011, T012
- **Criterio de aceptación**: Regenerar crea nueva versión como `current`, mueve previa a `history` y no hereda approval/review.
- **Tests**: `frontend/tests/unit/brief-workflow.test.ts` + `human-approval-workflow.test.ts`
- **Paralelo**: No

---

## SLICE D — UX

### T014
- **ID**: T014
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
  - `frontend/src/features/brief/brief-workspace.css`
- **Dependencias**: T010
- **Criterio de aceptación**: Vista inicial en `BRIEF_DRAFT` es “Comunicación ejecutiva”; orden de vistas: Comunicación ejecutiva → Brief ejecutivo → Análisis completo y trazabilidad.
- **Tests**: `frontend/tests/component/slice9-brief.test.tsx`
- **Paralelo**: No

### T015
- **ID**: T015
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T014
- **Criterio de aceptación**: Se muestra bloque “Próximo paso” dinámico arriba del contenido principal en estados avanzados.
- **Tests**: `frontend/tests/component/slice9-brief.test.tsx`
- **Paralelo**: Sí (con T016)

### T016
- **ID**: T016
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
  - `frontend/src/features/brief/brief-workspace.css`
- **Dependencias**: T014
- **Criterio de aceptación**: Se muestra resumen compacto de Cobertura, Revisión, Gravedad, Brief y Aprobación.
- **Tests**: `frontend/tests/component/slice9-brief.test.tsx`
- **Paralelo**: Sí (con T015)

### T017
- **ID**: T017
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T014, T005
- **Criterio de aceptación**: Se renderiza bloque de correo ejecutivo con asunto y cuerpo narrativos (sin headings de ficha).
- **Tests**: component test + e2e comunicación
- **Paralelo**: Sí (con T018)

### T018
- **ID**: T018
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T014, T005
- **Criterio de aceptación**: Se renderiza bloque de mensaje breve, autónomo y más corto que el correo.
- **Tests**: component test + e2e comunicación
- **Paralelo**: Sí (con T017)

### T019
- **ID**: T019
- **Slice**: SLICE D — UX
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T014
- **Criterio de aceptación**: “Análisis completo y trazabilidad” permanece accesible como vista secundaria sin eliminar Canvas/traza.
- **Tests**: `frontend/tests/component/slice9-brief.test.tsx`
- **Paralelo**: Sí

---

## SLICE E — Human-in-the-loop

### T020
- **ID**: T020
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/domain/workflow/briefWorkflow.ts`
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T017, T018
- **Criterio de aceptación**: Editar asunto/cuerpo correo/cuerpo mensaje conserva texto exacto, setea `editedByUser=true`, actualiza `updatedAt` y no invoca IA.
- **Tests**: unit `brief-workflow.test.ts` + component `slice9-brief.test.tsx`
- **Paralelo**: No

### T021
- **ID**: T021
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
  - `frontend/src/providers/storage/briefStorage.ts`
- **Dependencias**: T020, T013
- **Criterio de aceptación**: Regenerar requiere acción humana explícita y confirmación previa si existe edición.
- **Tests**: component + e2e regeneración
- **Paralelo**: No

### T022
- **ID**: T022
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/domain/workflow/briefWorkflow.ts`
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T021
- **Criterio de aceptación**: Stale bloquea copia y revisión como vigentes hasta regeneración/revisión aplicable.
- **Tests**: unit stale + e2e stale
- **Paralelo**: Sí (con T023)

### T023
- **ID**: T023
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/domain/workflow/briefWorkflow.ts`
  - `frontend/src/domain/workflow/humanApprovalWorkflow.ts`
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T020, T021
- **Criterio de aceptación**: Editar o regenerar invalida `reviewedByUser`; approval no se hereda y requiere nueva revisión.
- **Tests**: `brief-workflow.test.ts` + `human-approval-workflow.test.ts`
- **Paralelo**: Sí (con T022)

### T024
- **ID**: T024
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T022, T023
- **Criterio de aceptación**: “Copiar como correo/mensaje” respeta formato, no llama IA, no cambia estado, no crea versión y no activa integraciones.
- **Tests**: component de clipboard + e2e de no side-effects
- **Paralelo**: No

### T025
- **ID**: T025
- **Slice**: SLICE E — Human-in-the-loop
- **Archivos**:
  - `frontend/src/features/brief/BriefWorkspace.tsx`
- **Dependencias**: T024
- **Criterio de aceptación**: Errores de portapapeles muestran mensaje en español y preservan consistencia de estado.
- **Tests**: component test de error clipboard
- **Paralelo**: Sí

---

## SLICE F — Validación

### T026
- **ID**: T026
- **Slice**: SLICE F — Validación
- **Archivos**:
  - `frontend/tests/unit/mock-ai-provider.test.ts`
  - `frontend/tests/unit/brief-workflow.test.ts`
- **Dependencias**: T004, T006, T020, T023
- **Criterio de aceptación**: Batería unitaria cubre grounding, no invención, severidad exacta, intervención exacta, salida no mecánica y reglas human-in-the-loop.
- **Tests**: unit obligatorios de composición + workflow
- **Paralelo**: Sí (con T027 y T028)

### T027
- **ID**: T027
- **Slice**: SLICE F — Validación
- **Archivos**:
  - `frontend/tests/component/slice9-brief.test.tsx`
- **Dependencias**: T015, T016, T017, T018, T019, T024, T025
- **Criterio de aceptación**: Pruebas de componente validan jerarquía UI, edición, copia, stale, confirmaciones y UI en español.
- **Tests**: component suite de brief
- **Paralelo**: Sí (con T026 y T028)

### T028
- **ID**: T028
- **Slice**: SLICE F — Validación
- **Archivos**:
  - `frontend/tests/e2e/slice9-executive-communication.spec.ts`
  - `frontend/tests/e2e/slice9-executive-communication-scenarios.spec.ts`
- **Dependencias**: T007, T008, T009, T021, T024
- **Criterio de aceptación**: E2E Producción/Dynamics/SharePoint verifican síntesis narrativa, incertidumbre material, no invención y conteo esperado de llamadas IA.
- **Tests**: E2E obligatorios por fixture
- **Paralelo**: Sí (con T026 y T027)

### T029
- **ID**: T029
- **Slice**: SLICE F — Validación
- **Archivos**:
  - `frontend/tests/unit/mock-ai-provider.test.ts`
- **Dependencias**: T006
- **Criterio de aceptación**: Test comparativo mecánico vs compuesto demuestra: sin headings rígidos, menor repetición, mayor síntesis manteniendo incertidumbre/gravedad/intervención sin afirmaciones nuevas.
- **Tests**: unit comparativo dedicado
- **Paralelo**: Sí

### T030
- **ID**: T030
- **Slice**: SLICE F — Validación
- **Archivos**:
  - `frontend/tests/unit/**`
  - `frontend/tests/component/**`
  - `frontend/tests/e2e/**`
- **Dependencias**: T026, T027, T028, T029
- **Criterio de aceptación**: Pasa regresión completa (unit + component + Slices 1–10 + Slice 9 stale/preconditions + Fase 8/8B + build), sin debilitar tests existentes.
- **Tests**: ejecución integral de regresión
- **Paralelo**: No

---

## Dependencias críticas de ejecución

1. **Bloque contractual**: T001 → T002 → T003 → T004.
2. **Bloque narrativo**: T005 → T006 → (T007/T008/T009).
3. **Bloque persistencia/versionado**: T010 → T011 → T012 → T013.
4. **Bloque UX mínimo demostrable**: T014 → (T017 y T018).
5. **Bloque human-in-the-loop**: T020 → T021 → (T022/T023) → T024.
6. **Cierre de calidad**: T026/T027/T028/T029 → T030.

## Primer comportamiento demostrable

Al completar **T014 + T017 + T018 + T020**, el usuario puede ver “Comunicación ejecutiva” por defecto en `BRIEF_DRAFT`, editar correo/mensaje y conservar persistencia local sin llamadas IA adicionales durante edición.
