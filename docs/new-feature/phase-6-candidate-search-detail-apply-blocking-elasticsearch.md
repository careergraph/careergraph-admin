# Phase 6 - Candidate Blocking And Elasticsearch Handling

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 6: Candidate job search/detail/apply blocking + Elasticsearch handling

### Goal

Make blocked/unverified companies invisible in candidate job discovery and impossible to apply to.

### Files/modules likely affected

- `careergraph-api/src/main/java/com/hcmute/careergraph/repositories/JobRepository.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/services/impl/JobServiceImpl.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/services/impl/ApplicationServiceImpl.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/persistence/documents/JobES.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/services/impl/JobESServiceImpl.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/config/app/ElasticsearchDataInitializer.java`
- `careergraph-client/src/services/jobService.js`
- `careergraph-client/src/pages/JobDetail.jsx`
- `careergraph-client/src/sections/JobDetail/ApplyDialog.jsx`

### Detailed tasks

- Add DB query filters for public candidate queries.
- Add backend policy check for job detail and apply.
- Add ES fields and filters:
  - `companyVerificationStatus`
  - `companyOperationalStatus`
  - `companyBlocked`
  - `jobSearchable`
- Update company action service to resync company jobs.
- Update client job detail to show “Công việc này hiện không khả dụng.” on unavailable status.
- Keep apply dialog defensive with backend error messages.

### Acceptance criteria

- Blocked company jobs do not appear in home/search/list/popular/personalized/similar/company jobs.
- Direct job detail is unavailable for candidates/anonymous but accessible to owner/admin if needed.
- Apply endpoint rejects blocked company jobs.
- Unblocking restores job visibility after ES sync.

### Manual test checklist

- Approve a company and publish active job.
- Confirm job appears in candidate search.
- Block company.
- Confirm job disappears from search/home/popular/personalized/company jobs.
- Open direct URL; see unavailable message or 403/410 UI.
- Try apply API; expect rejection.
- Unblock and re-sync; confirm job returns.

### Report template after completion

```
Phase 6 Report
- Search/backend changes:
- ES changes:
- Candidate UI changes:
- Tests/manual verification:
- Rollback notes:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/00-source-reading-and-architecture-overview.md` và reports Phase 1-6. Thực hiện Phase 7 only: hardening, tests, validation, polish, production UX. Audit backend authorization, race conditions, error messages, ES rollback behavior, admin/HR/candidate UX, responsive layout, and documentation. Run relevant Maven/frontend tests/builds. Fix scoped bugs only. Báo cáo final theo template.
```
