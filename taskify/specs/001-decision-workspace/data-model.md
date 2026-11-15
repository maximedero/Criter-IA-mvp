# Data Model: Decision Workspace MVP

## Persistence Container (localStorage)
- `dw.cases`: array de `DecisionCase`
- `dw.canvas`: mapa `caseId -> CanvasState`
- `dw.briefs`: mapa `caseId -> BriefArtifact`
- `dw.aiSessions`: mapa `caseId -> AiQuestionSession`
- `dw.audit`: array de `AuditEvent`
- `dw.fixtures`: catálogo de casos base para demo

Rules:
- Cada registro de caso debe almacenar `createdAt` y `expiresAt`.
- Al cargar la app y antes de listar casos, se eliminan registros expirados.
- Debe soportar decenas de casos en entorno local.

## Entity: DecisionCase
- id (UUID)
- title (string, 1..140)
- informalDescription (text)
- status (enum): nuevo | borrador | en_analisis | revision_critica | evaluacion_humana | brief_borrador | listo_para_elevar
- severity (enum): sin_evaluar | baja | media | alta | critica
- humanApprovedForElevation (boolean)
- createdAt (datetime)
- updatedAt (datetime)
- expiresAt (datetime)

## Entity: CanvasState
- caseId (UUID)
- dimensions (array de 8 `CanvasDimension`)
- lastUpdatedAt (datetime)

## Entity: CanvasDimension
- type (enum): contexto_senal | exposicion | evidencia | impactos | incertidumbres | escenarios | alternativas | intervencion_requerida
- completionState (enum): vacio | parcial | definido
- notApplicable (boolean)
- statements (array de `Statement`)

Rules:
- `notApplicable=true` sólo puede establecerse por usuario.
- `notApplicable` no está permitido en situación, exposición, evidencia, impacto plausible e intervención requerida.

## Entity: Statement
- id (UUID)
- content (text)
- epistemicType (enum): hecho | inferencia | supuesto | dato_faltante | evaluacion_humana
- sourceType (enum): documental | confirmado_por_persona | sin_fuente
- validationState (enum): pendiente | validado | editado | rechazado
- authorType (enum): usuario | ia
- createdAt (datetime)
- updatedAt (datetime)

Rules:
- Si `epistemicType=hecho`, `sourceType` no puede ser `sin_fuente`.
- Para cobertura mínima cuentan sólo `validationState` en `validado|editado`.
- `pendiente` y `rechazado` no satisfacen cobertura.

## Entity: ReviewFinding
- id (UUID)
- caseId (UUID)
- level (enum): bloqueo_critico | advertencia
- findingType (enum): contradiccion | evidencia_insuficiente | impacto_debil | intervencion_ausente | otro
- isCentralFactConflict (boolean)
- resolvedByUser (boolean)
- createdAt (datetime)

Rules:
- Contradicción confirmada entre hechos centrales => `bloqueo_critico`.
- Contradicción potencial requiere aclaración humana previa.

## Entity: BriefArtifact
- id (UUID)
- caseId (UUID)
- executiveView (text)
- expandedView (text)
- assignedSeverity (enum)
- requiredIntervention (text)
- readyChecklistSnapshot (json)
- approvedByHuman (boolean)
- approvedAt (datetime, nullable)
- createdAt (datetime)
- updatedAt (datetime)

Rules:
- Aprobación requiere checklist visible + acción explícita + confirmación final.
- IA no puede aprobar ni confirmar aprobación.

## Entity: AiQuestionSession
- caseId (UUID)
- primaryRoundQuestionCount (int, >=0)
- primaryRoundGuidanceMax (int, default 8)
- stopReason (enum): cobertura_minima | solicitud_usuario | investigacion_externa | saturacion | sin_cambio_material
- lastQuestionAt (datetime)

Rules:
- No existe límite rígido obligatorio de preguntas.
- El valor 8 es orientativo para primera ronda.

## Entity: AuditEvent
- id (UUID)
- caseId (UUID)
- eventType (enum): crear_caso | actualizar_caso | sugerencia_ia | aceptar_sugerencia | editar_sugerencia | rechazar_sugerencia | cambio_estado | generar_brief | aprobar_brief
- payloadJson (json)
- actorType (enum): usuario | sistema | ia
- createdAt (datetime)

## State Transitions
- nuevo -> borrador
- borrador -> en_analisis
- en_analisis -> revision_critica
- revision_critica -> evaluacion_humana | en_analisis
- evaluacion_humana -> brief_borrador
- brief_borrador -> listo_para_elevar

Invalid transitions are rejected by reglas de dominio.