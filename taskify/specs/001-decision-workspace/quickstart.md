# Quickstart: Decision Workspace MVP

## Prerequisites
- Node.js 22 LTS
- npm 10+
- Git

## 1) Install dependencies
```bash
npm install
```

## 2) Run backend API
```bash
npm run dev:backend
```
API expected at `http://localhost:4000`.

## 3) Run frontend
```bash
npm run dev:frontend
```
App expected at `http://localhost:5173`.

## 4) Seed demo data
```bash
npm run seed:demo
```
Loads initial demo cases (Dynamics 365, SharePoint/Nintex, Producción).

## 5) Execute tests
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 6) Validate key workflow
1. Create case with informal description.
2. Confirm 8 canvas dimensions are visible.
3. Accept/edit/reject IA suggestions.
4. Reach "Listo para revisión" only when 8 dimensions have content.
5. Generate brief and set "Listo para elevar" only with manual approval + required blocks.

## 7) Data retention check
- Confirm cases older than 90 days are purged by cleanup job:
```bash
npm run retention:run
```
- Verify audit event is recorded for purge operation.

## 8) Validation notes (Phase 11)
- Backend build passes with `npm --prefix backend run build`.
- Backend tests pass with `npm --prefix backend run test`.
- Frontend production build passes with `npm --prefix frontend run build`.
- Remaining E2E execution requires Playwright runtime installation in the environment.
