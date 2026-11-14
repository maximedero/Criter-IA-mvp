# Implementation Plan: Decision Workspace MVP

**Branch**: `001-decision-workspace` | **Date**: 2026-11-13 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/001-decision-workspace/spec.md`

## Summary

Construir un MVP web de Criter-IA que permita crear casos, completar un Decision Canvas de 8 dimensiones, recibir asistencia de IA con validación humana, ejecutar revisión crítica y generar un brief ejecutivo listo para elevar bajo reglas explícitas (retención 90 días, máximo 5 preguntas IA por caso, y controles de estado definidos).

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend)

**Primary Dependencies**: React 18, Vite, Node.js 22 LTS, Fastify, Zod, OpenAI-compatible SDK (adaptador desacoplado)

**Storage**: SQLite local (metadatos y estado de casos) + archivos locales para fixtures de demostración

**Testing**: Vitest (unit), Playwright (E2E), Supertest (API integration)

**Target Platform**: Desktop browser moderno (Chrome/Edge) + ejecución local en Windows/macOS/Linux

**Project Type**: Web application (frontend + backend API)

**Performance Goals**: Navegación local <100ms p95; generación de sugerencias IA <6s p95 en entorno demo

**Constraints**: Sin integraciones corporativas; sin acciones autónomas; sin secretos en repositorio; retención máxima 90 días

**Scale/Scope**: MVP single-tenant para pruebas guiadas (1 usuario activo por sesión, decenas de casos demo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Juicio humano obligatorio: PASS (gravedad y aprobación del brief solo manuales; FR-013 y FR-024)
- Evidencia antes que elocuencia: PASS (clasificación epistemológica + trazabilidad de fuentes)
- Abstención con información insuficiente: PASS (detección explícita de faltantes y restricciones de IA)
- Razonamiento visible y auditable: PASS (canvas persistente con estados de validación)
- Estructura fija, preguntas dinámicas: PASS (8 bloques + límite de 5 preguntas por caso)
- Asistencia contextual (no chat principal): PASS (interacciones ligadas a bloques del canvas)
- Autonomía proporcional al riesgo: PASS (sin ejecución automática externa)
- Privacidad y minimización de datos: PASS (sin conectores automáticos, retención 90 días)
- Brief como artefacto de decisión: PASS (estado “Listo para elevar” con gate explícito)
- Validación antes que expansión: PASS (comparación control vs IA y métricas de éxito definidas)

## Project Structure

### Documentation (this feature)

```text
specs/001-decision-workspace/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── decision-workspace.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── domain/
│   ├── services/
│   ├── providers/
│   └── validation/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── app/
│   ├── features/
│   │   ├── inbox/
│   │   ├── canvas/
│   │   ├── review/
│   │   └── brief/
│   ├── components/
│   └── services/
└── tests/
    ├── e2e/
    └── unit/
```

**Structure Decision**: Se adopta estructura web frontend/backend para aislar dominio de negocio, proveedor de IA y experiencia de usuario, manteniendo reemplazabilidad del proveedor y pruebas por capa.

## Complexity Tracking

No constitution violations identified; no exceptions required.
