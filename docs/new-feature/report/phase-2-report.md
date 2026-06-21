# Phase 2 Report

- Admin scaffold files:
  - Added Vite React TypeScript app foundation in `careergraph-admin`
  - Added env/config/build files: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.env.example`, `index.html`
  - Added app foundation under `src/`:
    - `app/` router and providers
    - `config/env.ts`
    - `lib/http.ts`, `lib/authToken.ts`, `lib/api.ts`
    - `stores/authStore.ts`
    - `features/auth`, `features/dashboard`, `features/company-verification`, `features/companies`
    - `shared/components`, `shared/layout`, `styles.css`

- Routes:
  - Public:
    - `/login`
  - Protected:
    - `/dashboard`
    - `/verification`
    - `/verification/:requestId`
    - `/companies/:companyId`
  - Root redirects to `/dashboard`

- Auth behavior:
  - Login posts to `/auth/login` with `role: "ADMIN"`
  - Access token is persisted in Zustand store
  - JWT is decoded locally to enforce admin role
  - Axios client injects bearer token and attempts refresh via `/auth/refresh`
  - Route guard redirects unauthenticated or non-admin users to `/login`
  - Backend session probe currently uses `GET /admin/company-verification-requests?page=0&size=1` because Phase 1 backend did not add `/admin/me`

- Dev server/build:
  - Code scaffolded and ready for `npm install`
  - Install/build not yet executed in this report because dependencies are not present in `careergraph-admin` yet and network approval is required if packages must be downloaded

- Known gaps:
  - No detailed verification queue/detail business UI yet by Phase 2 scope
  - No `/admin/me` backend endpoint exists yet, so guard uses an existing admin-only endpoint as a lightweight permission probe
  - Placeholder dashboard metrics are static until later backend summary APIs are wired

- Next phase:
  - Phase 3: implement verification queue/detail screens, document viewer, moderation dialogs, and company block/unblock entry points on top of this shell
