type StatusBadgeProps = {
  status: string;
};

const statusMap: Record<string, string> = {
  NOT_SUBMITTED: "status-neutral",
  PENDING_REVIEW: "status-warning",
  APPROVED: "status-success",
  REJECTED: "status-danger",
  NEEDS_ADDITIONAL_INFO: "status-info",
  ACTIVE: "status-success",
  SUSPENDED: "status-warning",
  BLOCKED: "status-danger",
};

const labelMap: Record<string, string> = {
  NOT_SUBMITTED: "Chưa nộp",
  PENDING_REVIEW: "Chờ xét duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  NEEDS_ADDITIONAL_INFO: "Cần bổ sung",
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm dừng",
  BLOCKED: "Đã khóa",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${statusMap[status] ?? "status-neutral"}`}>
      {labelMap[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
