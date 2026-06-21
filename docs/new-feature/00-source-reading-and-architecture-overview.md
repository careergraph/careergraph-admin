# 00 - Source Reading And Architecture Overview

This file contains the shared context for all phases. Attach this file together with the specific phase file when starting a new session.

# CareerGraph Admin Company Verification Plan

Created: 2026-06-21

Scope for this file: Phase 0 only. This plan is based on source reading. No implementation code is included.

## Source Reading Summary

### Repositories and files checked

- `careergraph-api`
  - `src/main/java/com/hcmute/careergraph/persistence/models/Company.java`
  - `src/main/java/com/hcmute/careergraph/persistence/models/Account.java`
  - `src/main/java/com/hcmute/careergraph/persistence/models/Job.java`
  - `src/main/java/com/hcmute/careergraph/enums/common/Role.java`
  - `src/main/java/com/hcmute/careergraph/enums/common/Status.java`
  - `src/main/java/com/hcmute/careergraph/controllers/AuthController.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/AuthServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/controllers/CompanyController.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/CompanyServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/mapper/CompanyMapper.java`
  - `src/main/java/com/hcmute/careergraph/persistence/dtos/response/CompanyResponse.java`
  - `src/main/java/com/hcmute/careergraph/controllers/JobController.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/JobServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/repositories/JobRepository.java`
  - `src/main/java/com/hcmute/careergraph/persistence/documents/JobES.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/JobESServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/config/app/ElasticsearchDataInitializer.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/ApplicationServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/enums/notification/NotificationType.java`
  - `src/main/java/com/hcmute/careergraph/persistence/models/Notification.java`
  - `src/main/java/com/hcmute/careergraph/services/NotificationService.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/NotificationServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/SocketNotificationPusher.java`
  - `src/main/java/com/hcmute/careergraph/controllers/NotificationController.java`
  - `src/main/java/com/hcmute/careergraph/config/security/SecurityConfig.java`
  - `src/main/java/com/hcmute/careergraph/helper/SecurityUtils.java`
  - `src/main/java/com/hcmute/careergraph/services/impl/JwtTokenServiceImpl.java`
  - `src/main/java/com/hcmute/careergraph/repositories/AccountRepository.java`
  - `src/main/java/com/hcmute/careergraph/repositories/CompanyRepository.java`
- `careergraph-rtc`
  - `src/index.js`
  - `src/auth.js`
  - `src/notify.js`
  - `src/internal-api.js`
- `careergraph-hr`
  - `src/App.tsx`
  - `src/services/jobService.ts`
  - `src/services/companyService.ts`
  - `src/types/account.ts`
  - `src/stores/authStore.ts`
  - `src/layout/AppSidebar.tsx`
  - `src/features/notifications/hooks/useNotifySocket.ts`
  - `src/features/notifications/api/notificationApi.ts`
  - `src/pages/Job/AddJob.tsx` was located and relevant call sites were inspected via `rg`; detailed full read is recommended before Phase 4.
- `careergraph-client`
  - `src/services/api/job.js`
  - `src/services/jobService.js`
  - `src/pages/Jobs.jsx`
  - `src/pages/JobDetail.jsx`
  - `src/sections/JobDetail/ApplyDialog.jsx`
  - `src/sections/Home/PopularJobsSection.jsx`
  - `src/sections/Home/PersonalJobsSection.jsx`
  - `src/sections/Job/JobsList.jsx`
  - `src/services/companyService.js`
  - `src/features/notifications/hooks/useNotifySocket.js`
  - `src/features/notifications/api/notificationApi.js`
- `careergraph-admin`
  - Directory exists but is currently empty.

## 1. Current System Analysis

### Backend hiện có gì?

- Auth:
  - `Role` already has `USER`, `ADMIN`, `HR`, `ASSISTANT`.
  - `AuthController` supports `/auth/register/candidate`, `/auth/register/hr`, `/auth/login`, Google login, OTP, refresh/logout.
  - `AuthServiceImpl.register(..., isHR=true)` creates an `Account` with `Role.HR` and creates a blank `Company` linked one-to-one to the account.
  - `JwtTokenServiceImpl` puts `role`, `candidateId`, `companyId`, `email`, and `type` into access tokens.
- Security:
  - `SecurityConfig` permits configured public endpoints and otherwise requires authentication. It does not currently enforce endpoint-level `ADMIN`/`HR` role rules with matchers.
  - `SecurityUtils.isAdmin()` exists and can be used in service/controller guards.
- Company:
  - `Company` extends `Party` and stores profile fields: `name`, `website`, `ceoName`, `description`, `size`, `noOfMembers`, `yearFounded`, company recruitment stage flags, account, jobs, connections, recruitment stages.
  - No explicit fields for verification status, tax code, legal representative separate from `ceoName`, verification document files, block/suspension reason, or admin review audit were found.
  - `CompanyController` has `/companies/me`, `/companies/me/profile`, `/companies/{companyId}`, follow endpoints, and `/companies/{companyId}/jobs`.
  - `CompanyMapper` and `CompanyResponse` expose profile/account data but not verification/block fields.
- Job:
  - `Job` has `status` using broad `Status` enum. `JobMapper.toEntity` sets `Status.DRAFT`; `Job.prePersist` also sets `DRAFT`.
  - `JobController` exposes HR job create/update/publish/delete/settings, candidate job list/search/detail/popular/personalized/category/similar/apply.
  - `JobServiceImpl.createJob` only validates company exists. It does not check company verification/block status.
  - `JobServiceImpl.publishJob`, `activateJob`, `updateJobSettings`, and `syncJobSearchDocument` also do not check company verification/block status.
- Application:
  - `ApplicationServiceImpl.createApplication` validates candidate, job, `job.status == ACTIVE`, expiry date, duplicate/reapply rule. It does not check company block/suspension.

### HR site hiện có gì?

- React 19 + TypeScript + Vite + Zustand + React Router + Tailwind-like styling.
- Routes are in `careergraph-hr/src/App.tsx`; protected app routes include `/dashboard`, `/profile`, `/jobs`, `/jobs/new`, `/messages`, interviews, calendar, candidates, pipeline.
- Auth state:
  - `authStore.ts` persists `accessToken`, `user`, `company`.
  - `RequireAuth` hydrates company via `/companies/me`.
  - `companyService.getMyCompany` maps company profile fields.
- Job management:
  - `jobService.createDraft` posts `/jobs`.
  - `jobService.publishJob` calls `/jobs/{id}/publish`.
  - `jobService.searchJobs` calls `/jobs/search` with company context.
  - `AddJob.tsx` orchestrates multi-step draft/recruitment/publish.
  - Sidebar has menu item `Công việc` linking to `/jobs`; there is no company verification menu/screen.
- Notifications:
  - `useNotifySocket.ts` connects to `${VITE_RTC_BASE_URL}/notify` with JWT.
  - `notificationApi.ts` calls `/notifications`, `/notifications/{id}/read`, `/notifications/read-all`, `/notifications/unread-count`.
  - Existing notification dropdown can consume `type`, `title`, `body`, `data.navigateTo`.

### Client site hiện có gì?

- React/Vite JS app.
- Job APIs:
  - `JobAPI.getJobs` calls public `/jobs`.
  - `JobAPI.searchJobs` calls `/jobs/search` with `auth: true`.
  - `JobAPI.getPopularJobs`, `getPersonalizedJobs`, `getJobDetail`, `getJobsByCompany`, `getSimilarJobs`, `applyToJob`.
- Job listing:
  - `Jobs.jsx` drives filters and passes into `JobsList`.
  - `JobsList.jsx` uses `JobService.searchJobs`.
  - Home sections use popular and personalized job endpoints.
- Job detail/apply:
  - `JobDetail.jsx` loads job detail, company jobs, company detail, similar jobs.
  - Apply button is disabled only for already-applied or expired jobs.
  - `ApplyDialog.jsx` submits `/jobs/{id}/application`; no company block check in UI.
- Notifications:
  - Same `/notify` socket pattern and `/notifications` REST API as HR.

### RTC/notification hiện có gì?

- API side:
  - `Notification` table stores recipient `Account`, `NotificationType`, `title`, `body`, JSON `data`, `read`, `readAt`.
  - `NotificationServiceImpl.createNotification` persists and calls `SocketNotificationPusher`.
  - `SocketNotificationPusher` POSTs to RTC internal endpoints `/internal/notify` and `/internal/unread-counts` with `x-internal-api-key`.
- RTC side:
  - `notify.js` creates `/notify` namespace, authenticates socket with JWT, joins `user:{userId}`, emits `notification` and `unread-counts`.
  - `internal-api.js` exposes `/internal/notify`, `/internal/notify/bulk`, `/internal/unread-counts`.
  - `auth.js` treats `HR`, `ADMIN`, and `ENTERPRISE` as host roles for interview-room gating.
- Existing notification types are application/interview/message/AI-screening oriented. No company verification/block notification type exists yet.

### Search job/Elasticsearch hiện đang hoạt động thế nào?

- `JobES` document index: `jobs_es`.
- Current fields include `id`, `title`, `description`, `status`, `jobCategory`, `employmentType`, `experienceLevel`, `education`, `state`, `provinceSlug`, `provinceCode`, `city`, `companyId`, qualifications, responsibilities, skills, `createdAt`, `contentHash`, `embedding`.
- `JobServiceImpl.syncJobSearchDocument` deletes ES document when job is not `ACTIVE`; otherwise it indexes an `ACTIVE` job.
- `ElasticsearchDataInitializer.shouldIndexJob` returns `job.status == ACTIVE`; it removes stale documents not in the active DB set.
- `JobESServiceImpl` supports:
  - `searchJobsByNavtiveAndFuzzy(keyword, pageable)` for personalized search.
  - `filterOnlySearch(filter, partyId, pageable, type)`.
  - `knnSearch(...)` with filters.
  - `searchRecommendJobsFromNewlyPosted(...)` for daily digest.
- Search filters currently do not filter company verification/block fields because those fields do not exist.

## 2. Gap Analysis

- No company verification data model:
  - Missing verification status enum.
  - Missing tax code, legal representative, business email/website snapshot, documents, submitted/reviewed timestamps, admin notes.
  - Missing status history/audit.
- No company block/suspension model:
  - `Status` enum has `BLOCKED`, `SUSPENDED`, `LOCKED`, but `Company` does not have a status field in the read entity. `Party` may contain shared status fields [Chưa xác minh: `Party.java` was not fully read in this phase].
  - Need explicit company-level block state even if reusing `Status`.
- No admin APIs/controllers.
- Admin site folder is empty.
- HR site has no verification status UI, verification submission form, resubmission flow, or block banner.
- Candidate site does not handle blocked-company job visibility/detail/apply.
- Backend does not enforce:
  - HR cannot create/publish/activate jobs unless company is verified and not blocked.
  - Candidate cannot apply to jobs from blocked companies.
  - Candidate search/list/detail excludes/handles blocked companies.
- Notification types do not include company verification/block events.
- Elasticsearch index does not include company block/verification/searchable flags.
- Existing one-to-one `Account` to `Company` works for current single-HR model, but future multiple HR requires new relationship design.

## 3. Proposed Database Changes

### Preferred approach

Add explicit company verification and company status fields/tables. Keep job status independent to avoid destructive changes to jobs during verification/block events.

### Enums

Add backend enums:

- `CompanyVerificationStatus`
  - `NOT_SUBMITTED`
  - `PENDING_REVIEW`
  - `APPROVED`
  - `REJECTED`
  - `NEEDS_ADDITIONAL_INFO`
- `CompanyOperationalStatus`
  - `ACTIVE`
  - `SUSPENDED`
  - `BLOCKED`

Reason: avoid overloading broad `Status` enum whose values are shared by jobs/applications/messaging and have mixed semantics.

### `companies` table additions

- `verification_status varchar(50) not null default 'NOT_SUBMITTED'`
- `operational_status varchar(50) not null default 'ACTIVE'`
- `tax_code varchar(50) null`
- `legal_representative_name varchar(255) null`
- `verification_business_email varchar(255) null`
- `verification_website varchar(500) null`
- `verification_submitted_at timestamp null`
- `verification_reviewed_at timestamp null`
- `verification_reviewed_by_account_id uuid/null FK accounts(id)`
- `verification_admin_note text null`
- `block_reason text null`
- `blocked_at timestamp null`
- `blocked_by_account_id uuid/null FK accounts(id)`
- `unblocked_at timestamp null`
- `unblocked_by_account_id uuid/null FK accounts(id)`

### `company_verification_requests` table

Purpose: preserve resubmission/audit history instead of overwriting fields only on `companies`.

Fields:

- `id`
- `company_id`
- `status`
- `tax_code`
- `company_name`
- `legal_representative_name`
- `business_email`
- `website`
- `submitted_by_account_id`
- `submitted_at`
- `reviewed_by_account_id`
- `reviewed_at`
- `admin_note`
- `created_date`, `last_modified_date`, inherited if using `BaseEntity`

### `company_verification_documents` table

Purpose: link uploaded verification documents to a request.

Fields:

- `id`
- `verification_request_id`
- `file_id` or `url`
- `document_type`
- `original_file_name`
- `mime_type`
- `created_date`

Preferred: reference existing `File` model if media/file system supports generic business documents. [Chưa xác minh: exact `File.java` and `MediaController` file-type constraints were not fully read in this phase.]

### Future multiple HR support

Current model is `Account.company @OneToOne` and `Company.account @OneToOne`. For future multiple HR:

- Short-term: keep current one-to-one to reduce risk.
- New extensible table proposal:
  - `company_memberships`
    - `id`
    - `company_id`
    - `account_id`
    - `role` (`OWNER`, `HR_MANAGER`, `HR_MEMBER`)
    - `status` (`ACTIVE`, `INVITED`, `DISABLED`)
    - `created_date`
- Add repository/service methods that resolve company HR accounts through current `AccountRepository.findByCompanyId` first, then can migrate to memberships later.
- Avoid naming APIs `ownerOnly` unless they truly need owner permission.

## 4. Proposed Backend APIs

Base prefix suggestion: `/admin/companies` for admin and `/companies/me/verification` for HR.

### Admin auth

Use existing `/auth/login` with `role: "ADMIN"` unless separate admin login is required later.

Add:

- `GET /admin/me`
  - Returns current admin profile and role.
  - Guard: `Role.ADMIN`.

### Admin dashboard

- `GET /admin/dashboard/summary`
  - Counts: pending verification requests, approved companies, rejected/needs-info, blocked companies, active jobs, new HR registrations.

### Admin company verification

- `GET /admin/company-verification-requests`
  - Params: `status`, `query`, `page`, `size`, `sort`.
  - Returns request list with company summary, HR account email, submitted date, status.
- `GET /admin/company-verification-requests/{requestId}`
  - Returns full request details, company profile, documents, current company status, HR accounts.
- `POST /admin/company-verification-requests/{requestId}/approve`
  - Body: `{ note?: string }`
  - Sets request and company status to `APPROVED`.
- `POST /admin/company-verification-requests/{requestId}/reject`
  - Body: `{ reason: string }`
  - Sets status to `REJECTED`.
- `POST /admin/company-verification-requests/{requestId}/request-additional-info`
  - Body: `{ reason: string }`
  - Sets status to `NEEDS_ADDITIONAL_INFO`.

### Admin company block/unblock

- `POST /admin/companies/{companyId}/block`
  - Body: `{ reason: string }`
  - Sets `operationalStatus = BLOCKED`.
- `POST /admin/companies/{companyId}/unblock`
  - Body: `{ note?: string }`
  - Sets `operationalStatus = ACTIVE`, preserves audit fields.
- `GET /admin/companies/{companyId}`
  - Company details with verification history, jobs, HR members/accounts.
- `GET /admin/companies/{companyId}/hr-accounts`
  - Current: returns single account from `AccountRepository.findByCompanyId`.
  - Future: returns memberships.

### HR verification APIs

- `GET /companies/me/verification`
  - Returns current company verification status, latest request, admin note, document list.
- `POST /companies/me/verification`
  - Creates initial request when `NOT_SUBMITTED`, `REJECTED`, or `NEEDS_ADDITIONAL_INFO`.
  - Body can include tax code, company name, legal representative, email/website, document IDs/URLs.
- `PUT /companies/me/verification/{requestId}`
  - Update/resubmit if latest request is `NEEDS_ADDITIONAL_INFO` or `REJECTED`.
- `POST /companies/me/verification/{requestId}/documents`
  - If current media system supports multipart upload for company documents; otherwise use media upload endpoint then attach file IDs.

### Backend guards needed

- `JobServiceImpl.createJob`: reject if company not `APPROVED` or `operationalStatus != ACTIVE`.
- `JobServiceImpl.publishJob`, `activateJob`, `updateJobSettings` with `status=ACTIVE`: same guard.
- `ApplicationServiceImpl.validateJobIsAcceptingApplications`: reject if job company is blocked/suspended or not searchable.
- `JobController.getJobById`: allow detail for ACTIVE job, but for blocked company return 403/410 for candidates/anonymous and allow owner/admin.
- `JobRepository` active public queries: filter company operational status and verification status.

## 5. Proposed Notification Flow

Reuse existing notification system.

### New notification types

Add to `NotificationType`:

- `COMPANY_VERIFICATION_APPROVED`
- `COMPANY_VERIFICATION_REJECTED`
- `COMPANY_VERIFICATION_NEEDS_INFO`
- `COMPANY_BLOCKED`
- `COMPANY_UNBLOCKED`

### Backend service extension

Add methods to `NotificationService`:

- `onCompanyVerificationApproved(Company company, CompanyVerificationRequest request)`
- `onCompanyVerificationRejected(Company company, CompanyVerificationRequest request, String reason)`
- `onCompanyVerificationNeedsInfo(Company company, CompanyVerificationRequest request, String reason)`
- `onCompanyBlocked(Company company, String reason)`
- `onCompanyUnblocked(Company company, String note)`

Recipient resolution:

- Current: `AccountRepository.findByCompanyId(company.getId())`.
- Future: `CompanyMembershipRepository.findActiveHrAccountIds(companyId)`.

Payload `data`:

- `companyId`
- `verificationRequestId`
- `verificationStatus`
- `operationalStatus`
- `reason`
- `navigateTo`: HR route such as `/company/verification` or `/dashboard?companyStatus=blocked`

Socket delivery:

- No RTC code change required for basic delivery because RTC emits generic notification payloads.
- Frontend notification dropdowns should map these new types to suitable icons/messages if needed.

## 6. Proposed Elasticsearch/Search Handling

### Decision

Do not delete job documents solely because a company is blocked. Instead, add searchable control fields and filter them in all search paths.

### Why

- Safer rollback: unblocking a company only flips fields and/or re-syncs company job docs.
- Avoids destructive ES state changes where reindex could fail due to embedding provider/rate limits.
- Lets admin/debug searches reason about why a job is hidden.
- Keeps job status unchanged; a blocked company is an overlay policy, not a job lifecycle mutation.

### Proposed `JobES` fields

- `companyVerificationStatus` keyword
- `companyOperationalStatus` keyword
- `companyBlocked` boolean
- `jobSearchable` boolean

### Indexing rules

`jobSearchable = job.status == ACTIVE && company.verificationStatus == APPROVED && company.operationalStatus == ACTIVE`

For public/candidate search:

- Always filter `jobSearchable == true`.
- Also filter `status == ACTIVE` for defense in depth.

For HR company search:

- If HR is searching own jobs, do not require `jobSearchable == true`; they should see their own draft/inactive jobs.
- Keep existing company JPA search for HR unless ES search is introduced for HR-owned jobs.

For admin:

- Admin APIs can query DB first; admin ES search is optional.

### Sync triggers

- On company approve/reject/needs-info/block/unblock:
  - Re-sync all jobs for that company to update ES fields.
  - For blocked companies, leave docs in ES with `jobSearchable=false`.
- Existing `ElasticsearchDataInitializer` currently deletes stale documents not active. It should be updated so active jobs from non-searchable companies remain indexed with `jobSearchable=false` if this approach is used.
- If keeping old active-only behavior temporarily, block action may delete docs as a compatibility fallback, but target production approach is non-destructive field filtering.

### Backend fallback

Even with ES filters, `JobRepository` and application/detail endpoints must enforce company status because UI and ES are not security boundaries.

## 7. Proposed HR Site Changes

### Data model/types

Extend `CompanyProfile` in `careergraph-hr/src/types/account.ts`:

- `verificationStatus`
- `operationalStatus`
- `taxCode`
- `legalRepresentativeName`
- `verificationAdminNote`
- `blockedReason`

Extend `companyService.mapCompany` to map new fields from `/companies/me`.

### Routes

Add route:

- `/company/verification`

Add service:

- `src/services/companyVerificationService.ts`

### UI changes

- Dashboard/top banner:
  - Show status badge:
    - `NOT_SUBMITTED`: CTA “Xác thực công ty”
    - `PENDING_REVIEW`: waiting state
    - `APPROVED`: verified badge
    - `REJECTED`: rejected reason + resubmit CTA
    - `NEEDS_ADDITIONAL_INFO`: admin note + update CTA
    - `BLOCKED/SUSPENDED`: blocking banner
- Jobs:
  - In `/jobs`, replace or block “Thêm công việc” entry/CTA if unverified.
  - `/jobs/new` route should display a verification gate before rendering `AddJob`.
  - When blocked, disable create/publish/update actions and show support contact.
- Verification form:
  - Tax code
  - Company name
  - Legal representative
  - Website/email
  - Document upload/attach
  - Submit/resubmit state
  - Admin note panel
- Notifications:
  - Existing `NotificationRealtimeBootstrap` and dropdown should display new notification types.

### UX copy

Required create-job warning:

`Vui lòng xác thực thông tin công ty để có thể đăng tải công việc.`

Blocked company warning:

`Công ty/tài khoản của bạn đang bị khóa. Vui lòng liên hệ email hỗ trợ để giải trình.`

Support email: `[Chưa xác minh]` because no configured support email was found in source reading.

## 8. Proposed Candidate Site Changes

### Listing/search/home

- Backend should exclude blocked/unverified companies from `/jobs`, `/jobs/search`, `/jobs/popular`, `/jobs/personalized`, `/jobs/category`, `/jobs/{jobId}/similar`, `/companies/{companyId}/jobs`.
- Candidate frontend should handle empty states normally.

### Job detail

- If direct access returns 403/410 or a job with `jobSearchable=false`, show:
  - `Công việc này hiện không khả dụng.`
- Disable apply button.

### Apply dialog

- Keep UI guard based on returned job availability if backend exposes it.
- Backend must still reject apply if company is blocked/unverified.
- Toast backend message for blocked job:
  - `Công việc này hiện không khả dụng.`

## 9. Proposed New Admin Site Architecture

Location: `/careergraph-admin`.

Recommended stack:

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Axios
- Zustand or lightweight context for auth
- Tailwind CSS
- Radix UI primitives where useful
- lucide-react icons
- Zod for form validation

Directory proposal:

- `src/app/App.tsx`
- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/config/env.ts`
- `src/lib/http.ts`
- `src/lib/authToken.ts`
- `src/features/auth`
  - `api/adminAuthApi.ts`
  - `pages/LoginPage.tsx`
  - `components/AdminAuthGuard.tsx`
- `src/features/dashboard`
- `src/features/company-verification`
  - `api/companyVerificationApi.ts`
  - `types.ts`
  - `pages/VerificationQueuePage.tsx`
  - `pages/VerificationDetailPage.tsx`
  - `components/VerificationStatusBadge.tsx`
  - `components/DecisionDialog.tsx`
  - `components/DocumentViewer.tsx`
- `src/features/companies`
  - `api/adminCompanyApi.ts`
  - `pages/CompanyDetailPage.tsx`
  - `components/CompanyBlockDialog.tsx`
  - `components/HrAccountsTable.tsx`
- `src/shared/components`
  - `AppShell`
  - `Sidebar`
  - `Topbar`
  - `DataTable`
  - `EmptyState`
  - `ConfirmDialog`
  - `StatusBadge`
- `src/shared/utils`

Enterprise UX principles:

- Quiet dense layout, not marketing style.
- First screen after login is operational dashboard, not a landing hero.
- Use tables, filters, status badges, detail drawers/modals, audit timeline.
- Avoid card-in-card layouts.
- Buttons use icons where obvious; text buttons for decisive commands.

## 10. UI/UX Screens For Admin Site

- Login
  - Email, password, role fixed to `ADMIN` in request body.
  - Error for non-admin account.
- Dashboard
  - Pending verification count
  - Blocked companies count
  - Recently submitted verification requests
  - SLA/aging buckets
- Verification Queue
  - Search by company name, tax code, HR email.
  - Filters: pending, needs info, rejected, approved.
  - Columns: company, tax code, HR email, status, submitted date, age, last admin action.
- Verification Detail
  - Company profile snapshot
  - Tax code
  - Legal representative
  - Website/email
  - Documents viewer/download
  - HR account panel
  - Admin note/history
  - Actions: approve, reject, request additional information, block company.
- Company Detail
  - Profile data
  - Operational status
  - Verification status
  - Jobs summary
  - HR accounts table
  - Block/unblock history
- Document Viewer
  - PDF/image preview if browser supported.
  - Download/open external for unsupported docs.
- Decision Dialogs
  - Approve note optional.
  - Reject reason required.
  - Request additional information reason required.
  - Block reason required.
  - Unblock note optional but recommended.

## 11. Security/Authorization Rules

- Admin APIs:
  - Must check `Role.ADMIN` server-side.
  - Do not rely only on frontend route guard.
- HR APIs:
  - `/companies/me/verification` requires `Role.HR` and valid `companyId`.
  - HR can only read/write latest request for own company.
  - HR cannot approve/reject/block.
- Candidate/public:
  - Cannot see blocked-company jobs in list/search.
  - Cannot apply to blocked-company jobs.
- Documents:
  - Admin can view verification documents.
  - Owning HR can view their own submitted documents.
  - Candidates/public cannot view verification documents.
- Audit:
  - Every admin action must store actor account id, timestamp, note/reason.
- Session/token:
  - Existing JWT includes role. If account role changes, refresh logic already detects role mismatch and invalidates family.
- Future multi-HR:
  - Avoid hardcoding single-account assumption in service method names.
  - Build recipient resolution behind a service abstraction.

## 13. Test Plan

### Backend unit/integration tests

- Auth/company defaults:
  - HR registration creates company with `NOT_SUBMITTED` and `ACTIVE`.
- Verification:
  - HR can submit.
  - HR cannot submit for another company.
  - Admin can approve/reject/request additional info.
  - Non-admin cannot call admin endpoints.
- Job gating:
  - Unverified company cannot create/publish/activate active job.
  - Approved active company can create/publish.
  - Blocked company cannot create/publish/activate.
- Candidate:
  - Blocked company jobs are not returned in public queries.
  - Apply is rejected for blocked company job.
- Notification:
  - Action creates correct `NotificationType`, payload, unread count.
- ES:
  - `JobES` mapping includes new fields.
  - Search filters include `jobSearchable=true`.
  - Company block triggers resync of company jobs.

### Frontend tests/manual validation

- Admin:
  - login guard
  - queue loading/empty/error states
  - approve/reject/request-info dialogs
  - document viewer
  - block/unblock dialogs
- HR:
  - status badge for all statuses
  - job create gate
  - verification submit/resubmit
  - blocked banner and disabled controls
  - notification clickthrough
- Candidate:
  - search/list hides blocked jobs
  - direct detail unavailable state
  - apply disabled or rejected with clear message

### End-to-end scenarios

1. Fresh HR signs up, company is not submitted, job creation blocked.
2. HR submits verification, admin requests additional info, HR resubmits, admin approves, job creation allowed.
3. Admin rejects, HR sees reason and can resubmit.
4. Admin blocks an approved company, candidate search hides jobs, direct apply fails, HR sees blocked banner.
5. Admin unblocks, ES sync restores jobs, HR receives notification.

## 14. Risk and Rollback Plan

### Risks

- Existing security config does not enforce roles globally; missing manual admin guard would expose admin APIs.
- Existing `Account` to `Company` is one-to-one; future multiple HR requires migration.
- Existing `JobServiceImpl.syncJobSearchDocument` deletes inactive jobs from ES. Changing ES behavior requires careful initializer update to avoid stale visibility bugs.
- ES reindex may depend on embedding services and can fail/rate-limit.
- Company block must be enforced in DB-backed APIs, not only ES/UI.
- Notification enum changes may require DB check constraint update if one exists. Source includes `init-scripts/2026-06-18-notification-type-check-hotfix.sql`; confirm current DB constraint before migration.
- File upload/document access permissions need special care. [Chưa xác minh: media/file authorization details were not fully read.]

### Rollback strategy

- DB:
  - Add nullable/defaulted columns with reversible migration.
  - Do not mutate existing job statuses during block/unblock.
- ES:
  - Prefer `jobSearchable=false` over deleting docs.
  - Keep a manual `/internal/elasticsearch/sync` path available.
  - On rollback, remove new filters only after backend guards are confirmed, or temporarily force DB fallback.
- Backend:
  - Feature flag possible:
    - `company.verification.enforcement.enabled`
    - `company.block.search-filter.enabled`
  - In emergency, disable frontend admin actions while keeping backend block guard.
- Frontend:
  - Admin site can be deployed independently.
  - HR verification UI can be hidden behind route/menu flag if backend not ready.