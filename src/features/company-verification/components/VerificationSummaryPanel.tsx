import { Link } from "react-router-dom";
import type { VerificationRequestDetail } from "@/features/company-verification/types";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { SurfaceCard } from "@/shared/components/SurfaceCard";

type VerificationSummaryPanelProps = {
  detail: VerificationRequestDetail;
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Không có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const detailRows = [
  { key: "taxCode", label: "Mã số thuế" },
  { key: "legalRepresentativeName", label: "Người đại diện pháp lý" },
  { key: "businessEmail", label: "Email doanh nghiệp" },
  { key: "website", label: "Website" },
] as const;

export function VerificationSummaryPanel({ detail }: VerificationSummaryPanelProps) {
  return (
    <SurfaceCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
            Ảnh chụp công ty
          </p>
          <h3 className="text-lg font-bold mt-0.5">{detail.companyName}</h3>
        </div>
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          <StatusBadge status={detail.verificationStatus} />
          <StatusBadge status={detail.operationalStatus} />
        </div>
      </div>

      <dl className="grid gap-3.5">
        {detailRows.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[minmax(140px,180px)_minmax(0,1fr)] gap-4
              pb-3 border-b border-[rgba(142,160,186,0.11)]"
          >
            <dt className="text-[#90a1bb] text-sm">{row.label}</dt>
            <dd className="m-0 text-sm">{detail[row.key] ?? "Chưa cung cấp"}</dd>
          </div>
        ))}
        <div
          className="grid grid-cols-[minmax(140px,180px)_minmax(0,1fr)] gap-4
            pb-3 border-b border-[rgba(142,160,186,0.11)]"
        >
          <dt className="text-[#90a1bb] text-sm">Email HR</dt>
          <dd className="m-0 text-sm">{detail.hrEmail ?? "Chưa cung cấp"}</dd>
        </div>
        <div
          className="grid grid-cols-[minmax(140px,180px)_minmax(0,1fr)] gap-4
            pb-3 border-b border-[rgba(142,160,186,0.11)]
            max-[720px]:grid-cols-1 max-[720px]:gap-1"
        >
          <dt className="text-[#90a1bb] text-sm">Ngày nộp</dt>
          <dd className="m-0 text-sm">{formatDateTime(detail.submittedAt)}</dd>
        </div>
        <div
          className="grid grid-cols-[minmax(140px,180px)_minmax(0,1fr)] gap-4
            pb-3 border-b border-[rgba(142,160,186,0.11)]
            max-[720px]:grid-cols-1 max-[720px]:gap-1"
        >
          <dt className="text-[#90a1bb] text-sm">Ngày review</dt>
          <dd className="m-0 text-sm">{formatDateTime(detail.reviewedAt)}</dd>
        </div>
      </dl>

      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
          to={`/companies/${detail.companyId}?requestId=${detail.requestId}`}
          state={{ verificationDetail: detail }}
        >
          Mở kiểm soát công ty
        </Link>
      </div>
    </SurfaceCard>
  );
}
