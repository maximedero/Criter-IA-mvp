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

## Alineación con Contrato de Diseño (`DESIGN.md`)

### Documento de referencia

- `specs/001-decision-workspace/DESIGN.md`

### Estrategia de implementación UI

1. Inventariar pantallas y componentes afectados por el feature.
2. Mapear cada pantalla con reglas aplicables de `DESIGN.md`.
3. Implementar por capas:
   - base visual (tokens, espaciado, tipografía);
   - componentes comunes;
   - estados e interacciones;
   - microcopy.
4. Validar consistencia cruzada entre pantallas del flujo.
5. Capturar evidencias en pruebas (componentes y E2E en estados críticos).

### Checklist de diseño previo a merge

- [ ] Se aplicaron tokens y patrones del contrato de diseño.
- [ ] No hay estilos inline/ad hoc que rompan homogeneidad.
- [ ] Acciones equivalentes comparten patrón visual e interacción.
- [ ] Estados de carga/error/confirmación son consistentes.
- [ ] Pruebas de UI actualizadas y aprobadas.
- [ ] No quedan excepciones abiertas sin aprobación.

### Riesgos y excepciones de diseño

| Riesgo/Excepción | Impacto | Mitigación | Estado |
|---|---|---|---|
| [completar] | [alto/medio/bajo] | [completar] | [abierto/cerrado] |

### Evidencias esperadas

- pruebas de componente para estructura, estado y accesibilidad mínima;
- pruebas E2E para transiciones visuales críticas;
- referencia explícita en PR a reglas de `DESIGN.md` aplicadas.

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

## Política Operativa MVP (producto funcional)

### 1. Propósito

Decision Workspace se considera actualmente un MVP funcional.
A partir de este punto, toda evolución debe priorizar estabilidad del flujo validado y homogeneidad de experiencia, sin ampliar alcance de producto de forma implícita.

### 2. Principios de operación

1. **Estabilidad primero**  
   No introducir cambios que comprometan el flujo funcional ya validado de extremo a extremo.

2. **Diseño como contrato**  
   Toda mejora visual debe cumplir `DESIGN.md` y mantener consistencia transversal entre pantallas.

3. **Sin expansión encubierta de alcance**  
   No incorporar nuevas capacidades de negocio bajo la etiqueta de “mejora UI”.

4. **Control humano preservado**  
   Mantener inalteradas las reglas de juicio humano (gravedad, revisión, aprobación), salvo corrección explícita de defectos.

5. **Cambios incrementales y trazables**  
   Preferir entregas pequeñas, verificables y reversibles.

### 3. Carriles de trabajo

Se establecen dos carriles simultáneos:

- **Carril A — Estabilidad MVP**
  - corrección de defectos;
  - regresiones funcionales;
  - robustez de persistencia y trazabilidad;
  - confiabilidad de pruebas.

- **Carril B — Homogeneidad UI**
  - aplicación incremental de `DESIGN.md`;
  - unificación de componentes visuales;
  - consistencia de estados, microcopy y accesibilidad base.

### 4. Regla de priorización

Prioridad por iteración:

1. Incidentes/regresiones funcionales del Carril A.
2. Ajustes críticos de usabilidad que bloqueen el flujo.
3. Homogeneización visual del Carril B.
4. Mejoras cosméticas no críticas.

### 5. Presupuesto de cambio recomendado

Distribución objetivo por ciclo corto:

- **70%** estabilidad funcional (Carril A)
- **30%** homogeneidad visual (Carril B)

Si aparecen regresiones funcionales: ajustar temporalmente a **90/10** hasta recuperar estabilidad.

### 6. Restricciones operativas

Queda prohibido, salvo decisión de producto explícita:

- modificar reglas centrales de dominio por conveniencia visual;
- alterar máquina de estados sin requerimiento formal;
- introducir nuevas integraciones o capacidades fuera del alcance MVP;
- fusionar refactors masivos de UI y cambios funcionales en un único entregable.

### 7. Criterio de aceptación dual (obligatorio)

Ninguna tarea de UI se considera cerrada si no cumple simultáneamente:

1. **Cumplimiento de diseño**  
   Alineación comprobable con `DESIGN.md`.

2. **No regresión funcional**  
   Flujo funcional del MVP intacto y pruebas relevantes en verde.

### 8. Puerta mínima de integración

Antes de integrar cambios:

- pruebas unitarias en verde;
- pruebas de componente en verde;
- pruebas E2E críticas del flujo en verde;
- checklist de diseño completado;
- evidencia de ausencia de impacto en reglas funcionales.

### 9. Gestión de deuda

Toda inconsistencia visual o técnica detectada se registra explícitamente como deuda, con:

- descripción breve;
- impacto;
- prioridad;
- decisión: corregir ahora / diferir.

Etiquetas sugeridas:
`mvp-estabilidad`, `ui-consistency`, `design-contract`, `deuda-tecnica`.

### 10. Manejo de excepciones

Si una mejora requerida por `DESIGN.md` exige cambiar una regla central:

1. no implementar automáticamente;
2. registrar excepción en plan y backlog;
3. documentar impacto y alternativa;
4. escalar a decisión de producto.

### 11. Métricas de control

Monitorear por iteración:

- cantidad de regresiones funcionales;
- porcentaje de pantallas alineadas con `DESIGN.md`;
- tiempo promedio de corrección de inconsistencias UI;
- tasa de reapertura de tareas por problemas de homogeneidad.

### 12. Definición de “avance sano” del MVP

Se considera avance sano cuando:

- no hay regresiones críticas del flujo funcional;
- aumenta sostenidamente la consistencia visual;
- las mejoras son incrementales, trazables y verificadas;
- no se amplía alcance sin decisión explícita.