# Quickstart: Decision Workspace MVP

## Prerequisites
- Node.js 22 LTS
- npm 10+
- Git

## 1) Install dependencies
```bash
npm install
```

## 2) Run frontend
```bash
npm run dev:frontend
```
App expected at `http://localhost:5173`.

## 3) Seed demo fixtures (localStorage)
```bash
npm run seed:demo
```
Loads initial demo cases: Dynamics 365, SharePoint/Nintex, Producción.

## 4) Execute tests
```bash
npm run test:unit
npm run test:component
npm run test:e2e
```

## 5) Validate key workflow
1. Create case with informal description.
2. Confirm 8 canvas dimensions are visible.
3. Accept/edit/reject IA suggestions.
4. Verify cobertura mínima: sólo cuentan elementos validados/editados por usuario; pendientes/rechazados no cuentan.
5. Verify preguntas dinámicas: una por vez, sin límite rígido, con máximo orientativo de 8 en primera ronda.
6. Generate brief only when cobertura mínima is met (incluye incertidumbre explícita o declaración de ausencia).
7. Set "Listo para elevar" only with checklist visible + "Aprobar brief" + confirmación final.

## 6) Data retention check (localStorage)
- Verify each case stores `createdAt` and `expiresAt`.
- Verify expired cases are removed automatically at app startup/listing.

## 7) E2E mandatory coverage
- Playwright must validate at least:
  - caso Dynamics;
  - caso SharePoint/Nintex;
  - caso Producción.

## 8) Notes
- MVP inicial no requiere backend obligatorio.
- `RealAIProvider` podrá requerir proxy server-side en etapa posterior para proteger credenciales.