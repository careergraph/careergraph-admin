# Phase 2 - Admin Site Setup

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 2: Admin site setup `/careergraph-admin` with React TS, routing, layout, auth guard, API client

### Goal

Create production-ready admin app foundation without implementing full verification workflows.

### Files/modules likely affected

- `careergraph-admin/package.json`
- `careergraph-admin/index.html`
- `careergraph-admin/vite.config.ts`
- `careergraph-admin/tsconfig*.json`
- `careergraph-admin/src/...`
- `careergraph-admin/.env.example`

### Detailed tasks

- Scaffold Vite React TypeScript app.
- Add dependencies aligned with HR site:
  - React, TypeScript, Vite
  - React Router
  - Axios
  - TanStack Query
  - Zustand or Context
  - lucide-react
  - zod/react-hook-form if needed
- Implement:
  - `http` client with token injection and 401 handling.
  - `authStore`.
  - `/login` page.
  - Admin auth guard checking token and `/admin/me`.
  - App shell with sidebar/topbar.
  - Placeholder routes:
    - `/dashboard`
    - `/verification`
    - `/verification/:requestId`
    - `/companies/:companyId`
- Add responsive enterprise layout.
- Add environment config for API base URL and RTC base URL if notifications are later added.

### Acceptance criteria

- Admin app runs locally.
- Login route exists.
- Protected layout redirects unauthenticated users.
- API client is ready.
- No verification business action screens yet beyond placeholders.

### Manual test checklist

- Start dev server.
- Visit `/login`.
- Visit `/dashboard` without token and confirm redirect.
- With a valid admin token [manual setup], confirm protected layout renders.
- Build succeeds.

### Report template after completion

```
Phase 2 Report
- Admin scaffold files:
- Routes:
- Auth behavior:
- Dev server/build:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/00-source-reading-and-architecture-overview.md`, Phase 1 report, Phase 2 report, rồi thực hiện Phase 3 only. Build admin company verification screens and actions inside `/careergraph-admin`: verification queue, detail, document viewer, approve/reject/request-info dialogs, company block/unblock entry points. Đọc backend API DTOs đã tạo ở Phase 1 trước khi code. Enterprise UI, no marketing page. Chạy build/lint nếu có. Báo cáo theo template lưu ở careergraph-admin\docs\new-feature\report..
```