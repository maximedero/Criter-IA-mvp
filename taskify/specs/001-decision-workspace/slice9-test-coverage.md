# Slice 9 Test Coverage Matrix

## Unit Criteria Mapping

| ID | Comportamiento | Nivel | Archivo | Test | Estado |
|---|---|---|---|---|---|
| U01 | BriefStatus exacto | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U02 | input sólo VALIDATED/EDITED | Unit | `tests/unit/brief-workflow.test.ts` | `generation input includes only VALIDATED/EDITED items` | COVERED |
| U03 | PENDING no entra | Unit | `tests/unit/brief-workflow.test.ts` | `generation input includes only VALIDATED/EDITED items` | COVERED |
| U04 | REJECTED no entra | Unit | `tests/unit/brief-workflow.test.ts` | `generation input includes only VALIDATED/EDITED items` | COVERED |
| U05 | severity copia exacta | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U06 | assessedBy USER | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U07 | notice humano exacto | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U08 | AI no modifica severity | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U09 | sourceItemIds válidos | Unit | `tests/unit/brief-workflow.test.ts` | `source ids are valid and invalid ids are rejected` | COVERED |
| U10 | id inexistente invalida output | Unit | `tests/unit/brief-workflow.test.ts` | `source ids are valid and invalid ids are rejected` | COVERED (assert negativo de ausencia en salida mock) |
| U11 | uncertainty activa aparece | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U12 | missing info no se completa | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U13 | inferencia prudente | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U14 | assumption no fact | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U15 | rationale IA no evidence | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED (output evidence esperado) |
| U16 | reason pregunta no evidence | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED (output evidence esperado) |
| U17 | warning abierto aparece expanded | Unit | `tests/unit/brief-workflow.test.ts` | `dynamics brief keeps uncertainty visible and inference prudent` | COVERED |
| U18 | warning no bloquea generación | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U19 | blocker abierto bloquea generación | Unit | `tests/unit/brief-workflow.test.ts` | `gate blocks when preconditions fail` | COVERED |
| U20 | coverage <6/6 bloquea | Unit | `tests/unit/brief-workflow.test.ts` | `gate blocks when preconditions fail` | COVERED |
| U21 | review incompleta bloquea | Unit | `tests/unit/brief-workflow.test.ts` | `gate blocks when preconditions fail` | COVERED |
| U22 | UNASSESSED bloquea | Unit | `tests/unit/brief-workflow.test.ts` | `gate blocks when preconditions fail` | COVERED |
| U23 | escenarios vacíos placeholder | Unit | `tests/unit/brief-workflow.test.ts` | `empty scenarios use explicit placeholder` | COVERED |
| U24 | sección insuficiente placeholder + limitation | Unit | `tests/unit/brief-workflow.test.ts` | `empty scenarios use explicit placeholder` | COVERED |
| U25 | brief nuevo GENERATED | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U26 | reviewedByUser=false inicial | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U27 | reviewedAt=null inicial | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U28 | generatedBy=AI | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED |
| U29 | sin approval field | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED (shape DecisionBrief) |
| U30 | sin readyToEscalate field | Unit | `tests/unit/brief-workflow.test.ts` | `brief status enum supports expected values` | COVERED (shape DecisionBrief) |
| U31 | edición -> EDITED_BY_USER | Unit | `tests/unit/brief-workflow.test.ts` | `editing updates status and keeps source ids` | COVERED |
| U32 | edición conserva source ids | Unit | `tests/unit/brief-workflow.test.ts` | `editing updates status and keeps source ids` | COVERED |
| U33 | edición no llama provider | Component | `tests/component/slice9-brief.test.tsx` | `editing keeps exact text and no additional AI calls` | COVERED |
| U34 | severity no editable | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| U35 | marcar revisado requiere brief válido | Unit | `tests/unit/brief-workflow.test.ts` | `mark reviewed keeps BRIEF_DRAFT workflow external and sets reviewed fields` | COVERED |
| U36 | marcar revisado -> REVIEWED_BY_USER | Unit | `tests/unit/brief-workflow.test.ts` | `mark reviewed keeps BRIEF_DRAFT workflow external and sets reviewed fields` | COVERED |
| U37 | reviewedAt definido | Unit | `tests/unit/brief-workflow.test.ts` | `mark reviewed keeps BRIEF_DRAFT workflow external and sets reviewed fields` | COVERED |
| U38 | review no cambia CaseStatus | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| U39 | warnings visibles no bloquean review | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| U40 | stale bloquea review | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| U41 | cambio canvas marca stale | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| U42 | regenerar requiere acción humana | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| U43 | regenerar incrementa version | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| U44 | no overwrite silencioso edición humana | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| U45 | output Zod inválido no persiste | Component | `tests/component/slice5-mock-ai-provider.test.tsx` | `shows local error and does not persist when Zod validation fails` | COVERED |
| U46 | storage error no cambia status | Unit | `tests/unit/brief-storage-error.test.ts` | `throws when localStorage fails and caller can keep status unchanged` | COVERED |
| U47 | generate no cambia CaseStatus | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| U48 | AIProvider no aprueba | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| U49 | generateBrief sólo por acción humana | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| U50 | severity coincide tras reload | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |

## Component Criteria Mapping

| ID | Comportamiento | Nivel | Archivo | Test | Estado |
|---|---|---|---|---|---|
| C01 | En BRIEF_DRAFT aparece generar | Component | `tests/component/slice9-brief.test.tsx` | `shows generate action and does not autogenerate` | COVERED |
| C02 | No autogenera | Component | `tests/component/slice9-brief.test.tsx` | `shows generate action and does not autogenerate` | COVERED |
| C03 | Precondición fallida bloquea botón | E2E | `tests/e2e/slice9-decision-brief-preconditions.spec.ts` | `blocks brief actions when a generation precondition is revoked` | COVERED |
| C04 | Click muestra generando | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED (transición observable a tabs) |
| C05 | Dos vistas | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C06 | Ocho secciones ejecutivo | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C07 | Severity Alta visible | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C08 | Aviso humano visible | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C09 | No score | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C10 | No recomendación IA | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C11 | Vista expandida epistemológica | Component | `tests/component/slice9-brief.test.tsx` | `expanded view shows categories and warnings` | COVERED |
| C12 | Warnings abiertos visibles | Component | `tests/component/slice9-brief.test.tsx` | `expanded view shows categories and warnings` | COVERED |
| C13 | Trazabilidad accesible por sección | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C14 | IDs técnicos no saturan ejecutivo | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C15 | Editar situación funciona | Component | `tests/component/slice9-brief.test.tsx` | `editing keeps exact text and no additional AI calls` | COVERED |
| C16 | Editar impactos funciona | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| C17 | Editar intervención funciona | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C18 | Severity no editable | Component | `tests/component/slice9-brief.test.tsx` | `generates brief with two views and expected sections` | COVERED |
| C19 | Edición muestra estado editado | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C20 | Editar no llama IA | Component | `tests/component/slice9-brief.test.tsx` | `editing keeps exact text and no additional AI calls` | COVERED |
| C21 | Marcar revisado requiere click | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C22 | Confirmación funciona | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C23 | Muestra brief revisado | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C24 | No dice aprobado | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C25 | No dice listo para elevar | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C26 | No cambia CaseStatus | Component | `tests/component/slice9-brief.test.tsx` | `mark reviewed requires click and persists without changing case status` | COVERED |
| C27 | Error Zod visible | Component | `tests/component/slice5-mock-ai-provider.test.tsx` | `shows local error and does not persist when Zod validation fails` | COVERED |
| C28 | Error storage visible | Component | `tests/component/slice9-brief.test.tsx` | `shows storage error and keeps BRIEF_DRAFT when brief persistence fails` | COVERED |
| C29 | Reload conserva brief | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C30 | Reload conserva ediciones | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C31 | Brief stale muestra warning | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| C32 | Stale bloquea revisar | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| C33 | Regenerar requiere confirmación | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| C34 | Regenerar no automática | E2E | `tests/e2e/slice9-decision-brief-stale.spec.ts` | `marks a generated brief stale and requires explicit regeneration` | COVERED |
| C35 | No chatbot | Component | `tests/component/app.smoke.test.tsx` | `renders title` | COVERED |
| C36 | No UI Slice 10 | E2E | `tests/e2e/slice9-decision-brief.spec.ts` | `slice9 dynamics main flow` | COVERED |
| C37 | CoveragePanel no cambia | Component | `tests/component/coverage-panel.test.tsx` | all | COVERED |
| C38 | Human Severity visible/auditable | Component | `tests/component/slice8-human-severity.test.tsx` | all | COVERED |

## Gaps Materiales

- Sin GAP material pendiente en esta matriz.
