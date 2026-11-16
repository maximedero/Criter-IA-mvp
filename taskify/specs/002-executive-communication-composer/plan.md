# Implementation Plan: Executive Communication Composer

**Branch**: `002-executive-communication-composer` | **Date**: 2026-11-16 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/002-executive-communication-composer/spec.md`

## Summary

Implementar un compositor narrativo de comunicación ejecutiva dentro del flujo
actual de brief, minimizando cambios arquitectónicos y preservando el control
humano en generación, edición, regeneración, revisión y aprobación.

La iteración se ejecuta con alcance acotado sobre modelos, validaciones,
proveedor IA mock, almacenamiento local y vista de brief, sin alterar motores
centrales de cobertura, revisión crítica, gravedad humana ni state machine.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18, Zod, Vitest, React Testing Library, Playwright

**Storage**: `localStorage` mediante `briefStorage`

**Testing**: Unit + Component + E2E + regresión de slices

**Target Platform**: Frontend web local (Vite)

**Project Type**: Frontend-only

**Constraints**:

- sin backend nuevo;
- sin integraciones externas;
- sin envío de mensajes;
- sin automatismos de aprobación;
- sin cambios conceptuales en flujo de estados.

## Constitution Check

- Juicio humano obligatorio: PASS (editar/revisar/aprobar siguen siendo humanos)
- Evidencia antes que elocuencia: PASS (grounding explícito en contenido validado)
- Abstención con información insuficiente: PASS (limitaciones e incertidumbre visibles)
- Razonamiento visible y auditable: PASS (análisis estructurado y trazabilidad preservados)
- Autonomía proporcional al riesgo: PASS (sin acciones externas automáticas)
- Validación antes que expansión: PASS (foco en hipótesis del MVP sobre comunicación)

## Decisión de arquitectura: generateBrief vs composeExecutiveCommunication

### Opción A: extender `generateBrief` (seleccionada)

`generateBrief` mantiene su responsabilidad de construir el brief completo e
incorpora una subetapa explícita de composición ejecutiva (correo + mensaje),
con validación de schema y regla anti-mapeo antes de persistir.

### Opción B: agregar `composeExecutiveCommunication` en `AIProvider` (descartada)

Separaría la composición en un método adicional invocable de forma independiente.

### Justificación de la elección

- **Simplicidad**: un único punto de entrada para generar salida completa del brief.
- **Separación de responsabilidades**: se mantiene la responsabilidad de “armar brief” en el mismo caso de uso; la subetapa compositora es interna y explícita.
- **Riesgo de duplicar grounding**: menor en A, porque el grounding se aplica una sola vez sobre el mismo input consolidado.
- **Facilidad de testing**: A permite pruebas determinísticas extremo a extremo del contrato `generateBrief` sin orquestación adicional.
- **Impacto MVP**: A minimiza superficie de cambio (sin ampliar interfaz pública del proveedor).

## Arquitectura propuesta (mínimo cambio)

1. Mantener `GenerateBriefInput/Result` como contrato principal.
2. Introducir modelos de composición como subestructura de `DecisionBrief`.
3. Componer comunicación en `MockAIProvider` usando input validado ya consolidado.
4. Validar salida con Zod + regla anti-mapeo mecánico antes de persistencia.
5. Preservar historial/versionado en `briefStorage` sin reemplazos destructivos.
6. Mantener UI con tres vistas existentes, priorizando “Comunicación ejecutiva”.

## Plan por áreas

### 1) Compositor narrativo + AIProvider

- Integrar subetapa compositora dentro de `generateBrief`.
- Definir prompt/instrucción RCTA auditable para `MockAIProvider`.
- Garantizar determinismo por fixtures (Dynamics, SharePoint/Nintex, Producción).
- Mantener invocación sólo bajo acción humana de generación/regeneración.

### 2) Contratos Zod + DecisionBrief

- Agregar/ajustar schema de `ComposeExecutiveCommunicationInput`.
- Agregar/ajustar schema de `ComposedExecutiveCommunication`.
- Extender validaciones para:
  - grounding estricto;
  - bloqueo de output mecánico;
  - consistencia de gravedad/intervención;
  - invalidación de persistencia ante output inválido.

### 3) Persistencia + migración legacy

- Mantener `briefStorage` como fuente única de estado de brief.
- Migración no destructiva de records legacy sin `communication` completo.
- Política legacy: consultable, pero requiere regeneración explícita para
  comunicación vigente operativa (copia/revisión/aprobación completa).
- Preservar versión válida previa cuando falle nueva composición.

### 4) UI BriefWorkspace (jerarquía acotada)

- Mantener orden de vistas:
  1. Comunicación ejecutiva (default en BRIEF_DRAFT)
  2. Brief ejecutivo
  3. Análisis completo y trazabilidad
- Incorporar bloque “Próximo paso” dinámico en estados avanzados.
- Incorporar resumen compacto de Cobertura, Revisión, Gravedad, Brief,
  Aprobación.
- Mantener edición de asunto/cuerpo correo/cuerpo mensaje.
- Mantener copia “como correo” y “como mensaje” con validaciones de stale.

### 5) Edición, regeneración, stale, review/approval

- Editar comunicación:
  - conserva texto exacto;
  - marca `editedByUser=true` y `updatedAt`;
  - invalida revisión (`reviewedByUser=false`, `reviewedAt=null`);
  - no llama IA.
- Regeneración:
  - sólo por acción humana;
  - con confirmación si hay edición previa;
  - crea nueva versión e historial consistente;
  - no hereda aprobación.
- Stale:
  - se calcula contra canvas actualizado;
  - bloquea copia vigente;
  - no regenera automáticamente.
- Review/Approval:
  - aplican a versión completa del brief;
  - cualquier edición/regeneración requiere nueva revisión previa a aprobación.

### 6) Clipboard + manejo de error

- Conservar formatos actuales de copiado.
- Mensajes de confirmación/error en español.
- Sin llamadas IA, sin cambios de estado ni integraciones externas durante copia.

### 7) Instrumentación de llamadas IA

- Registrar y verificar en pruebas el conteo esperado de llamadas:
  - generación/regeneración: sólo las esperadas;
  - editar/copiar/reload/aprobar: cero llamadas adicionales.
- Instrumentación en entorno de pruebas, sin introducir telemetría externa.

### 8) Testing y regresión

- Unit: modelos, schemas, regla anti-mapeo, grounding, edición/regeneración,
  stale/review/approval, persistencia segura.
- Component: jerarquía UI, vista inicial, edición, copia, bloqueos por stale,
  confirmaciones.
- E2E: Producción, Dynamics, SharePoint/Nintex con foco en narrativa,
  incertidumbre, no invención y llamadas IA esperadas.
- Regresión obligatoria:
  - Slices 1–10;
  - Slice 9 stale/preconditions;
  - Fase 8 y 8B;
  - build.

## Rollback

Si la composición narrativa introduce fallas funcionales o regresiones críticas:

1. desactivar la subetapa compositora y conservar brief estructurado existente;
2. mantener persistencia y aprobaciones previas intactas;
3. restaurar comportamiento anterior de comunicación sin alterar Coverage,
   Critical Review ni Human Approval;
4. reactivar gradualmente con pruebas unitarias y e2e verdes.

## Project Structure

### Documentation (this feature)

```text
specs/002-executive-communication-composer/
├── spec.md
├── plan.md
└── tasks.md (pendiente en /speckit.tasks)
```

### Source Code impactado (estimado)

```text
frontend/src/
├── domain/models/
│   └── DecisionBrief.ts
├── domain/workflow/
│   └── briefWorkflow.ts
├── providers/ai/
│   ├── AIProvider.ts
│   ├── MockAIProvider.ts
│   └── aiParsing.ts
├── providers/storage/
│   └── briefStorage.ts
├── validation/
│   └── aiSchemas.ts
└── features/brief/
	├── BriefWorkspace.tsx
	└── brief-workspace.css

frontend/tests/
├── unit/
│   ├── brief-workflow.test.ts
│   ├── brief-storage-error.test.ts
│   └── mock-ai-provider.test.ts
├── component/
│   └── slice9-brief.test.tsx
└── e2e/
	├── slice9-executive-communication.spec.ts
	├── slice9-executive-communication-scenarios.spec.ts
	└── nuevos specs composer (Producción/Dynamics/SharePoint)
```

## Riesgos y mitigación

1. **Riesgo**: sobreajuste del mock con texto rígido.
   - **Mitigación**: tests de no-mapeo + fixtures por dominio + validaciones simples.
2. **Riesgo**: duplicación accidental de grounding entre brief estructurado y composición.
   - **Mitigación**: input compositivo único derivado del consolidado validado.
3. **Riesgo**: invalidar aprobación por cambios menores sin visibilidad.
   - **Mitigación**: mensajes explícitos y estado de revisión visible en UI.
4. **Riesgo**: migración legacy incompleta.
   - **Mitigación**: normalización no destructiva + pruebas de carga de records antiguos.

## Qué NO cambia (congelado)

- Coverage Engine
- Critical Review
- Human Severity
- State Machine
- Human Approval
- READY_TO_ESCALATE

No se alteran reglas conceptuales de estos componentes; sólo se integran con la
nueva comunicación ejecutiva en su punto actual de consumo.

## Estado

READY FOR TASKS
