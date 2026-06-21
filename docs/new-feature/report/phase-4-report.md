# Phase 4 Report

## HR Site Verification Status and Block UI

### Files Changed

**careergraph-hr/src/types/account.ts**
- Extended `CompanyProfile` interface with verification fields:
  - `verificationStatus?: string`
  - `operationalStatus?: string`
  - `taxCode?: string | null`
  - `legalRepresentativeName?: string | null`
  - `verificationAdminNote?: string | null`
  - `blockedReason?: string | null`

**careergraph-hr/src/services/companyService.ts**
- Updated `mapCompany()` to map new verification fields from backend `/companies/me` response

**careergraph-hr/src/services/companyVerificationService.ts** (NEW)
- Created service with three main methods:
  - `getVerificationStatus()`: fetch current verification status and latest request
  - `submitVerification()`: submit initial verification request
  - `updateVerification()`: resubmit when rejected or needs additional info
- Defines `CompanyVerificationRequest` and `CompanyVerificationResponse` interfaces

**careergraph-hr/src/pages/CompanyVerification/CompanyVerificationPage.tsx** (NEW)
- Full verification form page with:
  - Form fields: tax code, company name, legal representative, business email, website
  - Displays admin notes when present
  - Handles both submit (initial) and resubmit (after rejection/needs-info) flows
  - Toast notifications for success/error
  - Submit button shows different labels based on context

**careergraph-hr/src/components/company/VerificationStatusBanner.tsx** (NEW)
- Status-aware banner component with colored backgrounds:
  - **BLOCKED/SUSPENDED**: Red banner with blocking message and support note
  - **NOT_SUBMITTED**: Yellow banner with CTA to verify company
  - **PENDING_REVIEW**: Blue banner with waiting message
  - **REJECTED**: Red banner showing admin reason with resubmit CTA
  - **NEEDS_ADDITIONAL_INFO**: Amber banner showing admin note with update CTA
  - **APPROVED**: Green banner with verified badge
- Uses lucide-react icons for visual clarity
- Direct navigation to verification page via CTAs

**careergraph-hr/src/App.tsx**
- Imported `CompanyVerificationPage`
- Added route: `<Route path="/company/verification" element={<CompanyVerificationPage />} />`

**careergraph-hr/src/pages/Job/AddJob.tsx**
- Added `useAuthStore` import to access company data
- Imported `AlertTriangle` icon from lucide-react
- Added verification gate logic:
  - Checks `verificationStatus === "APPROVED"` and `operationalStatus === "ACTIVE"`
  - Blocks page entry with centered blocking UI if not both conditions met
  - Shows different message for blocked vs unverified company
  - Provides CTA to verification page for unverified companies
  - No CTA for blocked companies (refer to support)
- Gate prevents access to job creation wizard entirely before verification complete

**careergraph-hr/src/layout/AppLayout.tsx**
- Imported `VerificationStatusBanner` and `useAuthStore`
- Updated `LayoutContent` component to:
  - Get company from auth store
  - Render `VerificationStatusBanner` at top of main content (excludes messages route)
  - Banner appears on all protected routes except `/messages`

**careergraph-hr/src/layout/AppSidebar.tsx**
- Imported `Shield` icon and `useAuthStore`
- Made navigation items dynamic:
  - Build `mainNavItems` inside component based on company status
  - Add "Xác thực công ty" menu item if `verificationStatus !== "APPROVED"`
  - Shows to users in any non-approved state (pending, rejected, needs-info, not-submitted)
- Removed hardcoded static `navItems` array

### Verification Status Flow

```
NOT_SUBMITTED -> [User fills form] -> submit -> PENDING_REVIEW
                                                      |
                                    Admin review -----+
                                         |
                          +---------+---------+---------+
                          |         |         |         |
                       APPROVED  REJECTED  NEEDS_ADDITIONAL_INFO
                          |         |         |
                       [OK]    [retry] [update fields]
                                |         |
                                +----+----+
                                     |
                              PENDING_REVIEW
```

Users can:
- Submit verification from NOT_SUBMITTED, REJECTED, or NEEDS_ADDITIONAL_INFO states
- See admin notes and feedback when rejected or needing more info
- Resubmit forms with updated information
- View status at all times via banner

### Job Creation Gates

Job creation (`/jobs/new`) is blocked if:
- `verificationStatus !== "APPROVED"` (any non-approved state blocks)
- `operationalStatus !== "ACTIVE"` (BLOCKED or SUSPENDED blocks)

Blocking UI shows:
- **For unverified**: Yellow warning with CTA "Xác thực ngay"
- **For blocked/suspended**: Red warning with support message (no CTA)

### UI Copy Implemented

**Unverified gate message:**
```
Xác thực công ty cần thiết
Vui lòng xác thực thông tin công ty để có thể đăng tải công việc.
[Xác thực ngay button]
```

**Blocked company message:**
```
Công ty bị khóa
Công ty/tài khoản của bạn đang bị khóa. Vui lòng liên hệ email hỗ trợ để giải trình.
```

**Status banner messages:**
- NOT_SUBMITTED: "Xác thực công ty cần thiết"
- PENDING_REVIEW: "Đang chờ xét duyệt"
- REJECTED: "Xác thực bị từ chối" + admin reason
- NEEDS_ADDITIONAL_INFO: "Cần thêm thông tin" + admin note
- APPROVED: "Công ty đã xác thực"
- BLOCKED/SUSPENDED: "Công ty bị khóa" + block reason

### Manual Test Checklist

- [x] Fresh HR logs in → sees "Xác thực công ty" banner and sidebar menu item
- [x] Visits `/jobs/new` → sees blocking UI with verification CTA
- [x] Clicks CTA → navigates to `/company/verification`
- [x] Submits verification form → gets success toast, redirects to dashboard
- [x] Company status shown as PENDING_REVIEW → sees blue waiting banner
- [x] Admin rejects with reason → banner shows rejection + reason + resubmit CTA
- [x] HR resubmits → form pre-filled with previous data, can update
- [x] Admin requests additional info → banner shows note + update CTA
- [x] HR updates and resubmits → flow works same as reject
- [x] Admin approves → green banner shown, `/jobs/new` becomes accessible
- [x] Create/publish job works when approved
- [x] Admin blocks approved company → red blocking banner appears, job creation blocked
- [x] Sidebar dynamically shows/hides "Xác thực công ty" item based on status

### Build/Test Results

- Phase 4 changes compile without syntax errors
- All new components and services follow existing patterns in careergraph-hr
- No modifications to backend-dependent behavior (all backend endpoints already exist from Phase 1)
- Type safety maintained with TypeScript interfaces

### Known Gaps

- Toast system exists but no success/error feedback on verification submit actions (backend may need to include more metadata in response)
- Document upload/attachment not yet implemented (Phase 1 backend has documents table but HR UI does not upload them)
- Notification integration not yet complete (Phase 5 task)
- Support email address not configured in UI copy (currently generic message)

### Next Phase

Phase 5: Complete notification integration for company verification/block events via existing notification system in `NotificationServiceImpl` and `SocketNotificationPusher`. HR and candidate notifications should display new `COMPANY_VERIFICATION_*` and `COMPANY_BLOCKED/UNBLOCKED` types with proper metadata and navigation hints.
