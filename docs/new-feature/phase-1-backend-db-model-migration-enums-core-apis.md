# Phase 1 - Backend DB Model, Migration, Enums, Core APIs

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 1: Backend DB model, migration, enums, core APIs

### Goal

Add backend foundation for company verification and blocking with server-side enforcement.

### Files/modules likely affected

- `careergraph-api/src/main/java/com/hcmute/careergraph/enums/...`
- `careergraph-api/src/main/java/com/hcmute/careergraph/persistence/models/Company.java`
- New models:
  - `CompanyVerificationRequest`
  - `CompanyVerificationDocument`
  - possibly `CompanyMembership`
- Repositories:
  - `CompanyVerificationRequestRepository`
  - `CompanyVerificationDocumentRepository`
- DTOs:
  - request/response DTOs for HR verification and admin decisions.
- Controllers:
  - `AdminCompanyController`
  - `CompanyVerificationController`
- Services:
  - `CompanyVerificationService`
  - `AdminCompanyService`
  - `CompanyAccessPolicyService`
- Existing:
  - `JobServiceImpl`
  - `ApplicationServiceImpl`
  - `CompanyMapper`
  - `CompanyResponse`
  - `NotificationType`
  - `NotificationService`
  - `NotificationServiceImpl`

### Detailed tasks

- Add enums for verification and operational status.
- Add company fields for verification/operational status.
- Add verification request and document entities.
- Add repository queries:
  - latest request by company
  - admin paginated request search
  - count by status
- Add service-level admin guard using `SecurityUtils.isAdmin()` or current account role.
- Add HR verification endpoints:
  - get status
  - submit
  - resubmit/update
- Add admin verification endpoints:
  - list/detail/approve/reject/request additional info
- Add block/unblock endpoints.
- Add policy guard:
  - `assertCompanyCanManageJobs(company)`
  - `assertJobAcceptingCandidateApplications(job)`
  - `isJobPubliclyAvailable(job)`
- Integrate guards into job create/publish/activate/settings and application create.
- Extend company response mapping with verification and operational status.
- Add notification enum values and backend notification methods.
- Add tests around:
  - unverified HR cannot create/publish active jobs
  - approved HR can create/publish
  - blocked company jobs cannot be applied to
  - admin approve/reject changes state

### Acceptance criteria

- HR register results in company `verificationStatus=NOT_SUBMITTED` and `operationalStatus=ACTIVE`.
- HR with unverified company cannot create/publish active jobs; API returns the required message.
- Admin can list and action verification requests.
- Admin can block/unblock company.
- Candidate apply is blocked for blocked company.
- Notification rows are created for approve/reject/needs-info/block/unblock.
- Tests pass.

### Manual test checklist

- Register HR, verify email, login.
- Call `/companies/me` and confirm verification fields.
- Try `POST /jobs`; expect rejection until approved.
- Submit verification request as HR.
- Login as admin and approve request.
- Retry job create/publish.
- Block company and confirm apply endpoint rejects.
- Unblock and confirm normal flow resumes.

### Report template after completion

```
Phase 1 Report
- Backend files changed:
- DB/model changes:
- New APIs:
- Guards added:
- Notification changes:
- Tests run:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/00-source-reading-and-architecture-overview.md` và Phase 1 report trước. Thực hiện Phase 2 only: scaffold `/careergraph-admin` bằng React + TypeScript + Vite theo kiến trúc enterprise trong plan. Không build verification screens chi tiết ở Phase 2; chỉ setup app foundation: routing, layout, auth login/admin guard, API client, env config, shared UI primitives, dashboard shell placeholder. Đọc `careergraph-hr/package.json`, `careergraph-hr/src/App.tsx`, `careergraph-hr/src/config/axiosConfig.ts` để reuse conventions where sensible. Sau khi scaffold, chạy install/build nếu dependencies sẵn; nếu cần network thì xin approval. Báo cáo theo template lưu ở careergraph-admin\docs\new-feature\report.
```
