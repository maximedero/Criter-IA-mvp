# Research: Decision Workspace MVP

## Decision 1: Arquitectura simplificada frontend-only para el vertical slice inicial
- Decision: Implementar el MVP inicial sin backend obligatorio, con React + TypeScript + dominio determinístico en cliente.
- Rationale: Reduce complejidad y acelera validación de la hipótesis de producto centrada en calidad del brief.
- Alternatives considered:
  - Frontend + backend desde inicio: descartado por sobrecosto para hipótesis actual.
  - App desktop nativa: descartada por mayor costo de entrega.

## Decision 2: Persistencia en localStorage con política de retención
- Decision: Usar localStorage para casos, estados, trazabilidad mínima, fixtures y metadatos temporales (`createdAt`, `expiresAt`).
- Rationale: Soporta decenas de casos en MVP y permite limpieza determinística por retención sin infraestructura adicional.
- Alternatives considered:
  - SQLite local: removido del MVP inicial por complejidad innecesaria.
  - Persistencia sólo en memoria: descartada por pérdida de continuidad de casos.

## Decision 3: Dominio determinístico fuera del prompt
- Decision: Implementar en lógica de dominio (no en prompts) las reglas de estados, cobertura mínima, bloqueos, aprobación, gravedad y `ReadyToEscalate`.
- Rationale: Garantiza consistencia, testabilidad y cumplimiento de principios de control humano.
- Alternatives considered:
  - Delegar reglas al modelo: descartado por baja confiabilidad y auditabilidad.

## Decision 4: IA acotada al rol de asistencia
- Decision: Limitar la IA a interpretación del relato, clasificación sugerida, detección de vacíos, pregunta dinámica, contradicciones potenciales, escenarios sugeridos y generación/revisión de brief.
- Rationale: Mantiene human-in-the-loop y evita comportamiento de agente autónomo.
- Alternatives considered:
  - IA gobernando transiciones o aprobaciones: descartado por conflicto con Constitution.

## Decision 5: Estrategia de AIProvider desacoplado
- Decision: Mantener interfaz `AIProvider` con `MockAIProvider` para MVP y `RealAIProvider` preparado para siguiente etapa.
- Rationale: Permite validar producto con control de costos/riesgo y conservar extensibilidad.
- Alternatives considered:
  - Acoplar proveedor real desde inicio: descartado por dependencia prematura de credenciales y operación.

## Decision 6: Validación estricta de salidas IA con Zod
- Decision: Toda salida del AIProvider debe llegar estructurada y validarse con Zod antes de impactar el canvas o brief.
- Rationale: Reduce deriva semántica y protege reglas funcionales críticas.
- Alternatives considered:
  - Parseo libre de texto: descartado por baja robustez.

## Decision 7: RealAIProvider con posible proxy posterior (fuera del vertical slice)
- Decision: Dejar explícito que `RealAIProvider` puede requerir proxy server-side mínimo para proteger credenciales, pero ese proxy no integra el MVP inicial.
- Rationale: Preserva seguridad futura sin bloquear el experimento actual.
- Alternatives considered:
  - Incluir proxy en MVP inicial: diferido por no ser necesario para la hipótesis principal.

## Decision 8: Estrategia de testing enfocada en hipótesis
- Decision: Usar Vitest + React Testing Library para dominio/UI y Playwright para flujos de los 3 casos definidos (Dynamics, SharePoint/Nintex, Producción).
- Rationale: Cubre comportamiento funcional observable y validación del resultado de brief.
- Alternatives considered:
  - Supertest: removido mientras no exista backend.
  - Sólo tests manuales: descartado por baja repetibilidad.