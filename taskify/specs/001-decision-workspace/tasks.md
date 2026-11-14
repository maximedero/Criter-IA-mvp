# Tasks: Decision Workspace MVP

**Input**: Design documents from `/specs/001-decision-workspace/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included. Contract, integration, unit, E2E, and AI behavior
evaluation tests are required by the specification and success criteria.

**Organization**: Tasks are grouped by user story for independent
implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (US1..US8)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize repo structure and toolchain.

- [x] T001 Create base folders `backend/src`, `backend/tests`,
      `frontend/src`, `frontend/tests`
- [x] T002 Initialize backend Node/Fastify project in
      `backend/package.json`
- [x] T003 [P] Initialize frontend React/Vite project in
      `frontend/package.json`
- [x] T004 [P] Configure TypeScript in `backend/tsconfig.json` and
      `frontend/tsconfig.json`
- [x] T005 [P] Configure lint/format scripts in `backend/package.json`
      and `frontend/package.json`
- [x] T006 Add root workspace scripts in `package.json` for
      dev/test/build

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and platform capabilities required by all stories.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [x] T007 Implement domain enums and shared types in
      `backend/src/domain/types.ts`
- [x] T008 Implement SQLite connection and migration bootstrap in
      `backend/src/services/db.ts`
- [x] T009 [P] Create base schema validation with Zod in
      `backend/src/validation/schemas.ts`
- [x] T010 [P] Implement API server bootstrap and error middleware in
      `backend/src/api/server.ts`
- [x] T011 Implement `AiProvider` interface + mock adapter in
      `backend/src/providers/ai-provider.ts`
- [x] T012 [P] Implement audit event writer in
      `backend/src/services/audit-service.ts`
- [x] T013 Implement retention cleanup job (90 days) in
      `backend/src/services/retention-service.ts`
- [x] T014 [P] Create frontend app shell and global routing in
      `frontend/src/app/router.tsx`
- [x] T015 Implement shared API client in
      `frontend/src/services/api-client.ts`

**Checkpoint**: Foundation ready.

---

## Phase 3: User Story 1 - Crear un caso desde una señal informal
**Priority: P1** 🎯 MVP

**Goal**: Crear casos con título/relato y estado inicial `borrador`.

**Independent Test**: Crear caso desde Inbox con título + descripción;
verificar persistencia y estado inicial.

- [x] T016 [P] [US1] Contract test `POST /cases` in
      `backend/tests/contract/cases-create.contract.test.ts`
- [x] T017 [P] [US1] Integration test create/list cases in
      `backend/tests/integration/cases-create.integration.test.ts`
- [x] T018 [P] [US1] E2E Inbox create-case flow in
      `frontend/tests/e2e/us1-create-case.spec.ts`
- [x] T019 [US1] Implement case repository + create/list use cases in
      `backend/src/services/case-service.ts`
- [x] T020 [US1] Implement `POST /cases` and `GET /cases` in
      `backend/src/api/cases-routes.ts`
- [x] T021 [US1] Implement Inbox case creation UI in
      `frontend/src/features/inbox/inbox-page.tsx`

**Checkpoint**: A user can capture an informal decision signal as a
persistent case.

---

## Phase 4: User Story 2 - Organizar el relato en el Decision Canvas
**Priority: P1** 🎯 MVP

**Goal**: Mostrar 8 bloques y sugerencias IA con estado de validación.

**Independent Test**: Abrir caso y ver 8 dimensiones;
aceptar/editar/rechazar sugerencias en un bloque.

- [x] T022 [P] [US2] Contract test statements endpoint in
      `backend/tests/contract/canvas-statements.contract.test.ts`
- [x] T023 [P] [US2] Integration test for statement lifecycle in
      `backend/tests/integration/canvas-statements.integration.test.ts`
- [x] T024 [P] [US2] E2E canvas rendering and suggestion states in
      `frontend/tests/e2e/us2-canvas.spec.ts`
- [x] T025 [US2] Implement canvas dimensions + statements storage in
      `backend/src/services/canvas-service.ts`
- [x] T026 [US2] Implement statement routes in
      `backend/src/api/canvas-routes.ts`
- [x] T027 [US2] Implement Decision Canvas UI with 8 blocks in
      `frontend/src/features/canvas/canvas-page.tsx`
- [x] T028 [US2] Implement suggestion state badges/actions in
      `frontend/src/features/canvas/statement-card.tsx`

**Checkpoint**: The informal narrative is transformed into a structured
canvas while preserving explicit human validation of AI suggestions.

---

## Phase 5: User Story 3 - Responder preguntas dinámicas
**Priority: P1** 🎯 MVP

**Goal**: Ofrecer una pregunta relevante por vez, con máximo 5 por caso.

**Independent Test**: Solicitar preguntas hasta límite;
registrar respuestas/omisiones/no-lo-sé y actualizar canvas.

- [x] T029 [P] [US3] Contract test
      `POST /cases/{id}/ai/questions/next` in
      `backend/tests/contract/ai-questions.contract.test.ts`
- [x] T030 [P] [US3] Integration test question count and cap in
      `backend/tests/integration/ai-questions.integration.test.ts`
- [x] T031 [P] [US3] E2E dynamic questioning flow in
      `frontend/tests/e2e/us3-dynamic-questions.spec.ts`
- [x] T032 [US3] Implement question session logic and max=5 rule in
      `backend/src/services/question-service.ts`
- [x] T033 [US3] Integrate AI provider for contextual prompts in
      `backend/src/services/ai-assist-service.ts`
- [x] T034 [US3] Implement question panel UI and response actions in
      `frontend/src/features/canvas/question-panel.tsx`

**Checkpoint**: AI can reduce ambiguity through bounded contextual
questioning without making the decision for the user.

---

## Phase 6: User Story 4 - Diferenciar evidencia de interpretación
**Priority: P1** 🎯 MVP

**Goal**: Clasificar afirmaciones por tipo epistemológico y fuente.

**Independent Test**: Cambiar clasificación y validar regla de hechos
con fuente/confirmación humana.

- [x] T035 [P] [US4] Unit tests for epistemic validation in
      `backend/tests/unit/epistemic-rules.unit.test.ts`
- [x] T036 [P] [US4] Integration test source-link rules in
      `backend/tests/integration/evidence-classification.integration.test.ts`
- [x] T037 [US4] Implement epistemic rule engine in
      `backend/src/domain/epistemic-rules.ts`
- [x] T038 [US4] Extend statement update endpoint with classification
      rules in `backend/src/api/canvas-routes.ts`
- [x] T039 [US4] Implement classification editor UI in
      `frontend/src/features/canvas/classification-editor.tsx`

**Checkpoint**: The system explicitly distinguishes evidence,
interpretation, assumption, and missing information before downstream
generation.

---

## Phase 7: User Story 5 - Ejecutar una revisión crítica
**Priority: P1**

**Goal**: Detectar contradicciones, faltantes y debilidades antes del brief.

**Independent Test**: Ejecutar revisión y recibir findings clasificados
(bloqueo/advertencia/mejora).

- [x] T040 [P] [US5] Unit tests for review heuristics in
      `backend/tests/unit/review-rules.unit.test.ts`
- [x] T041 [P] [US5] Integration test review findings in
      `backend/tests/integration/review-analysis.integration.test.ts`
- [x] T042 [US5] Implement critical review service in
      `backend/src/services/review-service.ts`
- [x] T043 [US5] Add review endpoint `POST /cases/{id}/review` in
      `backend/src/api/review-routes.ts`
- [x] T044 [US5] Implement review results UI in
      `frontend/src/features/review/review-panel.tsx`

**Checkpoint**: The system can surface contradictions, missing evidence,
weak reasoning, and improvement opportunities without automatically
resolving them.

---

## Phase 8: User Story 6 - Asignar gravedad mediante juicio humano
**Priority: P1** 🎯 MVP

**Goal**: Permitir evaluación manual de gravedad sin recomendación automática.

**Independent Test**: Actualizar gravedad manualmente con justificación
opcional y trazabilidad de actor humano.

- [x] T045 [P] [US6] Unit tests for severity manual-only policy in
      `backend/tests/unit/severity-policy.unit.test.ts`
- [x] T046 [P] [US6] Integration test severity updates in
      `backend/tests/integration/severity.integration.test.ts`
- [x] T047 [US6] Implement severity update use case in
      `backend/src/services/severity-service.ts`
- [x] T048 [US6] Add severity endpoint in
      `backend/src/api/cases-routes.ts`
- [x] T049 [US6] Implement severity selector UI with human-control
      messaging in
      `frontend/src/features/canvas/severity-selector.tsx`

**Checkpoint**: Severity remains an explicitly human-owned judgment.
AI must not infer, recommend, or automatically modify severity.

---

## Phase 9: User Story 7 - Generar un brief ejecutivo
**Priority: P1** 🎯 MVP

**Goal**: Generar brief estructurado desde contenido validado y gate
de elevación.

**Independent Test**: Generar, editar y aprobar brief;
validar gate para `listo_para_elevar`.

**Entry Gate**:

Before generating a final brief, the case must have:

- structured canvas information from US2;
- epistemic classification from US4;
- human severity assessment from US6;
- all blocking validation rules satisfied.

- [x] T050 [P] [US7] Contract test brief endpoints in
      `backend/tests/contract/brief.contract.test.ts`
- [x] T051 [P] [US7] Integration test brief generation + readiness
      gate in `backend/tests/integration/brief.integration.test.ts`
- [x] T052 [P] [US7] E2E brief generation/edit/copy flow in
      `frontend/tests/e2e/us7-brief.spec.ts`
- [x] T053 [US7] Implement brief generation service in
      `backend/src/services/brief-service.ts`
- [x] T054 [US7] Implement brief routes including approve in
      `backend/src/api/brief-routes.ts`
- [x] T055 [US7] Implement state transition gate service in
      `backend/src/services/status-transition-service.ts`
- [x] T056 [US7] Implement brief editor UI in
      `frontend/src/features/brief/brief-editor.tsx`

**Checkpoint**: AI produces a structured executive brief only from
validated decision content. Human approval remains mandatory before
the case becomes `listo_para_elevar`.

---

## Phase 10: User Story 8 - Comparar comunicación original y aumentada
**Priority: P1** 🎯 MVP Validation

**Goal**: Permitir evaluación ciega control vs IA y guardar puntuaciones.

**Independent Test**: Completar evaluación con 8 criterios,
guardar resultados y mostrar diferencias.

- [x] T057 [P] [US8] Contract test evaluation endpoints in
      `backend/tests/contract/evaluation.contract.test.ts`
- [x] T058 [P] [US8] Integration test score persistence in
      `backend/tests/integration/evaluation.integration.test.ts`
- [x] T059 [P] [US8] E2E blind comparison flow in
      `frontend/tests/e2e/us8-comparison.spec.ts`
- [x] T060 [US8] Implement evaluation service and storage in
      `backend/src/services/evaluation-service.ts`
- [x] T061 [US8] Add evaluation routes in
      `backend/src/api/evaluation-routes.ts`
- [x] T062 [US8] Implement comparison/evaluation UI in
      `frontend/src/features/brief/comparison-page.tsx`

**Checkpoint**: The value of AI augmentation can be measured by
comparing original communication with the augmented output instead of
assuming that AI-generated content is better.

---

## Phase 11: Polish, AI Evaluation & Cross-Cutting Concerns

**Purpose**: Hardening, AI behavior evaluation, documentation,
auditability, and full validation.

### Platform and quality

- [x] T063 [P] Add structured logging across routes in
      `backend/src/api/server.ts`
- [x] T064 [P] Add OpenAPI validation tests in
      `backend/tests/contract/openapi-validation.contract.test.ts`
- [x] T065 [P] Add accessibility checks for canvas states in
      `frontend/tests/e2e/accessibility.spec.ts`
- [x] T066 Verify retention cleanup + audit events in
      `backend/tests/integration/retention.integration.test.ts`
- [x] T067 Run full quickstart validation and update notes in
      `specs/001-decision-workspace/quickstart.md`

### AI Behavior Evaluation

**Purpose**: Validate AI behavior as a probabilistic component rather
than validating only deterministic application logic.

- [x] T068 [P] Add AI output evaluation dataset with representative
      decision cases in
      `backend/tests/fixtures/ai-evaluation-cases.json`

      Dataset MUST include at minimum:
      - complete and well-supported case;
      - incomplete-information case;
      - ambiguous case;
      - contradictory-evidence case;
      - unsupported-claim trap;
      - case requiring explicit abstention.

- [x] T069 [P] Add AI evaluation tests for hallucination,
      unsupported claims, epistemic classification, contradiction
      detection and abstention in
      `backend/tests/evaluation/ai-output.evaluation.test.ts`

      Evaluation MUST verify that:
      - unsupported content is not represented as fact;
      - evidence and interpretation remain distinguishable;
      - missing evidence is surfaced;
      - contradictory evidence is surfaced rather than silently resolved;
      - the model can abstain when evidence is insufficient;
      - generated briefs remain grounded in validated case content.

- [x] T070 Verify human-only decision boundaries in
      `backend/tests/evaluation/human-control.evaluation.test.ts`

      Tests MUST verify that AI output cannot:
      - assign severity;
      - modify human severity;
      - approve a brief;
      - transition a case to `listo_para_elevar`;
      - bypass blocking readiness requirements.

**Checkpoint**: The application behaves correctly both as software and
as an AI-augmented decision-support system.

---

# Dependencies & Execution Order

## Phase Dependencies

```text
Phase 1: Setup
      ↓
Phase 2: Foundation
      ↓
US1: Capture case
      ↓
US2: Structure Decision Canvas
      ↓
US3: Dynamic questioning
      ↓
 ┌───────────────┐
 ↓               ↓
US4             US6
Evidence        Human severity
classification judgment
 ↓               ↓
 └───────┬───────┘
         ↓
US7: Executive brief
         ↓
US8: Blind comparison / value validation
         ↓
Phase 11: Polish + AI evaluation