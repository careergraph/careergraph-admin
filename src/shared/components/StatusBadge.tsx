import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  status: string;
};

const statusMap: Record<string, string> = {
  NOT_SUBMITTED:
    "bg-[rgba(145,161,187,0.14)] text-[#d9e2f1]",
  PENDING_REVIEW:
    "bg-[rgba(237,172,79,0.14)] text-[#ffd27f]",
  APPROVED:
    "bg-[rgba(80,201,140,0.15)] text-[#9ef0ba]",
  REJECTED:
    "bg-[rgba(231,104,122,0.16)] text-[#ff9dad]",
  NEEDS_ADDITIONAL_INFO:
    "bg-[rgba(84,170,255,0.16)] text-[#a8d0ff]",
  ACTIVE:
    "bg-[rgba(80,201,140,0.15)] text-[#9ef0ba]",
  SUSPENDED:
    "bg-[rgba(237,172,79,0.14)] text-[#ffd27f]",
  BLOCKED:
    "bg-[rgba(231,104,122,0.16)] text-[#ff9dad]",
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
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[0.76rem] font-bold tracking-[0.04em] uppercase whitespace-nowrap",
        statusMap[status] ?? "bg-[rgba(145,161,187,0.14)] text-[#d9e2f1]"
      )}
    >
      {labelMap[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
