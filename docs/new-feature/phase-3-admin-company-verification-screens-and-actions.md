# Phase 3 - Admin Company Verification Screens And Actions

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 3: Admin company verification screens and actions

### Goal

Implement admin workflows for reviewing and acting on company verification requests.

### Files/modules likely affected

- `careergraph-admin/src/features/company-verification/...`
- `careergraph-admin/src/features/companies/...`
- Shared components: data table, status badge, dialogs, document viewer.

### Detailed tasks

- Implement verification queue with search/filter/pagination.
- Implement detail page:
  - company snapshot
  - tax code
  - legal representative
  - website/email
  - documents
  - HR account panel
  - audit/status timeline
- Implement actions:
  - approve
  - reject with required reason
  - request additional info with required reason
  - block company with required reason
  - unblock company if on company detail
- Add optimistic/refetch behavior after actions.
- Add error and loading states.
- Add role-safe copy and confirmation dialogs.

### Acceptance criteria

- Admin can process requests end-to-end.
- Required notes are enforced.
- UI refreshes after actions.
- Document links/previews work or fail gracefully.
- Build succeeds.

### Manual test checklist

- Load pending queue.
- Open a request.
- Preview/download documents.
- Approve request.
- Reject another request with reason.
- Request additional info.
- Block/unblock company.
- Verify notification rows were created for HR.

### Report template after completion

```
Phase 3 Report
- Screens added:
- API integration:
- Actions verified:
- Build/test results:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/careergraph-admin-company-verification-plan.md` và reports Phase 1-3. Thực hiện Phase 4 only trong `careergraph-hr`: hiển thị trạng thái xác thực, chặn tạo job khi chưa APPROVED hoặc công ty bị BLOCKED/SUSPENDED, thêm route/form gửi và bổ sung hồ sơ xác thực, CTA đúng copy yêu cầu. Đọc `careergraph-hr/src/App.tsx`, `services/companyService.ts`, `services/jobService.ts`, `pages/Job/AddJob.tsx`, `layout/AppSidebar.tsx`, auth store trước khi sửa. Backend guard đã có, nhưng UI phải rõ ràng. Chạy build/lint nếu khả thi. Báo cáo theo template.
```
