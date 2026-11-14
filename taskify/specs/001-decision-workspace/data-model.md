# Data Model: Decision Workspace MVP

## Entity: DecisionCase
- id (UUID)
- title (string, 1..140)
- informalDescription (text)
- status (enum): borrador | recopilando_evidencia | en_analisis | listo_para_revision | listo_para_elevar | elevado | cerrado
- severity (enum): sin_evaluar | baja | media | alta | critica
- humanApprovedForElevation (boolean)
- createdAt (datetime)
- updatedAt (datetime)
- expiresAt (datetime, <= createdAt + 90 días)

Rules:
- `listo_para_revision` requiere 8 dimensiones con al menos un elemento.
- `listo_para_elevar` requiere aprobación humana explícita y contenido en evidencia, incertidumbres, alternativas e intervención requerida.

## Entity: CanvasDimension
- id (UUID)
- caseId (FK -> DecisionCase)
- type (enum): contexto_senal | exposicion | evidencia | impactos | incertidumbres | escenarios | alternativas | intervencion_requerida
- displayOrder (int)
- completionState (enum): vacio | parcial | completo

## Entity: Statement
- id (UUID)
- caseId (FK)
- dimensionId (FK -> CanvasDimension)
- content (text)
- epistemicType (enum): hecho | inferencia | supuesto | dato_faltante | evaluacion_humana
- sourceType (enum): documental | confirmado_por_persona | sin_fuente
- validationState (enum): sugerido_ia | pendiente_revision | validado | rechazado | editado
- authorType (enum): humano | ia
- createdAt (datetime)
- updatedAt (datetime)

Rules:
- Si `epistemicType=hecho`, `sourceType` no puede ser `sin_fuente`.
- Contenido `sugerido_ia` no se incluye en brief final hasta validación humana.

## Entity: EvidenceSource
- id (UUID)
- caseId (FK)
- statementId (FK -> Statement, nullable)
- label (string)
- reference (string)  
- sourceKind (enum): documento | enlace | nota_persona
- verifiedByHuman (boolean)

## Entity: Brief
- id (UUID)
- caseId (FK, unique active)
- situation (text)
- relevance (text)
- possibleConsequences (text)
- availableEvidence (text)
- uncertainties (text)
- scenarios (text)
- alternativesTradeoffs (text)
- assignedSeverity (enum)
- requiredIntervention (text)
- sources (text)
- readyToElevate (boolean)
- approvedByHuman (boolean)
- createdAt (datetime)
- updatedAt (datetime)

## Entity: AiQuestionSession
- id (UUID)
- caseId (FK)
- questionCount (int, 0..5)
- lastQuestionAt (datetime)
- suggestionOffered (boolean)

Rules:
- `questionCount` máximo 5 por caso antes de sugerir generación de brief.

## Entity: AuditEvent
- id (UUID)
- caseId (FK)
- eventType (enum): crear_caso | actualizar_caso | sugerencia_ia | aceptar_sugerencia | editar_sugerencia | rechazar_sugerencia | cambio_estado | generar_brief | aprobar_brief
- payloadJson (json)
- actorType (enum): humano | sistema | ia
- createdAt (datetime)

## State Transitions
- borrador -> recopilando_evidencia | en_analisis
- en_analisis -> listo_para_revision (gate FR-023)
- listo_para_revision -> en_analisis | listo_para_elevar (gate FR-024)
- listo_para_elevar -> elevado | en_analisis
- elevado -> cerrado

Invalid transitions are rejected with domain error codes.