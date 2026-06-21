# Phase 0 - Source Reading And Architecture Plan

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 0: Source reading and architecture plan only

### Goal

Read relevant source code and create this architecture/implementation plan without implementing code.

### Files/modules likely affected

- `careergraph-admin-company-verification-plan.md`
- Source modules read from:
  - `careergraph-api`
  - `careergraph-rtc`
  - `careergraph-hr`
  - `careergraph-client`
  - `careergraph-admin`

### Detailed tasks

- Inspect current company/account/job/auth/security models.
- Inspect HR job creation and company profile hydration.
- Inspect client job listing/detail/apply flows.
- Inspect notification REST/socket flow.
- Inspect Elasticsearch document/index/search/sync flow.
- Identify gaps and propose architecture.
- Create markdown plan with source references and phased prompts.

### Acceptance criteria

- Plan file exists at `/00-source-reading-and-architecture-overview.md`.
- No product code is changed.
- Plan includes all requested sections.
- Each phase includes goal, files/modules, tasks, acceptance criteria, manual checklist, report template, and master prompt.

### Manual test checklist

- Confirm file exists.
- Confirm no code implementation changes were made.
- Confirm `careergraph-admin` was not scaffolded yet.

### Report template after completion

```
Phase 0 Report
- Plan file:
- Source read:
- Key verified findings:
- [Chưa xác minh] items:
- Code changes: none
- Next phase recommended:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer trong workspace CareerGraph. Hãy đọc `/ 00-source-reading-and-architecture-overview.md` trước, sau đó thực hiện Phase 1 only. Không scaffold admin site trong Phase 1. Đọc lại source backend liên quan trước khi sửa: Company, Account, Job, AuthServiceImpl, JobServiceImpl, ApplicationServiceImpl, NotificationServiceImpl, JobES/JobESService/ElasticsearchDataInitializer, SecurityUtils/SecurityConfig, repositories. Triển khai backend DB model, migration/init SQL nếu project dùng, enums, DTOs, repositories, core admin/HR verification APIs, guards tạo/publish job/apply job, notification type/service method stubs nếu thuộc Phase 1. Tôn trọng existing patterns, thêm tests backend phù hợp, chạy Maven tests liên quan. Báo cáo theo template lưu ở careergraph-admin\docs\new-feature\report. trong plan.
```
