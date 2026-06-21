# Phase 5 Implementation Guide - Notification Integration

## Overview

Phase 5 completes the notification system for company verification and block events. HR users now receive realtime notifications when admins approve, reject, request additional information, block, or unblock their companies.

## How It Works

### 1. Admin Action → Notification Creation

When an admin approves/rejects/blocks a company:

```java
// AdminCompanyVerificationServiceImpl.java
public CompanyVerificationResponses.VerificationRequestDetailResponse approveRequest(
    String requestId, String adminAccountId, AdminVerificationDecisionRequest request) {
  
  CompanyVerificationRequest verificationRequest = markVerificationDecision(...);
  
  // This triggers notification after DB commit
  notificationService.onCompanyVerificationApproved(
    verificationRequest.getCompany(), 
    verificationRequest);
  
  return mapperSupport.toDetailResponse(verificationRequest);
}
```

### 2. Notification Dispatch

The `NotificationServiceImpl` handles the dispatch:

```java
// NotificationServiceImpl.java - called by admin service
@Override
public void onCompanyVerificationApproved(Company company, CompanyVerificationRequest request) {
  notifyCompanyAccount(
      company,
      NotificationType.COMPANY_VERIFICATION_APPROVED,
      "Thông tin công ty đã được phê duyệt",
      "Công ty của bạn đã được xác thực và có thể đăng tải công việc.",
      buildCompanyVerificationData(company, request, null, "/company/verification"));
}

// Helper method finds HR account for company
private void notifyCompanyAccount(Company company, NotificationType type, ...) {
  Optional<Account> companyAccountOpt = accountRepository.findByCompanyId(company.getId());
  if (companyAccountOpt.isEmpty()) return;
  
  createNotification(companyAccountOpt.get().getId(), type, title, body, data);
}

// Notification is saved and async push is registered
private void dispatchSocketPush(Notification saved) {
  Runnable task = () -> {
    socketNotificationPusher.pushToUser(userId, notificationDto);
  };
  
  // Ensures push only happens after DB transaction commits
  if (TransactionSynchronizationManager.isSynchronizationActive()) {
    TransactionSynchronizationManager.registerSynchronization(
      new TransactionSynchronization() {
        @Override
        public void afterCommit() {
          task.run();  // Called after DB commit succeeds
        }
      });
  }
}
```

### 3. Socket Push to RTC

After DB commit, `SocketNotificationPusher` posts to RTC:

```java
// SocketNotificationPusher.java
@Async("taskExecutor")
public void pushToUser(UUID userId, NotificationDto notification) {
  webClient.post()
      .uri(socketServerUrl + "/internal/notify")  // http://localhost:4000/internal/notify
      .header("x-internal-api-key", internalApiKey)
      .bodyValue(payload)
      .retrieve()
      .toBodilessEntity()
      .subscribe();  // Async - doesn't block
}
```

### 4. RTC Broadcasts to User

RTC receives the notification at `/internal/notify`:

```javascript
// careergraph-rtc/src/notify.js
function pushNotification(userId, notification) {
  if (!userId || !notification) return;
  
  // Emit to all connected sockets for this user
  notify.to(userRoom(userId)).emit("notification", notification);
  
  console.log(`[notify] emit notification user=${userId} type=${notification.type}`);
}
```

### 5. HR Frontend Receives Notification

The socket hook listens for events:

```typescript
// careergraph-hr/src/features/notifications/hooks/useNotifySocket.ts
socket.on("notification", (notification: NotificationPayload) => {
  onNotificationRef.current(notification);  // Update React state
  
  // Create browser notification if permission granted
  if (canUseBrowserNotifications() && Notification.permission === "granted") {
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: "/favicon.ico",
    });
    
    // Click navigates to company verification page
    browserNotification.onclick = () => {
      const navigatePath = toDataNavigatePath(notification);
      if (navigatePath) {
        window.location.assign(appendRefreshParams(navigatePath));
      }
    };
  }
});
```

### 6. HR Sees Notification in Dropdown

The `NotificationDropdown` displays the notification with proper icon and color:

```typescript
// careergraph-hr/src/features/notifications/components/NotificationDropdown.tsx

// Icon mapping for new types
const getNotificationTypeMeta = (type: string) => {
  switch (type) {
    case "COMPANY_VERIFICATION_APPROVED":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
      };
    case "COMPANY_BLOCKED":
      return {
        icon: <Lock className="h-4 w-4" />,
        iconClass: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
      };
    // ... more types
  }
};

// Navigation mapping
const getNavigatePath = (notification: NotificationItem): string | null => {
  switch (notification.type) {
    case "COMPANY_VERIFICATION_APPROVED":
    case "COMPANY_VERIFICATION_REJECTED":
    case "COMPANY_VERIFICATION_NEEDS_INFO":
    case "COMPANY_BLOCKED":
    case "COMPANY_UNBLOCKED": {
      return "/company/verification";
    }
  }
};
```

### 7. HR Clicks Notification

```typescript
const handleClickNotification = async (item: NotificationItem) => {
  // Mark as read
  if (!item.read) {
    await markAsRead(item.id);
  }
  
  // Navigate using stored path
  const nextPath = getNavigatePath(item);
  if (nextPath) {
    redirectWithRefresh(nextPath);  // Navigates to /company/verification
  }
};
```

## Notification Types & Payloads

### COMPANY_VERIFICATION_APPROVED
```json
{
  "id": "notif-123",
  "type": "COMPANY_VERIFICATION_APPROVED",
  "title": "Thông tin công ty đã được phê duyệt",
  "body": "Công ty của bạn đã được xác thực và có thể đăng tải công việc.",
  "data": {
    "companyId": "company-1",
    "verificationStatus": "APPROVED",
    "operationalStatus": "ACTIVE",
    "verificationRequestId": "request-1",
    "navigateTo": "/company/verification"
  },
  "read": false,
  "createdAt": "2026-06-21T10:30:00+07:00"
}
```

### COMPANY_VERIFICATION_REJECTED
```json
{
  "type": "COMPANY_VERIFICATION_REJECTED",
  "title": "Yêu cầu xác thực công ty bị từ chối",
  "body": "Yêu cầu xác thực công ty cần được cập nhật. Lý do: Tax code không hợp lệ.",
  "data": {
    "reason": "Tax code không hợp lệ",
    "navigateTo": "/company/verification"
  }
}
```

### COMPANY_BLOCKED
```json
{
  "type": "COMPANY_BLOCKED",
  "title": "Công ty đã bị khóa",
  "body": "Công ty của bạn đang bị khóa. Lý do: Violations of terms.",
  "data": {
    "reason": "Violations of terms",
    "navigateTo": "/company/verification"
  }
}
```

## Database Flow

1. Admin posts to `/admin/company-verification-requests/{id}/approve`
2. Backend saves verification request with `status = APPROVED`
3. Backend saves company with `verificationStatus = APPROVED`
4. Transaction commits
5. After-commit callback triggers `socketNotificationPusher.pushToUser()`
6. Notification is persisted in `notifications` table
7. Socket event delivered to connected HR clients
8. HR app updates notification dropdown UI
9. HR can click to navigate to verification page

## API Endpoints Involved

### Admin Actions (create notifications)
- `POST /admin/company-verification-requests/{id}/approve`
- `POST /admin/company-verification-requests/{id}/reject`
- `POST /admin/company-verification-requests/{id}/request-additional-info`
- `POST /admin/companies/{companyId}/block`
- `POST /admin/companies/{companyId}/unblock`

### HR Reads Notifications
- `GET /notifications` - list notifications
- `POST /notifications/{id}/read` - mark as read
- `POST /notifications/read-all` - mark all as read
- `GET /notifications/unread-count` - get unread count

### RTC Internal Endpoints
- `POST /internal/notify` - receive notification from backend
- `POST /internal/unread-counts` - update unread counts

## Configuration

Backend needs RTC connection configured:
```properties
socket.server.url=http://localhost:4000
socket.internal.api-key=dev-secret-change-in-prod
```

HR Frontend needs RTC URL:
```javascript
const NOTIFY_SOCKET_URL = import.meta.env.VITE_RTC_BASE_URL ?? "http://localhost:4000";
```

## Testing the Flow

### Manual Test Steps

1. **Start services**: API, RTC, HR app
2. **Fresh HR login** to HR app
3. **Admin creates verification** request (or use existing)
4. **Admin approves** request via admin panel
5. **Check HR app** - notification appears in dropdown within 1-2 seconds
6. **Verify notification**:
   - Green checkmark icon
   - Title: "Thông tin công ty đã được phê duyệt"
   - Body: "Công ty của bạn đã được xác thực..."
   - Badge shows "Mới"
7. **Click notification** → navigates to `/company/verification`
8. **Refresh page** → notification persists in `/notifications` API

### Admin Test Scenarios

- **Reject + Reason**: Blue alert icon, shows reason
- **Request Info + Note**: Amber alert icon, shows note  
- **Block + Reason**: Red lock icon, shows reason
- **Unblock + Note**: Green shield icon, shows note

## Troubleshooting

### Notification not appearing in dropdown

1. Check HR app console: `[notify socket][hr]` logs
2. Verify `/internal/notify` POST succeeds in RTC logs
3. Verify `TransactionSynchronizationManager` is active (should be in `@Transactional` methods)
4. Check that notification was saved to DB: `SELECT * FROM notifications WHERE recipient_id = ?`

### Navigation not working

1. Verify `navigateTo` is set in notification data
2. Check browser console for `toDataNavigatePath()` results
3. Verify `/company/verification` route exists in HR app

### Browser notification not showing

1. Check browser notification permission in browser settings
2. Verify `Notification.permission === "granted"`
3. Check if app tab is focused (browser notifications don't show when focused)

## Future Improvements

1. **Multi-HR Support**: Migrate to `company_memberships` table to notify multiple HR accounts
2. **Support Email Config**: Add env var for support email in notification text
3. **Document Upload**: Add file upload to verification form
4. **Notification Categories**: Group notifications by type in dropdown
5. **Notification Actions**: Add inline action buttons (e.g., "Go to verification" button)

## Related Files

**Backend**:
- `NotificationService.java` - interface
- `NotificationServiceImpl.java` - implementation (5 new methods)
- `AdminCompanyVerificationServiceImpl.java` - calls notification methods
- `SocketNotificationPusher.java` - async push to RTC

**RTC**:
- `src/notify.js` - socket delivery

**Frontend**:
- `useNotifySocket.ts` - socket event handling
- `NotificationDropdown.tsx` - UI display (updated for new types)
- `NotificationRealtimeBootstrap.tsx` - bootstrap socket connection

## Summary

Phase 5 implements a complete notification system that:
- Triggers when admins take verification/block actions
- Delivers notifications in realtime via WebSocket
- Persists notifications for later retrieval
- Displays with appropriate icons and Vietnamese text
- Routes users to company verification page on click
- Works with existing RTC infrastructure

All 5 notification types (APPROVED, REJECTED, NEEDS_INFO, BLOCKED, UNBLOCKED) are fully functional and tested.
