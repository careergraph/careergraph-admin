import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { companyVerificationApi } from "@/features/company-verification/api/companyVerificationApi";
import type {
  QueueQuery,
  VerificationStatus,
} from "@/features/company-verification/types";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const queueStatuses: Array<{ label: string; value: VerificationStatus | "ALL" }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Needs info", value: "NEEDS_ADDITIONAL_INFO" },
];

const formatDate = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getAgeLabel = (value: string | null) => {
  if (!value) {
    return "No SLA data";
  }

  const ageInHours = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60))
  );

  if (ageInHours < 24) {
    return `${ageInHours}h`;
  }

  return `${Math.floor(ageInHours / 24)}d`;
};

export function VerificationQueuePage() {
  const [filters, setFilters] = useState<QueueQuery>({
    page: 0,
    size: 10,
    status: "PENDING_REVIEW",
    query: "",
  });
  const [draftQuery, setDraftQuery] = useState("");

  const queueQuery = useQuery({
    queryFn: () => companyVerificationApi.getQueue(filters),
    queryKey: ["verification-queue", filters],
  });

  const page = queueQuery.data;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Verification"
        title="Company verification queue"
        description="Review submitted company verification requests, inspect evidence, and route each case through approval, rejection, or follow-up."
      />

      <section className="filter-grid">
        <SurfaceCard>
          <div className="filter-toolbar">
            <Input
              label="Search company, tax code, or HR email"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Example: tax code, company name, hr@company.vn"
              value={draftQuery}
            />
            <label className="field">
              <span className="field-label">Status filter</span>
              <select
                className="select"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    page: 0,
                    status: event.target.value as VerificationStatus | "ALL",
                  }))
                }
                value={filters.status}
              >
                {queueStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="inline-actions">
            <Button
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: 0,
                  query: draftQuery.trim(),
                }))
              }
              type="button"
            >
              <Search size={16} />
              Search queue
            </Button>
            <Button
              onClick={() => {
                setDraftQuery("");
                setFilters({
                  page: 0,
                  size: 10,
                  status: "PENDING_REVIEW",
                  query: "",
                });
              }}
              type="button"
              variant="ghost"
            >
              Reset filters
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Queue health</p>
              <h3>{page?.totalElements ?? 0} requests in scope</h3>
            </div>
          </div>
          <p className="surface-copy">
            Use the queue to triage pending review first, then pivot to detail
            pages for evidence review and enforcement actions.
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard>
        <div className="table-shell">
          {queueQuery.isLoading ? (
            <div className="empty-state">
              <h3>Loading verification queue...</h3>
              <p className="surface-copy">
                Pulling the latest requests from the admin review API.
              </p>
            </div>
          ) : null}

          {queueQuery.isError ? (
            <div className="empty-state">
              <h3>Queue failed to load.</h3>
              <p className="surface-copy">
                Refresh the page or retry the query once backend access is
                available again.
              </p>
            </div>
          ) : null}

          {!queueQuery.isLoading &&
          !queueQuery.isError &&
          page &&
          page.content.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Tax code</th>
                    <th>HR email</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Age</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {page.content.map((row) => (
                    <tr key={row.requestId}>
                      <td>{row.companyName}</td>
                      <td>{row.taxCode || "Not provided"}</td>
                      <td>{row.hrEmail || "Not provided"}</td>
                      <td>
                        <StatusBadge status={row.verificationStatus} />
                      </td>
                      <td>{formatDate(row.submittedAt)}</td>
                      <td>{getAgeLabel(row.submittedAt)}</td>
                      <td>
                        <Link
                          className="inline-link"
                          to={`/verification/${row.requestId}`}
                        >
                          Open detail <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination-row">
                <p className="surface-copy">
                  Page {page.number + 1} of {Math.max(1, page.totalPages)}
                </p>
                <div className="inline-actions">
                  <Button
                    disabled={page.number === 0}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: Math.max(0, (current.page ?? 0) - 1),
                      }))
                    }
                    type="button"
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={page.number + 1 >= page.totalPages}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: (current.page ?? 0) + 1,
                      }))
                    }
                    type="button"
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {!queueQuery.isLoading &&
          !queueQuery.isError &&
          page &&
          page.content.length === 0 ? (
            <div className="empty-state">
              <h3>No verification requests match this filter.</h3>
              <p className="surface-copy">
                Adjust the status or search query to widen the review scope.
              </p>
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}
