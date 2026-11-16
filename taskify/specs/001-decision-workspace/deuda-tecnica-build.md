# Deuda técnica de build (cierre previo a Fase 9)

## Resumen

Este documento clasifica errores de build observados al ejecutar el build global del repositorio durante el cierre técnico previo a Fase 9.

Criterio de clasificación:
- **preexistente**: error ya presente por configuración/base del proyecto, sin relación causal con ExecutiveCommunication.
- **nuevo**: error introducido por esta iteración.

Confirmación de cierre:
- **Errores atribuibles a ExecutiveCommunication: 0**

---

## DTB-001
- **archivo**: `taskify/frontend/tests/component/inbox-page.test.tsx`
- **error**: `TS2792 Cannot find module '@testing-library/react'` y `TS2792 Cannot find module 'vitest'`
- **causa probable**: resolución TypeScript de dependencias de test no alineada con el entorno de build global.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: revisar configuración de `tsconfig` para tests y resolución de módulos en el contexto del build global.

## DTB-002
- **archivo**: múltiples `.tsx` de frontend y tests (ej. `inbox-page.test.tsx`, `CoveragePanel.tsx`, `CriticalReviewPanel.tsx`)
- **error**: `TS2686 'React' refers to a UMD global, but the current file is a module`
- **causa probable**: desalineación entre `jsx` runtime configurado y chequeo TypeScript usado por build global.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: unificar estrategia de JSX (`react-jsx` o import explícito) y separar `tsconfig` de aplicación vs `tsconfig` de análisis global.

## DTB-003
- **archivo**: múltiples imports de estilos CSS en `.tsx` (ej. `critical-review-panel.css`, `brief-workspace.css`)
- **error**: `TS2882 Cannot find module or type declarations for side-effect import of '*.css'`
- **causa probable**: faltan declaraciones de módulo CSS o configuración de tipos para imports de estilos.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: agregar declaración global para módulos CSS y ajustar include/typeRoots.

## DTB-004
- **archivo**: múltiples tests E2E (ej. `us2-canvas.spec.ts`, `slice9-executive-communication*.spec.ts`)
- **error**: `TS2792 Cannot find module '@playwright/test'`
- **causa probable**: entorno de build global evalúa archivos E2E sin configuración de resolución apropiada para ese paquete.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: usar `tsconfig` específico para E2E o excluir E2E del chequeo de build de aplicación.

## DTB-005
- **archivo**: `taskify/frontend/src/features/review/CriticalReviewPanel.tsx`, `taskify/frontend/src/features/brief/BriefWorkspace.tsx`, `taskify/frontend/src/domain/workflow/briefWorkflow.ts`, `taskify/frontend/src/validation/aiSchemas.ts`
- **error**: `TS2550 Property 'includes' / 'entries' / 'values' does not exist ... try changing lib to es2016/es2017`
- **causa probable**: `lib`/`target` del chequeo TypeScript global por debajo de lo requerido por el código actual.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: actualizar `lib` mínimo y alinear target en `tsconfig` principal o de build.

## DTB-006
- **archivo**: `taskify/frontend/src/features/review/CriticalReviewPanel.tsx`, `taskify/frontend/src/features/brief/BriefWorkspace.tsx`
- **error**: `TS2792 Cannot find module '../../providers/ai'`
- **causa probable**: resolución de barrel imports no consistente bajo configuración del build global.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: revisar `moduleResolution`, `paths` y extensión de imports para build estático.

## DTB-007
- **archivo**: `taskify/frontend/src/app/ui/Button.tsx`
- **error**: `TS1259 Module '@types/react/index' can only be default-imported using 'esModuleInterop'`
- **causa probable**: incompatibilidad entre estilo de import React y flags de interoperabilidad TypeScript en build global.
- **preexistente/nuevo**: preexistente
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: habilitar `esModuleInterop` en el contexto adecuado o ajustar imports a estilo compatible.

## DTB-008
- **archivo**: `taskify/frontend/tests/component/slice9-brief.test.tsx`, `taskify/frontend/tests/e2e/slice9-executive-communication.spec.ts`
- **error**: `TS1501 regular expression flag /s only available when targeting es2018`
- **causa probable**: target TS antiguo en chequeo global.
- **preexistente/nuevo**: **nuevo en esta iteración y corregido**
- **afecta MVP**: no
- **afecta Fase 9**: no
- **corrección recomendada**: ya mitigado en código eliminando flag `/s`; adicionalmente conviene alinear target global.

---

## Estado de bloqueo para Fase 9

- Los errores de build restantes documentados son **preexistentes** o de configuración global.
- No impiden la ejecución funcional del MVP en las suites de regresión validadas.
- Se recomienda planificar un hardening de `tsconfig` como deuda transversal posterior al cierre técnico de Fase 9.
