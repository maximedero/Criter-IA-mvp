# Implementation Plan: Decision Workspace MVP

**Branch**: `001-decision-workspace` | **Date**: 2026-11-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/001-decision-workspace/spec.md`

## Summary

Construir un vertical slice inicial de Decision Workspace orientado exclusivamente a validar la hipótesis de producto: que el brief generado con el workflow del canvas permite al superior comprender mejor el riesgo y definir con mayor claridad el próximo paso. La primera versión se ejecuta completa en cliente (frontend), con reglas de dominio determinísticas, almacenamiento local con retención y asistencia IA desacoplada mediante `AIProvider`.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18, Vite, Zod, AIProvider desacoplado (`MockAIProvider` + `RealAIProvider`)

**Storage**: `localStorage` (casos, estado del workflow, fixtures, createdAt, expiresAt, limpieza por retención)

**Testing**: Vitest, React Testing Library, Playwright

**Target Platform**: Navegador desktop moderno (Chrome/Edge) con ejecución local

**Project Type**: Frontend web application (sin backend obligatorio en MVP inicial)

**Performance Goals**: Navegación y acciones locales sin demoras perceptibles; flujo completo de caso en entorno local de demostración

**Constraints**: Sin integraciones corporativas; sin agentes autónomos; sin acciones externas automáticas; retención máxima 90 días

**Scale/Scope**: MVP single-user orientado a decenas de casos y fixtures de demostración

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Juicio humano obligatorio: PASS (gravedad y aprobación del brief exclusivamente humanas)
- Evidencia antes que elocuencia: PASS (clasificación epistemológica explícita + trazabilidad)
- Abstención con información insuficiente: PASS (datos faltantes visibles y brief provisional explícito)
- Razonamiento visible y auditable: PASS (Decision Canvas como interfaz principal)
- Estructura fija, preguntas dinámicas: PASS (8 dimensiones + selección contextual)
- Asistencia contextual (no chat principal): PASS (IA dentro del workflow, no gobernándolo)
- Autonomía proporcional al riesgo: PASS (sin ejecución autónoma ni escalamiento automático)
- Privacidad y minimización de datos: PASS (datos locales y casos simulados/anonimizados)
- Brief como artefacto de decisión: PASS (aprobación explícita del usuario antes de listo para elevar)
- Validación antes que expansión: PASS (foco en hipótesis de valor del brief)

## Project Structure

### Documentation (this feature)

```text
specs/001-decision-workspace/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   ├── domain/
│   │   ├── rules/
│   │   ├── workflow/
│   │   └── models/
│   ├── providers/
│   │   ├── ai/
│   │   │   ├── AIProvider.ts
│   │   │   ├── MockAIProvider.ts
│   │   │   └── RealAIProvider.ts
│   │   └── storage/
│   ├── features/
│   │   ├── inbox/
│   │   ├── canvas/
│   │   ├── review/
│   │   └── brief/
│   └── validation/
└── tests/
    ├── unit/
    ├── component/
    └── e2e/
```

**Structure Decision**: Simplificar a arquitectura frontend-only para el MVP inicial, manteniendo separación estricta entre UI, dominio determinístico, proveedor de IA y persistencia local.

## Complexity Tracking

No constitution violations identified; no exceptions required.
