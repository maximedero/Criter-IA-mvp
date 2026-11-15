# Tasks: Decision Workspace MVP (Frontend-Only Vertical Slices)

**Input**: Constitution + Specification + Plan approved for `001-decision-workspace`  
**Goal**: Build demonstrable vertical slices to validate product hypothesis.  
**Scope guard**: No backend, no SQLite, no Supertest, no RAG, no Graph, no auth, no agents, no corporate integrations, no production deployment.

---

## SLICE 0 — Foundation

### T001
- **ID**: T001
- **Slice**: SLICE 0 — Foundation
- **Objetivo observable**: La app React+TS+Vite inicia localmente con estructura de carpetas objetivo.
- **Archivos estimados**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/src/main.tsx`, `frontend/src/app/App.tsx`
- **Requisito / User Story**: Base transversal para US1-US8
- **Dependencias**: Ninguna
- **Criterio de aceptación**: `npm run dev:frontend` levanta la app sin errores.
- **Test requerido**: Smoke test de arranque (unit básico)
- **Paralelo**: No

### T002
- **ID**: T002
- **Slice**: SLICE 0 — Foundation
- **Objetivo observable**: Queda habilitada la estrategia de testing (Vitest + RTL + Playwright).
- **Archivos estimados**: `frontend/vitest.config.ts`, `frontend/tests/setup.ts`, `frontend/playwright.config.ts`, `frontend/package.json`
- **Requisito / User Story**: Calidad transversal
- **Dependencias**: T001
- **Criterio de aceptación**: comandos de test definidos y ejecutables.
- **Test requerido**: Test de ejemplo unit/component/e2e pasa.
- **Paralelo**: Sí

### T003
- **ID**: T003
- **Slice**: SLICE 0 — Foundation
- **Objetivo observable**: Estructura de dominio, storage y AIProvider creada para implementación incremental.
- **Archivos estimados**: `frontend/src/domain/**`, `frontend/src/providers/ai/**`, `frontend/src/providers/storage/**`, `frontend/src/validation/**`
- **Requisito / User Story**: FR-021..FR-033 (bases)
- **Dependencias**: T001
- **Criterio de aceptación**: imports/resolución de módulos correctos.
- **Test requerido**: Unit test de carga de módulos.
- **Paralelo**: Sí

---

## SLICE 1 — Case Inbox

### T004
- **ID**: T004
- **Slice**: SLICE 1 — Case Inbox
- **Objetivo observable**: Crear casos desde Inbox con `title`, `informalDescription`, `createdAt`, `expiresAt`.
- **Archivos estimados**: `frontend/src/features/inbox/InboxPage.tsx`, `frontend/src/domain/models/DecisionCase.ts`, `frontend/src/providers/storage/casesStorage.ts`
- **Requisito / User Story**: US1, FR-001, FR-003
- **Dependencias**: T003
- **Criterio de aceptación**: Nuevo caso aparece en listado inmediatamente.
- **Test requerido**: Component test de creación de caso.
- **Paralelo**: No

### T005
- **ID**: T005
- **Slice**: SLICE 1 — Case Inbox
- **Objetivo observable**: Listar y abrir casos persistidos en localStorage.
- **Archivos estimados**: `frontend/src/features/inbox/InboxList.tsx`, `frontend/src/app/router.tsx`, `frontend/src/providers/storage/casesStorage.ts`
- **Requisito / User Story**: US1, FR-001
- **Dependencias**: T004
- **Criterio de aceptación**: Recarga de página conserva casos y permite reabrir.
- **Test requerido**: Unit test de persistencia + e2e de reload.
- **Paralelo**: No

### T006
- **ID**: T006
- **Slice**: SLICE 1 — Case Inbox
- **Objetivo observable**: Política de retención elimina casos expirados al iniciar/listar.
- **Archivos estimados**: `frontend/src/domain/rules/retentionRules.ts`, `frontend/src/providers/storage/casesStorage.ts`
- **Requisito / User Story**: NFR-013
- **Dependencias**: T005
- **Criterio de aceptación**: Casos vencidos no aparecen tras bootstrap.
- **Test requerido**: Unit tests de retención (`createdAt`/`expiresAt`).
- **Paralelo**: Sí

---

## SLICE 2 — Manual Decision Canvas

### T007
- **ID**: T007
- **Slice**: SLICE 2 — Manual Decision Canvas
- **Objetivo observable**: Renderizar 8 dimensiones del canvas por caso.
- **Archivos estimados**: `frontend/src/features/canvas/CanvasPage.tsx`, `frontend/src/domain/models/CanvasDimension.ts`
- **Requisito / User Story**: US2, FR-002
- **Dependencias**: T005
- **Criterio de aceptación**: Las 8 dimensiones son visibles y navegables.
- **Test requerido**: Component test de render de dimensiones.
- **Paralelo**: No

### T008
- **ID**: T008
- **Slice**: SLICE 2 — Manual Decision Canvas
- **Objetivo observable**: Crear/editar/rechazar elementos manuales por dimensión.
- **Archivos estimados**: `frontend/src/features/canvas/StatementEditor.tsx`, `frontend/src/providers/storage/canvasStorage.ts`, `frontend/src/domain/workflow/canvasActions.ts`
- **Requisito / User Story**: US2, FR-006, FR-008
- **Dependencias**: T007
- **Criterio de aceptación**: Cambios persisten y estados se actualizan.
- **Test requerido**: Component + unit tests de acciones.
- **Paralelo**: No

### T009
- **ID**: T009
- **Slice**: SLICE 2 — Manual Decision Canvas
- **Objetivo observable**: Soportar tipos epistemológicos HECHO/INFERENCIA/SUPUESTO/DATO FALTANTE/EVALUACIÓN HUMANA.
- **Archivos estimados**: `frontend/src/domain/models/Statement.ts`, `frontend/src/features/canvas/EpistemicTypeSelector.tsx`
- **Requisito / User Story**: US4, FR-009
- **Dependencias**: T008
- **Criterio de aceptación**: Cada elemento permite tipificación y visualización.
- **Test requerido**: Unit tests de enums/validación + component test selector.
- **Paralelo**: Sí

---

## SLICE 3 — Coverage Engine (sin IA)

### T010
- **ID**: T010
- **Slice**: SLICE 3 — Coverage Engine
- **Objetivo observable**: Motor determinístico calcula cobertura mínima de brief.
- **Archivos estimados**: `frontend/src/domain/rules/coverageRules.ts`, `frontend/src/domain/models/CoverageResult.ts`
- **Requisito / User Story**: FR-024..FR-027, US7
- **Dependencias**: T009
- **Criterio de aceptación**: Resultado de cobertura explica qué falta y por qué.
- **Test requerido**: Unit tests de reglas.
- **Paralelo**: No

### T011
- **ID**: T011
- **Slice**: SLICE 3 — Coverage Engine
- **Objetivo observable**: Integrar coverage status en UI del canvas.
- **Archivos estimados**: `frontend/src/features/canvas/CoveragePanel.tsx`, `frontend/src/features/canvas/CanvasPage.tsx`
- **Requisito / User Story**: US7, FR-021
- **Dependencias**: T010
- **Criterio de aceptación**: Usuario ve cobertura satisfecha/no satisfecha en tiempo real.
- **Test requerido**: Component tests de panel.
- **Paralelo**: Sí

### T012
- **ID**: T012
- **Slice**: SLICE 3 — Coverage Engine
- **Objetivo observable**: Validar reglas solicitadas en batería dedicada.
- **Archivos estimados**: `frontend/tests/unit/coverageRules.test.ts`
- **Requisito / User Story**: Reglas explícitas de C1/C2
- **Dependencias**: T010
- **Criterio de aceptación**: Incluye tests para: validado, editado, pendiente IA, rechazado, incertidumbre explícita y No aplica.
- **Test requerido**: Unit tests obligatorios
- **Paralelo**: Sí

---

## SLICE 4 — Case Workflow (sin IA para estados)

### T013
- **ID**: T013
- **Slice**: SLICE 4 — Case Workflow
- **Objetivo observable**: State machine del caso implementada con transiciones válidas/inválidas.
- **Archivos estimados**: `frontend/src/domain/workflow/caseStateMachine.ts`, `frontend/src/domain/models/CaseStatus.ts`
- **Requisito / User Story**: FR-026, sección 7.1/7.5
- **Dependencias**: T010
- **Criterio de aceptación**: Transiciones inválidas devuelven error de dominio.
- **Test requerido**: Unit tests de state machine.
- **Paralelo**: No

### T014
- **ID**: T014
- **Slice**: SLICE 4 — Case Workflow
- **Objetivo observable**: UI de estado permite sólo transiciones permitidas.
- **Archivos estimados**: `frontend/src/features/inbox/CaseStatusControl.tsx`, `frontend/src/features/inbox/InboxPage.tsx`
- **Requisito / User Story**: US1, FR-026
- **Dependencias**: T013
- **Criterio de aceptación**: Usuario no puede forzar estados inválidos.
- **Test requerido**: Component test de control de estados.
- **Paralelo**: Sí

---

## SLICE 5 — MockAIProvider

### T015
- **ID**: T015
- **Slice**: SLICE 5 — MockAIProvider
- **Objetivo observable**: Interfaz `AIProvider` definida con métodos requeridos.
- **Archivos estimados**: `frontend/src/providers/ai/AIProvider.ts`
- **Requisito / User Story**: Decisión de arquitectura AIProvider
- **Dependencias**: T003
- **Criterio de aceptación**: API incluye `analyzeNarrative`, `suggestNextQuestion`, `reviewCase`, `generateBrief`.
- **Test requerido**: Unit test de contrato de interfaz.
- **Paralelo**: Sí

### T016
- **ID**: T016
- **Slice**: SLICE 5 — MockAIProvider
- **Objetivo observable**: `MockAIProvider` retorna salidas estructuradas y determinísticas para demo.
- **Archivos estimados**: `frontend/src/providers/ai/MockAIProvider.ts`
- **Requisito / User Story**: US3/US5/US7
- **Dependencias**: T015
- **Criterio de aceptación**: Respuestas reproducibles por fixture/caso.
- **Test requerido**: Unit tests de outputs por método.
- **Paralelo**: No

### T017
- **ID**: T017
- **Slice**: SLICE 5 — MockAIProvider
- **Objetivo observable**: Todas las salidas IA validadas con Zod antes de uso.
- **Archivos estimados**: `frontend/src/validation/aiSchemas.ts`, `frontend/src/providers/ai/aiParsing.ts`
- **Requisito / User Story**: Regla de salidas IA estructuradas
- **Dependencias**: T016
- **Criterio de aceptación**: Salida inválida no impacta canvas ni brief.
- **Test requerido**: Unit tests de validación Zod.
- **Paralelo**: Sí

---

## SLICE 6 — Contextual Assistance

### T018
- **ID**: T018
- **Slice**: SLICE 6 — Contextual Assistance
- **Objetivo observable**: Flujo de una pregunta dinámica por vez integrado al canvas.
- **Archivos estimados**: `frontend/src/features/canvas/QuestionPanel.tsx`, `frontend/src/domain/workflow/questionLoop.ts`
- **Requisito / User Story**: US3, FR-010, FR-014
- **Dependencias**: T017, T011
- **Criterio de aceptación**: Nunca hay dos preguntas activas simultáneamente.
- **Test requerido**: Component + unit tests de loop.
- **Paralelo**: No

### T019
- **ID**: T019
- **Slice**: SLICE 6 — Contextual Assistance
- **Objetivo observable**: Soportar respuestas normal, No lo sé, No aplica, Omitir por ahora.
- **Archivos estimados**: `frontend/src/features/canvas/QuestionResponseActions.tsx`, `frontend/src/domain/workflow/questionResponses.ts`
- **Requisito / User Story**: FR-011, FR-012, FR-013
- **Dependencias**: T018
- **Criterio de aceptación**: Cada opción actualiza estado esperado sin autogeneración de contenido.
- **Test requerido**: Unit tests de respuestas + component tests.
- **Paralelo**: Sí

### T020
- **ID**: T020
- **Slice**: SLICE 6 — Contextual Assistance
- **Objetivo observable**: Actualización del canvas como sugerencia pendiente de validación.
- **Archivos estimados**: `frontend/src/domain/workflow/suggestionPipeline.ts`, `frontend/src/features/canvas/SuggestionCard.tsx`
- **Requisito / User Story**: FR-005, FR-008
- **Dependencias**: T019
- **Criterio de aceptación**: Sugerencias no cuentan para cobertura hasta validar/editar.
- **Test requerido**: Unit tests de pipeline + component test de estados.
- **Paralelo**: Sí

---

## SLICE 7 — Critical Review

### T021
- **ID**: T021
- **Slice**: SLICE 7 — Critical Review
- **Objetivo observable**: Engine de revisión clasifica bloqueo crítico y advertencia.
- **Archivos estimados**: `frontend/src/domain/rules/reviewRules.ts`, `frontend/src/domain/models/ReviewFinding.ts`
- **Requisito / User Story**: US5, FR-016..FR-020
- **Dependencias**: T010, T020
- **Criterio de aceptación**: Hallazgos incluyen tipo, nivel y causa verificable.
- **Test requerido**: Unit tests de hallazgos.
- **Paralelo**: No

### T022
- **ID**: T022
- **Slice**: SLICE 7 — Critical Review
- **Objetivo observable**: Contradicción potencial exige aclaración humana antes de resolución.
- **Archivos estimados**: `frontend/src/domain/workflow/contradictionResolution.ts`, `frontend/src/features/review/ContradictionPrompt.tsx`
- **Requisito / User Story**: FR-017, FR-018
- **Dependencias**: T021
- **Criterio de aceptación**: El sistema no selecciona por sí solo un hecho contradictorio.
- **Test requerido**: Unit tests de flujo de aclaración.
- **Paralelo**: Sí

---

## SLICE 8 — Human Severity

### T023
- **ID**: T023
- **Slice**: SLICE 8 — Human Severity
- **Objetivo observable**: Selector de gravedad con Sin evaluar/Baja/Media/Alta/Crítica.
- **Archivos estimados**: `frontend/src/features/canvas/SeveritySelector.tsx`, `frontend/src/domain/models/Severity.ts`
- **Requisito / User Story**: US6, FR-022, FR-023
- **Dependencias**: T014
- **Criterio de aceptación**: Solo usuario cambia gravedad; IA no sugiere ni preselecciona.
- **Test requerido**: Component + unit tests.
- **Paralelo**: Sí

---

## SLICE 9 — Decision Brief

### T024
- **ID**: T024
- **Slice**: SLICE 9 — Decision Brief
- **Objetivo observable**: Generar brief ejecutivo y vista expandida auditable.
- **Archivos estimados**: `frontend/src/domain/workflow/briefBuilder.ts`, `frontend/src/features/brief/BriefView.tsx`
- **Requisito / User Story**: US7, FR-024..FR-025
- **Dependencias**: T010, T021, T023
- **Criterio de aceptación**: Brief muestra incertidumbres, fuentes y tipos epistemológicos.
- **Test requerido**: Unit tests builder + component tests.
- **Paralelo**: No

### T025
- **ID**: T025
- **Slice**: SLICE 9 — Decision Brief
- **Objetivo observable**: Bloquear generación cuando no cumple cobertura mínima.
- **Archivos estimados**: `frontend/src/features/brief/BriefGatePanel.tsx`, `frontend/src/domain/rules/coverageRules.ts`
- **Requisito / User Story**: FR-024, FR-026, FR-027
- **Dependencias**: T024
- **Criterio de aceptación**: Usuario ve faltantes; no se produce brief final hasta cumplir gate.
- **Test requerido**: Unit + component tests de bloqueo.
- **Paralelo**: Sí

---

## SLICE 10 — Human Approval

### T026
- **ID**: T026
- **Slice**: SLICE 10 — Human Approval
- **Objetivo observable**: Checklist visible de condiciones de Listo para elevar.
- **Archivos estimados**: `frontend/src/features/brief/ReadyChecklist.tsx`, `frontend/src/domain/rules/readyToElevateRules.ts`
- **Requisito / User Story**: FR-028, FR-029
- **Dependencias**: T024, T025, T021, T023
- **Criterio de aceptación**: Checklist refleja condiciones reales del caso.
- **Test requerido**: Unit + component tests.
- **Paralelo**: No

### T027
- **ID**: T027
- **Slice**: SLICE 10 — Human Approval
- **Objetivo observable**: Aprobación explícita + confirmación final + transición a LISTO PARA ELEVAR.
- **Archivos estimados**: `frontend/src/features/brief/ApproveBriefFlow.tsx`, `frontend/src/domain/workflow/caseStateMachine.ts`
- **Requisito / User Story**: FR-029, FR-030
- **Dependencias**: T026
- **Criterio de aceptación**: Sin confirmación final no hay transición; IA no puede ejecutar/confirmar.
- **Test requerido**: Component + unit tests de transición.
- **Paralelo**: No

---

## SLICE 11 — Fixtures + E2E

### T028
- **ID**: T028
- **Slice**: SLICE 11 — Fixtures + E2E
- **Objetivo observable**: Fixtures funcionales para Dynamics, SharePoint/Nintex y Producción en localStorage.
- **Archivos estimados**: `frontend/src/fixtures/dynamics.ts`, `frontend/src/fixtures/sharepoint-nintex.ts`, `frontend/src/fixtures/produccion.ts`, `frontend/src/providers/storage/seedFixtures.ts`
- **Requisito / User Story**: FR-032
- **Dependencias**: T005
- **Criterio de aceptación**: Cada fixture crea caso navegable de punta a punta.
- **Test requerido**: Unit test de seed/load fixtures.
- **Paralelo**: Sí

### T029
- **ID**: T029
- **Slice**: SLICE 11 — Fixtures + E2E
- **Objetivo observable**: Playwright recorre workflow completo para Dynamics.
- **Archivos estimados**: `frontend/tests/e2e/dynamics-workflow.spec.ts`
- **Requisito / User Story**: US1-US8
- **Dependencias**: T027, T028
- **Criterio de aceptación**: Caso llega a LISTO PARA ELEVAR cumpliendo gates.
- **Test requerido**: E2E obligatorio
- **Paralelo**: Sí

### T030
- **ID**: T030
- **Slice**: SLICE 11 — Fixtures + E2E
- **Objetivo observable**: Playwright recorre workflow completo para SharePoint/Nintex.
- **Archivos estimados**: `frontend/tests/e2e/sharepoint-nintex-workflow.spec.ts`
- **Requisito / User Story**: US1-US8
- **Dependencias**: T027, T028
- **Criterio de aceptación**: Caso llega a estado final correcto con incertidumbres visibles.
- **Test requerido**: E2E obligatorio
- **Paralelo**: Sí

### T031
- **ID**: T031
- **Slice**: SLICE 11 — Fixtures + E2E
- **Objetivo observable**: Playwright recorre workflow completo para Producción.
- **Archivos estimados**: `frontend/tests/e2e/produccion-workflow.spec.ts`
- **Requisito / User Story**: US1-US8
- **Dependencias**: T027, T028
- **Criterio de aceptación**: Caso llega a estado final correcto sin violar control humano.
- **Test requerido**: E2E obligatorio
- **Paralelo**: Sí

---

## Dependencias críticas

1. Slice 0 bloquea todos los demás.
2. Slice 3 (Coverage Engine) bloquea Slice 9 y Slice 10.
3. Slice 4 + Slice 7 + Slice 8 bloquean transición final de aprobación.
4. Slice 10 bloquea validación E2E completa de Slice 11.
