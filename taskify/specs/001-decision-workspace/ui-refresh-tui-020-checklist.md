# T-UI-020 — Cierre de regresión funcional + checklist DESIGN

Fecha: 2026-11-15

## 1) Resultado de regresión técnica

- `npm run test:unit --workspace frontend` ✅
- `npm run test:component --workspace frontend` ✅
- `npm run build --workspace frontend` ✅

E2E críticos del flujo principal ejecutados en esta iteración:
- `npm run test:e2e:slice1 --workspace frontend` ✅
- `npm run test:e2e:slice4 --workspace frontend` ✅
- `npm run test:e2e:slice9 --workspace frontend` ✅
- `npm run test:e2e:slice10 --workspace frontend` ✅

Ajuste de compatibilidad de pruebas por marcado semántico del diálogo de aprobación:
- `tests/component/slice10-human-approval.test.tsx` (assertions por contenido semántico, no por concatenación exacta)
- `tests/e2e/slice10-human-approval.spec.ts` (assertions por contenido semántico en modal)

## 2) Checklist DESIGN.md (Definition of Done — UI)

### Visual consistency
- [x] Uses tokens defined in this document.
- [x] Does not introduce arbitrary color, radius, type size, spacing, shadow, or z-index values without documentation.
- [x] Equivalent components look and behave consistently.
- [x] Uses the approved dark surface hierarchy.

### Interaction
- [x] Default, hover, active, focus-visible, disabled, and loading states are implemented where applicable.
- [x] Error and selected states are implemented where applicable.
- [x] Loading does not cause avoidable layout shifts.

### Decision semantics
- [x] Epistemic state is visible where required.
- [x] Evidence gaps are distinguishable from assumptions and inferences.
- [x] AI-generated content is distinguishable from human-confirmed content.
- [x] Generated does not visually imply Approved.
- [x] READY is only displayed when the readiness rules are satisfied.
- [x] READY and APPROVED remain distinct.

### Accessibility
- [x] Body text targets WCAG AA 4.5:1 contrast.
- [x] Keyboard focus is visible.
- [x] Essential workflow can be operated by keyboard.
- [x] Interactive targets are at least 44px where practical.
- [x] State does not depend on color alone.
- [x] Inputs and icon-only controls have accessible names.
- [x] Reduced motion is respected.

### Responsive
- [x] Critical workflow remains usable below 768px.
- [x] No essential state becomes unavailable on compact layouts.
- [x] Tables/workspace structures have an intentional narrow-screen behavior.

### Evidence
- [x] Component tests cover structural/role requirements where applicable.
- [x] E2E tests cover key workflow states where applicable.
- [x] Critical UI states have visual review evidence or snapshots if the project uses visual regression testing.

## 3) Excepciones de diseño

- No quedan excepciones de diseño abiertas no aprobadas para el alcance del UI Refresh MVP.
