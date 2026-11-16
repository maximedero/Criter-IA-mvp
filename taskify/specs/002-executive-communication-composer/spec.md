# Feature Specification: Executive Communication Composer

**Feature Branch**: `002-executive-communication-composer`

**Created**: 2026-11-16

**Status**: Draft

**Input**: Contexto maestro de iteración "Executive Communication Composer"

## 1. Problema

La comunicación ejecutiva actual preserva trazabilidad y contenido correcto,
pero su forma se percibe como un mapeo mecánico del Decision Canvas.

El resultado tiende a:

- enumerar campos;
- repetir secciones del análisis;
- sonar como artefacto técnico;
- perder naturalidad narrativa para un líder.

Esto reduce la utilidad práctica para elevar situaciones con claridad,
prudencia y pedido concreto de próximo paso.

## 2. Objetivo

Transformar análisis validado en dos entregables narrativos listos para uso
laboral:

1. correo ejecutivo;
2. mensaje breve para Teams/Slack.

La salida debe ser sintética, natural, accionable y trazable, sin reemplazar
el análisis auditable ni inventar información.

## 3. Usuario objetivo

Profesional que necesita elevar a su líder una situación de riesgo o decisión,
sin enviar la estructura interna completa del análisis.

## 4. Propuesta de valor

Convertir un análisis estructurado y validado en comunicación ejecutiva natural,
prudente, trazable y accionable, manteniendo control humano sobre revisión,
edición, regeneración y aprobación.

## 5. Historias de usuario y pruebas

### User Story 1 - Obtener correo ejecutivo (Priority: P1)

Como profesional, quiero recibir un correo redactado de forma natural a partir
del análisis validado para elevar la situación sin reescribir todo el
razonamiento.

**Why this priority**: El correo es el entregable principal para escalar el
caso a nivel superior.

**Independent Test**: Generar comunicación con un caso validado y verificar
asunto, cuerpo narrativo, incertidumbre visible, gravedad humana y pedido
concreto.

**Acceptance Scenarios**:

1. **Given** un caso con brief estructurado validado, **When** se genera
   comunicación ejecutiva, **Then** se produce un correo no vacío con asunto,
   narrativa natural y cierre con intervención concreta.
2. **Given** información con hechos e inferencias, **When** se compone el
   correo, **Then** los hechos se mantienen afirmativos y las inferencias usan
   lenguaje prudente.

---

### User Story 2 - Obtener mensaje breve (Priority: P1)

Como profesional, quiero una versión breve para Teams/Slack para iniciar una
conversación sin perder riesgo, incertidumbre material ni pedido concreto.

**Why this priority**: Permite activar conversación ejecutiva rápida en canales
habituales de coordinación.

**Independent Test**: Generar mensaje breve y verificar brevedad relativa frente
al correo, ausencia de asunto y preservación de contenido material.

**Acceptance Scenarios**:

1. **Given** un correo ejecutivo válido, **When** se genera mensaje breve,
   **Then** el mensaje tiene cuerpo no vacío, es más breve y termina con
   pregunta o pedido concreto.
2. **Given** incertidumbres materiales en el análisis, **When** se genera
   mensaje breve, **Then** dichas incertidumbres permanecen visibles.

---

### User Story 3 - Conservar grounding y trazabilidad (Priority: P1)

Como usuario, quiero que cada afirmación material pueda justificarse con el
análisis para controlar que la comunicación no invente información.

**Why this priority**: Sin grounding no existe confianza ni auditabilidad.

**Independent Test**: Verificar que el output incluya trazabilidad interna y que
no aparezcan hechos/cifras/fechas/probabilidades/fuentes no sustentadas.

**Acceptance Scenarios**:

1. **Given** un input con contenido validado, **When** se compone la
   comunicación, **Then** la salida usa únicamente información del input.
2. **Given** falta de evidencia relevante, **When** se compone la
   comunicación, **Then** la salida explicita la limitación sin completar con
   conocimiento general.

---

### User Story 4 - Editar comunicación (Priority: P1)

Como usuario, quiero editar asunto y cuerpos para conservar mi voz y asumir
responsabilidad sobre lo comunicado.

**Why this priority**: El control humano final sobre el texto es obligatorio por
producto y gobernanza.

**Independent Test**: Editar asunto/cuerpo, guardar y verificar persistencia
exacta del texto, invalidación de revisión previa y ausencia de nuevas llamadas
IA.

**Acceptance Scenarios**:

1. **Given** un brief con comunicación generada, **When** el usuario edita y
   guarda, **Then** se conserva texto exacto y el estado de revisión previa se
   invalida.
2. **Given** una edición guardada, **When** se recarga la pantalla, **Then** la
   versión editada persiste sin alteraciones.

---

### User Story 5 - Regenerar por acción humana (Priority: P1)

Como usuario, quiero regenerar la comunicación mediante una acción explícita
para obtener nueva redacción cuando cambió el análisis.

**Why this priority**: Evita automatismos no deseados y mantiene control del
momento de actualización.

**Independent Test**: Marcar brief stale, ejecutar regeneración manual y
verificar nueva versión consistente, revisión reiniciada y aprobación no
heredada.

**Acceptance Scenarios**:

1. **Given** un brief stale, **When** el usuario confirma regeneración,
   **Then** se genera una nueva comunicación y reviewedByUser queda en false.
2. **Given** comunicación editada por usuario, **When** se intenta regenerar,
   **Then** el sistema pide confirmación antes de reemplazar.

---

### User Story 6 - Consultar análisis completo (Priority: P2)

Como usuario, quiero acceder al análisis estructurado y trazabilidad para
revisar cómo se construyó la comunicación.

**Why this priority**: La comunicación ejecutiva es proyección narrativa del
análisis, no reemplazo del análisis auditable.

**Independent Test**: Verificar jerarquía de vistas con comunicación en primer
lugar y acceso disponible a brief ejecutivo y análisis completo.

**Acceptance Scenarios**:

1. **Given** un caso en BRIEF_DRAFT, **When** se abre el módulo de brief,
   **Then** la vista inicial es Comunicación ejecutiva.
2. **Given** un brief generado, **When** el usuario cambia de vista,
   **Then** puede acceder a Brief ejecutivo y Análisis completo y trazabilidad.

---

### User Story 7 - Copiar para uso externo manual (Priority: P2)

Como usuario, quiero copiar correo o mensaje para pegarlos manualmente en el
canal que elija.

**Why this priority**: Permite uso operativo inmediato sin habilitar envíos
automáticos.

**Independent Test**: Copiar correo y mensaje, validar formato copiado y
confirmar que no cambian estado, aprobación ni llamadas IA.

**Acceptance Scenarios**:

1. **Given** comunicación vigente no stale, **When** el usuario copia correo,
   **Then** se copia "Asunto: [subject]" seguido del body.
2. **Given** comunicación stale o sin contenido, **When** el usuario intenta
   copiar, **Then** se bloquea la acción y se muestra mensaje de error.

## 6. Requisitos funcionales

### 6.1 Requisitos de contenido y síntesis

- **FR-001**: El sistema MUST producir dos salidas: correo ejecutivo y mensaje
  breve.
- **FR-002**: La salida MUST realizar síntesis semántica y no limitarse a
  concatenar secciones del Canvas.
- **FR-003**: El correo MUST mantener tono profesional, natural y directo para
  destinatario de nivel superior.
- **FR-004**: El mensaje MUST ser sustancialmente más breve que el correo y
  conservar información material.
- **FR-005**: La salida MUST distinguir hechos confirmados de posibilidades,
  supuestos y faltantes.

### 6.2 Requisitos de grounding

- **FR-006**: La composición MUST usar exclusivamente información validada del
  input de composición.
- **FR-007**: El sistema MUST excluir contenido PENDING, REJECTED y
  SUPERSEDED.
- **FR-008**: La salida MUST preservar incertidumbres materiales y datos
  faltantes relevantes para decisión.
- **FR-009**: La salida MUST copiar exactamente la gravedad humana sin
  recalcularla ni recomendar otra.
- **FR-010**: La salida MUST cerrar con la intervención humana recibida, sin
  ampliar mandato.

### 6.3 Requisitos de formato

- **FR-011**: El correo MUST incluir asunto específico y cuerpo no vacío.
- **FR-012**: El correo SHOULD tender a 4–6 párrafos breves y 150–250 palabras
  como referencia no rígida.
- **FR-013**: El mensaje MUST tener cuerpo no vacío y no incluir asunto.
- **FR-014**: El mensaje SHOULD tender a 70–130 palabras como referencia no
  rígida.
- **FR-015**: Ambos formatos MUST terminar con pedido o pregunta concreta.

### 6.4 Requisitos de calidad narrativa

- **FR-016**: El resultado MUST evitar encabezados rígidos de ficha y lenguaje
  técnico interno.
- **FR-017**: El resultado MUST evitar repetición literal excesiva del input.
- **FR-018**: El sistema MUST detectar salida claramente mecánica como inválida
  o de baja calidad.
- **FR-019**: Una salida inválida MUST NOT reemplazar una versión válida previa.

### 6.5 Requisitos de interacción humana

- **FR-020**: El usuario MUST poder editar asunto del correo, cuerpo del
  correo y cuerpo del mensaje.
- **FR-021**: Guardar edición MUST preservar texto exacto, marcar
  `editedByUser=true`, actualizar `updatedAt` e invalidar revisión previa.
- **FR-022**: Editar MUST NOT disparar nueva generación IA ni modificar
  gravedad, Canvas, CaseStatus o aprobación.
- **FR-023**: Regenerar comunicación MUST requerir acción humana explícita.
- **FR-024**: Si existe edición previa, regenerar MUST requerir confirmación
  antes de reemplazar.

### 6.6 Requisitos de stale, revisión y aprobación

- **FR-025**: Si el brief queda stale, la comunicación MUST quedar stale y la
  copia MUST bloquearse como contenido vigente.
- **FR-026**: Regenerar MUST reiniciar `reviewedByUser=false` y no heredar
  aprobación anterior.
- **FR-027**: La revisión y aprobación MUST aplicar a la versión completa del
  brief, incluyendo `ExecutiveCommunication`.
- **FR-028**: La aprobación MUST permanecer exclusivamente humana.

### 6.7 Requisitos de jerarquía UI acotada

- **FR-029**: En estados avanzados, la UI MUST mostrar arriba un bloque
  dinámico de “Próximo paso”.
- **FR-030**: La UI MUST mostrar resumen compacto de Cobertura, Revisión,
  Gravedad, Brief y Aprobación.
- **FR-031**: En BRIEF_DRAFT la vista por defecto MUST ser “Comunicación
  ejecutiva”.
- **FR-032**: El orden de vistas MUST ser: (1) Comunicación ejecutiva,
  (2) Brief ejecutivo, (3) Análisis completo y trazabilidad.
- **FR-033**: Canvas y trazabilidad MUST permanecer disponibles, aunque puedan
  presentarse colapsados o secundarios en etapas avanzadas.

### 6.8 Requisitos de copia

- **FR-034**: El sistema MUST mantener “Copiar como correo” con formato:
  `Asunto: [subject]` + salto + `[body]`.
- **FR-035**: El sistema MUST mantener “Copiar como mensaje” con formato:
  `[message body]`.
- **FR-036**: Copiar MUST NOT invocar IA ni modificar estado, aprobación,
  versiones o integraciones externas.

## 7. Reglas de grounding

1. Usar exclusivamente información presente en el input de composición.
2. Incluir automáticamente sólo elementos activos con `validationStatus`
   VALIDATED o EDITED.
3. Excluir PENDING, REJECTED, SUPERSEDED y contenido no validado del relato
   inicial.
4. No inventar hechos, cifras, fechas, probabilidades, fuentes, responsables,
   áreas, impactos, causas ni recomendaciones no sustentadas.
5. Si falta evidencia, declararlo en lenguaje natural y mantener la limitación
   visible.
6. Expresar inferencias con lenguaje prudente (por ejemplo: podría, es posible,
   existe riesgo de).
7. Mantener supuestos como pendientes de validación.
8. Mantener datos faltantes cuando sean materiales para la decisión.
9. Copiar exactamente la gravedad humana como evaluación del usuario.
10. Cerrar con la intervención humana recibida.

## 8. Criterios de aceptación

### 8.1 Correo ejecutivo

Debe:

- incluir asunto específico y accionable;
- tener cuerpo no vacío;
- presentar tono profesional, natural y directo;
- explicar qué ocurre, por qué importa y consecuencias plausibles con prudencia;
- distinguir confirmado vs posible;
- mantener incertidumbres materiales;
- mencionar gravedad como evaluación humana;
- cerrar con solicitud/intervención concreta.

No debe:

- usar headings rígidos de ficha;
- repetir literalmente todas las secciones del Canvas;
- mostrar ids, enums o metadatos internos;
- presentar inferencias como hechos;
- inventar recomendaciones;
- cambiar gravedad;
- aprobar ni enviar.

### 8.2 Mensaje breve

Debe:

- tener cuerpo no vacío;
- ser sustancialmente más breve que el correo;
- conservar situación, riesgo, incertidumbre material y pedido;
- incluir gravedad humana cuando corresponda;
- poder entenderse sin consultar correo;
- terminar con pregunta o pedido concreto.

No debe:

- incluir asunto;
- incluir metadatos, ids o lenguaje interno;
- ser sólo recorte del primer párrafo del correo;
- eliminar incertidumbre material para ganar brevedad;
- inventar información.

### 8.3 Edición, regeneración, stale, revisión/aprobación

- Editar conserva texto exacto, invalida revisión previa y no dispara IA.
- Regeneración ocurre sólo por acción humana explícita.
- Si hubo edición, regeneración pide confirmación antes de reemplazar.
- En stale se bloquea copia como contenido vigente.
- Revisión y aprobación cubren versión completa del brief.

## 9. Edge Cases

- Intento de copiar con comunicación stale.
- Intento de regenerar cuando existe edición humana no guardada.
- Salida de composición detectada como mecánica.
- Salida con datos no sustentados por input.
- Error de persistencia al guardar nueva versión compuesta.

## 10. Fuera de alcance

- RealAIProvider y conexión con LLM real.
- Envío de correo o mensajería.
- Integraciones con Outlook, Teams, Slack, Microsoft Graph o webhooks.
- Selección de destinatarios.
- Backend adicional, agentes, RAG, MCP, exportación o tracking de lectura.
- Recomendación automática de gravedad o aprobación automática.
- Decisión del superior.
- Nueva state machine o nuevo CaseStatus.

## 11. Criterios de éxito

- **SC-001**: El correo generado deja de percibirse como ficha por ausencia de
  headings rígidos y presencia de narrativa sintética con pedido concreto.
- **SC-002**: El mensaje breve conserva contenido material, incertidumbre y
  pedido, siendo claramente más breve que el correo.
- **SC-003**: No se introducen afirmaciones no sustentadas por contenido
  validado del análisis.
- **SC-004**: Edición, regeneración manual, stale, revisión y aprobación
  funcionan sin automatismos no autorizados.

## 12. Clarifications

### Session 2026-11-16

- Q: ¿El compositor de comunicación ejecutiva se define como subetapa de `generateBrief` o como método independiente? → A: Se define como subetapa explícita de `generateBrief` para mantener un único punto de generación bajo acción humana.
- Q: ¿Cuál es el input exacto del compositor? → A: El input funcional incluye `caseId`, `caseTitle`, `audience="DIRECT_LEADER"`, `validatedCanvasItems` (sólo VALIDATED/EDITED), `criticalReview` completada, `openWarnings` pertinentes, `humanSeverityAssessment`, `structuredBrief`, `requiredIntervention` y `language="es"`.
- Q: ¿Qué ocurre si la comunicación fue editada y el usuario regenera? → A: Debe pedirse confirmación explícita antes de reemplazar; la versión editada previa se conserva en historial.
- Q: ¿Qué efecto tiene editar comunicación sobre `reviewedByUser`? → A: Editar asunto o cuerpo invalida revisión previa: `reviewedByUser=false` y `reviewedAt=null`.
- Q: ¿Cómo se relaciona con stale? → A: Si el brief está stale, la comunicación también está stale; se bloquea copia como vigente y no existe regeneración automática.
- Q: ¿Cómo queda versión/historial al regenerar? → A: Regenerar crea una nueva versión de brief como actual e incorpora la versión previa al historial sin sobrescribirla.
- Q: ¿Qué pasa con output inválido de composición? → A: Una salida inválida (por schema o regla anti-mapeo) no se persiste ni reemplaza una versión válida previa; si no hay versión previa válida, la generación falla sin crear brief nuevo.
- Q: ¿Cómo se detecta mapeo mecánico? → A: Se usa validación simple por reglas: headings rígidos, estructura 1:1 por dimensión, repetición literal excesiva, lenguaje interno y ausencia de cierre con pedido/pregunta.
- Q: ¿Cómo se maneja trazabilidad sin exponer ids en comunicación? → A: La trazabilidad interna conserva referencias técnicas; la UI narrativa no muestra ids por defecto y el detalle queda en vista de análisis/trazabilidad bajo demanda.
- Q: ¿Cuál es la vista inicial en `BRIEF_DRAFT`? → A: “Comunicación ejecutiva”.
- Q: ¿Cuál es la relación entre comunicación, review y approval? → A: Revisión y aprobación aplican a la versión completa del brief; editar o regenerar comunicación invalida revisión y exige nueva revisión antes de aprobar.
- Q: ¿Cómo se garantiza compatibilidad con briefs legacy? → A: Briefs legacy sin `communication` siguen siendo consultables en análisis estructurado, pero deben regenerarse explícitamente para habilitar comunicación ejecutiva vigente, copia y aprobación sobre versión completa.

## 13. Decisiones cerradas para Plan

- **DC-001**: Se congela subetapa de composición dentro de `generateBrief`.
- **DC-002**: Se congela input de composición con grounding exclusivo en contenido validado/pertinente.
- **DC-003**: Se congela confirmación obligatoria al regenerar si hubo edición humana previa.
- **DC-004**: Se congela invalidación de revisión al editar comunicación.
- **DC-005**: Se congela relación directa entre stale y bloqueo de copia vigente.
- **DC-006**: Se congela política de versionado: regeneración crea nueva versión y preserva historial.
- **DC-007**: Se congela política de seguridad de persistencia: output inválido no reemplaza versión válida.
- **DC-008**: Se congela validación anti-mapeo mecánico por reglas simples y observables.
- **DC-009**: Se congela trazabilidad técnica interna con exposición bajo demanda.
- **DC-010**: Se congela vista inicial de `BRIEF_DRAFT` en “Comunicación ejecutiva”.
- **DC-011**: Se congela alcance de review/approval sobre versión completa del brief.
- **DC-012**: Se congela compatibilidad funcional legacy con regeneración explícita para comunicación vigente.

## 14. Ambigüedades remanentes

No quedan ambigüedades críticas para iniciar Plan.

Ambigüedades no críticas diferibles a Plan:

- definición del umbral operativo exacto de “repetición literal excesiva” para la regla anti-mapeo;
- detalle de microcopy para mensajes de error y confirmación en UI;
- detalle de presentación visual de trazabilidad bajo demanda.
