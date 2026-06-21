import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { adminCompanyApi } from "@/features/companies/api/adminCompanyApi";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import type { AdminCompanyListQuery } from "@/features/companies/api/adminCompanyApi";

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export function CompanyListPage() {
  const [filters, setFilters] = useState<AdminCompanyListQuery>({
    page: 0,
    size: 10,
    verificationStatus: undefined,
    operationalStatus: undefined,
    query: "",
  });
  const [draftQuery, setDraftQuery] = useState("");

  const companiesQuery = useQuery({
    queryFn: () => adminCompanyApi.listCompanies(filters),
    queryKey: ["companies-list", filters],
  });

  const page = companiesQuery.data;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Management"
        title="Companies overview"
        description="Monitor company verification status, operational state, and verification history across all onboarded businesses."
      />

      <section className="filter-grid">
        <SurfaceCard>
          <div className="filter-toolbar">
            <Input
              label="Search company"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Company name, tax code, or HR email..."
              value={draftQuery}
            />
            <label className="field">
              <span className="field-label">Verification Status</span>
              <select
                className="select"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    page: 0,
                    verificationStatus: event.target.value || undefined,
                  }))
                }
                value={filters.verificationStatus || ""}
              >
                <option value="">All statuses</option>
                <option value="NOT_SUBMITTED">Not submitted</option>
                <option value="PENDING_REVIEW">Pending review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="NEEDS_ADDITIONAL_INFO">Needs info</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Operational Status</span>
              <select
                className="select"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    page: 0,
                    operationalStatus: event.target.value || undefined,
                  }))
                }
                value={filters.operationalStatus || ""}
              >
                <option value="">All states</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
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
              Search
            </Button>
            <Button
              onClick={() => {
                setDraftQuery("");
                setFilters({
                  page: 0,
                  size: 10,
                  verificationStatus: undefined,
                  operationalStatus: undefined,
                  query: "",
                });
              }}
              type="button"
              variant="ghost"
            >
              Reset
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Total companies</p>
              <h3>{page?.totalElements ?? 0}</h3>
            </div>
          </div>
          <p className="surface-copy">
            Companies registered and under monitoring. Click any row to view verification requests and
            control enforcement actions.
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard>
        <div className="table-shell">
          {companiesQuery.isLoading ? (
            <div className="empty-state">
              <h3>Loading companies...</h3>
              <p className="surface-copy">Fetching company list from backend.</p>
            </div>
          ) : null}

          {companiesQuery.isError ? (
            <div className="empty-state">
              <h3>Failed to load companies.</h3>
              <p className="surface-copy">Please refresh or try again later.</p>
            </div>
          ) : null}

          {!companiesQuery.isLoading && !companiesQuery.isError && page && page.content.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Tax Code</th>
                    <th>HR Email</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Requests</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {page.content.map((row) => (
                    <tr key={row.companyId}>
                      <td>{row.companyName}</td>
                      <td>{row.taxCode || "—"}</td>
                      <td>{row.hrEmail || "—"}</td>
                      <td>
                        <StatusBadge status={row.verificationStatus} />
                      </td>
                      <td>
                        <StatusBadge status={row.operationalStatus} />
                      </td>
                      <td>{formatDate(row.submittedAt)}</td>
                      <td className="mono-text">{row.totalRequests}</td>
                      <td>
                        <Link
                          className="inline-link"
                          to={`/companies/${row.companyId}`}
                        >
                          Open control <ArrowRight size={14} />
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

          {!companiesQuery.isLoading &&
          !companiesQuery.isError &&
          page &&
          page.content.length === 0 ? (
            <div className="empty-state">
              <h3>No companies found.</h3>
              <p className="surface-copy">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}
