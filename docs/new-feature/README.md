# CareerGraph Admin Company Verification Docs

Split from the root plan so each future Codex session can attach only the context it needs.

Recommended attachment pattern:

1. Attach `00-source-reading-and-architecture-overview.md` for shared architecture context.
2. Attach the specific `phase-N-*.md` file for the phase being implemented.
3. After a phase finishes, keep its completion report near these files or paste it into the next session.

## Files

- `00-source-reading-and-architecture-overview.md`: source reading summary, current system analysis, gaps, architecture proposals, test/risk plan.
- `phase-0-source-reading-and-architecture-plan.md`: source reading and plan only.
- `phase-1-backend-db-model-migration-enums-core-apis.md`: backend DB model, enums, APIs, core guards.
- `phase-2-admin-site-setup-react-ts-routing-layout-auth-api-client.md`: admin React TS foundation.
- `phase-3-admin-company-verification-screens-and-actions.md`: admin verification queue/detail/actions.
- `phase-4-hr-site-verification-status-submit-resubmit-block-ui.md`: HR verification UI and job gating.
- `phase-5-notification-integration-existing-socket-flow.md`: notification integration through existing API/RTC flow.
- `phase-6-candidate-search-detail-apply-blocking-elasticsearch.md`: candidate visibility/apply blocking and ES handling.
- `phase-7-hardening-tests-validation-production-ux.md`: hardening, tests, validation, production polish.