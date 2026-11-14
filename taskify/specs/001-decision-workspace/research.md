# Research: Decision Workspace MVP

## Decision 1: Arquitectura web con frontend y backend separados
- Decision: Implementar una aplicación web con frontend React y backend API Fastify.
- Rationale: Permite mantener separación entre interfaz, reglas de dominio y proveedor de IA, alineado con la constitución.
- Alternatives considered:
  - App monolítica frontend-only: descartada por dificultar reglas de negocio auditables y contratos claros.
  - App desktop nativa: descartada por mayor costo de entrega para MVP.

## Decision 2: Persistencia local con SQLite + limpieza automática
- Decision: Usar SQLite local para casos, estados, afirmaciones y trazabilidad; ejecutar purga automática por retención de 90 días.
- Rationale: Cumple requisito de retención y minimiza complejidad operativa en demo local.
- Alternatives considered:
  - JSON en memoria: descartado por baja trazabilidad y riesgo de pérdida de estado.
  - PostgreSQL remota: descartada por complejidad innecesaria para MVP.

## Decision 3: Motor de reglas de estado explícitas
- Decision: Modelar transición de estados con reglas determinísticas + acciones manuales (especialmente "Listo para revisión" y "Listo para elevar").
- Rationale: Evita ambigüedad operativa y garantiza cumplimiento de gates definidos en la spec.
- Alternatives considered:
  - Cambio libre de estado: descartado por romper controles de calidad.
  - Estado inferido por IA: descartado por conflicto con juicio humano obligatorio.

## Decision 4: Contrato API tipado y validado con esquemas
- Decision: Definir OpenAPI para operaciones de casos/canvas/brief y validar payloads con Zod.
- Rationale: Asegura consistencia entre frontend y backend y facilita pruebas de contrato.
- Alternatives considered:
  - Tipado implícito sin contrato: descartado por riesgo de deriva y errores de integración.

## Decision 5: Proveedor de IA desacoplado por adaptador
- Decision: Implementar interfaz `AiProvider` con un adaptador OpenAI-compatible y modo mock para tests/demos.
- Rationale: Cumple principio de intercambiabilidad y permite pruebas sin dependencia externa.
- Alternatives considered:
  - SDK embebido directo en UI: descartado por acoplamiento y riesgo de secretos.
  - Un único proveedor hardcoded en backend: descartado por baja portabilidad.

## Decision 6: Estrategia de pruebas por riesgo
- Decision: Cubrir reglas críticas con pruebas unitarias e integración; usar E2E para flujos principales del canvas y brief.
- Rationale: Prioriza verificación de controles humanos, trazabilidad y transiciones de estado.
- Alternatives considered:
  - Solo E2E manual: descartado por baja repetibilidad.
  - Solo unit tests: descartado por falta de validación de experiencia completa.

## Decision 7: Observabilidad mínima para auditoría
- Decision: Registrar eventos estructurados (aceptar/editar/rechazar sugerencias, cambios de estado, generación de brief).
- Rationale: Necesario para explicar resultados y soportar evaluación control vs IA.
- Alternatives considered:
  - Logs de texto no estructurados: descartados por baja auditabilidad.
  - Telemetría avanzada distribuida: diferida por alcance MVP.