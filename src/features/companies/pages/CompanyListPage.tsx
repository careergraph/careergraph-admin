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
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const inputSelectClass =
  "w-full min-h-[3rem] px-[0.95rem] py-[0.85rem] rounded-[0.95rem] " +
  "border border-[rgba(125,147,184,0.16)] bg-[rgba(6,13,25,0.55)] text-[#eff4ff] " +
  "outline-none transition-all duration-150 " +
  "focus:border-[rgba(130,177,255,0.65)] focus:shadow-[0_0_0_3px_rgba(67,114,240,0.18)]";

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
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Quản lý"
        title="Tổng quan doanh nghiệp"
        description="Giám sát trạng thái xác thực, tình trạng vận hành và lịch sử xác thực của tất cả doanh nghiệp đã đăng ký."
      />

      <section className="grid gap-4 grid-cols-[minmax(0,2.2fr)_minmax(280px,1fr)] max-[1100px]:grid-cols-1">
        <SurfaceCard>
          <div className="flex items-end gap-3 flex-wrap max-[720px]:flex-col max-[720px]:items-stretch">
            <Input
              label="Tìm kiếm công ty"
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder="Tên công ty, mã số thuế hoặc email HR..."
              value={draftQuery}
            />
            <label className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-[#d9e2f1] text-[0.92rem] font-semibold">
                Trạng thái xác thực
              </span>
              <select
                className={inputSelectClass}
                onChange={(e) =>
                  setFilters((cur) => ({
                    ...cur,
                    page: 0,
                    verificationStatus: e.target.value || undefined,
                  }))
                }
                value={filters.verificationStatus ?? ""}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="NOT_SUBMITTED">Chưa nộp</option>
                <option value="PENDING_REVIEW">Chờ xét duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
                <option value="NEEDS_ADDITIONAL_INFO">Cần bổ sung</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-[#d9e2f1] text-[0.92rem] font-semibold">
                Trạng thái vận hành
              </span>
              <select
                className={inputSelectClass}
                onChange={(e) =>
                  setFilters((cur) => ({
                    ...cur,
                    page: 0,
                    operationalStatus: e.target.value || undefined,
                  }))
                }
                value={filters.operationalStatus ?? ""}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="SUSPENDED">Tạm dừng</option>
                <option value="BLOCKED">Đã khóa</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-3 max-[720px]:flex-col">
            <Button
              onClick={() =>
                setFilters((cur) => ({ ...cur, page: 0, query: draftQuery.trim() }))
              }
              type="button"
            >
              <Search size={16} />
              Tìm kiếm
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
              Đặt lại
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Tổng số công ty
              </p>
              <h3 className="text-2xl font-bold mt-1">{page?.totalElements ?? 0}</h3>
            </div>
          </div>
          <p className="text-[#aeb9ca] text-sm">
            Doanh nghiệp đã đăng ký và đang được giám sát. Nhấp vào một hàng để xem
            yêu cầu xác thực và điều khiển thực thi.
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard>
        <div className="overflow-x-auto">
          {companiesQuery.isLoading ? (
            <div className="grid place-items-center min-h-[220px] text-center gap-2">
              <h3 className="text-lg font-semibold">Đang tải danh sách công ty...</h3>
              <p className="text-[#aeb9ca] text-sm">Đang lấy dữ liệu từ backend.</p>
            </div>
          ) : null}

          {companiesQuery.isError ? (
            <div className="grid place-items-center min-h-[220px] text-center gap-2">
              <h3 className="text-lg font-semibold">Tải danh sách công ty thất bại.</h3>
              <p className="text-[#aeb9ca] text-sm">Vui lòng tải lại trang hoặc thử lại sau.</p>
            </div>
          ) : null}

          {!companiesQuery.isLoading && !companiesQuery.isError && page && page.content.length > 0 ? (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {[
                      "Công ty",
                      "Mã số thuế",
                      "Email HR",
                      "Xác thực",
                      "Vận hành",
                      "Ngày nộp",
                      "Yêu cầu",
                      "Thao tác",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-[0.95rem] px-3 text-left border-b border-[rgba(142,160,186,0.11)]
                          text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em] font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.content.map((row) => (
                    <tr key={row.companyId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] font-medium">
                        {row.companyName}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] font-mono text-sm">
                        {row.taxCode ?? "—"}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-[#aeb9ca] text-sm">
                        {row.hrEmail ?? "—"}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                        <StatusBadge status={row.verificationStatus} />
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                        <StatusBadge status={row.operationalStatus} />
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-sm text-[#aeb9ca]">
                        {formatDate(row.submittedAt)}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] font-mono text-sm">
                        {row.totalRequests}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                        <Link
                          className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
                          to={`/companies/${row.companyId}`}
                        >
                          Xem chi tiết <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between gap-3 mt-4 max-[720px]:flex-col max-[720px]:items-stretch">
                <p className="text-[#aeb9ca] text-sm">
                  Trang {page.number + 1} / {Math.max(1, page.totalPages)}
                </p>
                <div className="flex flex-wrap gap-3 max-[720px]:flex-col">
                  <Button
                    disabled={page.number === 0}
                    onClick={() =>
                      setFilters((cur) => ({
                        ...cur,
                        page: Math.max(0, (cur.page ?? 0) - 1),
                      }))
                    }
                    type="button"
                    variant="secondary"
                  >
                    Trang trước
                  </Button>
                  <Button
                    disabled={page.number + 1 >= page.totalPages}
                    onClick={() =>
                      setFilters((cur) => ({ ...cur, page: (cur.page ?? 0) + 1 }))
                    }
                    type="button"
                    variant="secondary"
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {!companiesQuery.isLoading &&
          !companiesQuery.isError &&
          page &&
          page.content.length === 0 ? (
            <div className="grid place-items-center min-h-[220px] text-center gap-2">
              <h3 className="text-lg font-semibold">Không tìm thấy công ty nào.</h3>
              <p className="text-[#aeb9ca] text-sm">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}
