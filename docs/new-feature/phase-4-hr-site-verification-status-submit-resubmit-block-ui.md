# Phase 4 - HR Site Verification Status And Block UI

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 4: HR site verification status, submit/resubmit verification request, block UI when needed

### Goal

Expose company verification state to HR and gate job creation/major HR workflows.

### Files/modules likely affected

- `careergraph-hr/src/types/account.ts`
- `careergraph-hr/src/services/companyService.ts`
- `careergraph-hr/src/services/companyVerificationService.ts`
- `careergraph-hr/src/App.tsx`
- `careergraph-hr/src/layout/AppSidebar.tsx`
- `careergraph-hr/src/pages/Job/AddJob.tsx`
- `careergraph-hr/src/pages/Job/JobsGrid.tsx`
- New page: `careergraph-hr/src/pages/CompanyVerification/...`
- Shared banner/gate components.

### Detailed tasks

- Map new company fields from `/companies/me`.
- Add service for `/companies/me/verification`.
- Add `/company/verification` route.
- Add status banner to dashboard/layout.
- Add job creation gate:
  - unverified: show CTA to verification and required message.
  - blocked/suspended: disable primary HR actions and show support copy.
- Update sidebar/menu CTA if needed.
- Implement submit/resubmit form.
- Support document upload/attach using backend media flow.
- Add notification dropdown mapping for new types if visual metadata is type-based.

### Acceptance criteria

- HR sees correct verification status after login.
- `NOT_SUBMITTED`, `REJECTED`, `NEEDS_ADDITIONAL_INFO` show action CTA.
- `PENDING_REVIEW` blocks job creation with waiting copy.
- `APPROVED` allows job creation.
- `BLOCKED/SUSPENDED` disables major actions and shows clear support message.
- Form submit/resubmit works.

### Manual test checklist

- Login as fresh HR.
- Visit `/jobs/new`; confirm block message.
- Submit verification request.
- Confirm status becomes pending.
- Admin requests more info; HR sees note and can resubmit.
- Admin approves; HR can create job.
- Admin blocks; HR sees blocked banner and job actions disabled.

### Report template after completion

```
Phase 4 Report
- HR files changed:
- Verification UI:
- Job gating:
- Block UI:
- Build/test results:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/careergraph-admin-company-verification-plan.md` và reports Phase 1-4. Thực hiện Phase 5 only: hoàn thiện notification integration cho admin company verification/block events qua notification system hiện có. Đọc `NotificationServiceImpl`, `SocketNotificationPusher`, `careergraph-rtc/src/notify.js`, HR/client notification contexts/dropdowns trước khi sửa. Không tạo hệ thống notification mới. Thêm type metadata trên HR nếu cần, verify realtime push and REST unread. Báo cáo theo template.
```
