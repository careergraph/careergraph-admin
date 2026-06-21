import { Link } from "react-router-dom";
import type { VerificationRequestDetail } from "@/features/company-verification/types";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { SurfaceCard } from "@/shared/components/SurfaceCard";

type VerificationSummaryPanelProps = {
  detail: VerificationRequestDetail;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const detailRows = [
  { key: "taxCode", label: "Tax code" },
  { key: "legalRepresentativeName", label: "Legal representative" },
  { key: "businessEmail", label: "Business email" },
  { key: "website", label: "Website" },
] as const;

export function VerificationSummaryPanel({
  detail,
}: VerificationSummaryPanelProps) {
  return (
    <SurfaceCard>
      <div className="panel-title-row">
        <div>
          <p className="muted-label">Company snapshot</p>
          <h3>{detail.companyName}</h3>
        </div>
        <div className="stack-sm status-stack">
          <StatusBadge status={detail.verificationStatus} />
          <StatusBadge status={detail.operationalStatus} />
        </div>
      </div>

      <div className="description-list">
        {detailRows.map((row) => (
          <div key={row.key} className="description-row">
            <dt>{row.label}</dt>
            <dd>{detail[row.key] || "Not provided"}</dd>
          </div>
        ))}
        <div className="description-row">
          <dt>HR email</dt>
          <dd>{detail.hrEmail || "Not provided"}</dd>
        </div>
        <div className="description-row">
          <dt>Submitted</dt>
          <dd>{formatDateTime(detail.submittedAt)}</dd>
        </div>
        <div className="description-row">
          <dt>Reviewed</dt>
          <dd>{formatDateTime(detail.reviewedAt)}</dd>
        </div>
      </div>

      <div className="inline-actions">
        <Link
          className="inline-link"
          to={`/companies/${detail.companyId}?requestId=${detail.requestId}`}
          state={{ verificationDetail: detail }}
        >
          Open company control
        </Link>
      </div>
    </SurfaceCard>
  );
}
