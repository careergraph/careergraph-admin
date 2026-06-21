# Phase 7 - Hardening, Tests, Validation, Production UX

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 7: Hardening, tests, validation, polish, production UX

### Goal

Stabilize the full admin verification/blocking workflow for production use.

### Files/modules likely affected

- All modules touched in previous phases.
- Tests under `careergraph-api/src/test/...`.
- Admin/HR/client UI tests if test framework exists [Chưa xác minh].
- Documentation.

### Detailed tasks

- Review authorization for all admin/HR endpoints.
- Add missing backend tests:
  - role enforcement
  - request status transitions
  - block/unblock
  - job create/publish/apply guards
  - notification creation
  - ES mapping/filter behavior where feasible.
- Validate frontend build and responsive layouts.
- Validate Vietnamese UX copy and error handling.
- Add operational runbook:
  - how to unblock
  - how to re-sync ES
  - how to inspect notification delivery.
- Add rollback plan docs.

### Acceptance criteria

- All critical tests/builds pass.
- Admin can process workflow reliably.
- HR sees correct status and cannot bypass UI/backend.
- Candidate cannot see/apply blocked company jobs.
- ES rollback behavior documented.

### Manual test checklist

- End-to-end fresh HR registration to approved company to job publish.
- Reject and resubmit flow.
- Needs-additional-info flow.
- Block/unblock flow.
- Notification realtime and persisted.
- Candidate direct apply attempt to blocked job.
- Admin role only access.

### Report template after completion

```
Phase 7 Final Report
- Overall status:
- Tests/builds:
- Security checks:
- UX checks:
- Remaining risks:
- Rollback instructions:
- Production readiness:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/careergraph-admin-company-verification-plan.md` và all phase reports. The main implementation should be complete. Perform a production readiness review only: inspect diffs, run tests/builds, identify bugs/risks with file references, and fix only small scoped issues explicitly needed for readiness. Do not introduce new major features.
```
