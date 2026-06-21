# Phase 5 - Notification Integration

Attach 00-source-reading-and-architecture-overview.md with this file when a session needs broader system context.

## Phase 5: Notification integration through existing notification/socket flow

### Goal

Make HR receive realtime and persisted notifications for admin verification/block actions.

### Files/modules likely affected

- `careergraph-api/src/main/java/com/hcmute/careergraph/enums/notification/NotificationType.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/services/NotificationService.java`
- `careergraph-api/src/main/java/com/hcmute/careergraph/services/impl/NotificationServiceImpl.java`
- Admin verification/block services from Phase 1.
- `careergraph-hr/src/features/notifications/...`
- `careergraph-client/src/features/notifications/...` only if shared metadata requires update.
- `careergraph-rtc` likely unchanged.

### Detailed tasks

- Ensure all admin actions create notifications after DB commit.
- Ensure data payload has `navigateTo`.
- Ensure unread counts update.
- Add frontend type labels/icons for HR dropdown.
- Verify browser notification click routing.
- Add tests for notification creation.

### Acceptance criteria

- HR receives notification when:
  - approved
  - rejected
  - additional information requested
  - company blocked
  - company unblocked
- Notifications persist in `/notifications`.
- Realtime socket emits `notification` and `unread-counts`.

### Manual test checklist

- Keep HR app open.
- Admin approves/rejects/requests info/blocks/unblocks.
- Watch notification dropdown update without refresh.
- Refresh HR app and confirm notifications persist.
- Click notification and confirm correct route.

### Report template after completion

```
Phase 5 Report
- Notification backend changes:
- Frontend notification changes:
- RTC changes:
- Tests/manual verification:
- Known gaps:
- Next phase:
```

### Master Prompt for next phase

```
Bạn là senior full-stack engineer. Đọc `/00-source-reading-and-architecture-overview.md` và reports Phase 1-5. Thực hiện Phase 6 only: candidate job search/detail/apply blocking + Elasticsearch handling. Đọc `JobServiceImpl`, `JobRepository`, `JobES`, `JobESServiceImpl`, `ElasticsearchDataInitializer`, client `JobService`, `JobsList`, `JobDetail`, `ApplyDialog` trước khi sửa. Implement non-destructive ES fields/filter approach if Phase 1 did not finish it. Ensure backend blocks, UI only improves UX. Add tests where practical. Báo cáo theo template lưu ở careergraph-admin\docs\new-feature\report..
```
