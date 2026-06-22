import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { companyVerificationApi } from "@/features/company-verification/api/companyVerificationApi";
import type { QueueQuery, VerificationStatus } from "@/features/company-verification/types";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const queueStatuses: Array<{ label: string; value: VerificationStatus | "ALL" }> = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Chờ xét duyệt", value: "PENDING_REVIEW" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Cần bổ sung", value: "NEEDS_ADDITIONAL_INFO" },
];

const formatDate = (value: string | null) => {
  if (!value) return "Không có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getAgeLabel = (value: string | null) => {
  if (!value) return "—";
  const ageInHours = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60))
  );
  if (ageInHours < 24) return `${ageInHours}g`;
  return `${Math.floor(ageInHours / 24)}n`;
};

const inputSelectClass =
  "w-full min-h-[3rem] px-[0.95rem] py-[0.85rem] rounded-[0.95rem] " +
  "border border-[rgba(125,147,184,0.16)] bg-[rgba(6,13,25,0.55)] text-[#eff4ff] " +
  "outline-none transition-all duration-150 " +
  "focus:border-[rgba(130,177,255,0.65)] focus:shadow-[0_0_0_3px_rgba(67,114,240,0.18)]";

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
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Xác thực"
        title="Danh sách yêu cầu xác thực doanh nghiệp"
        description="Theo dõi hồ sơ đã nộp, kiểm tra tài liệu và xử lý từng yêu cầu theo đúng quy trình xét duyệt."
      />

      <section className="grid gap-4 grid-cols-[minmax(0,2.2fr)_minmax(280px,1fr)] max-[1100px]:grid-cols-1">
        <SurfaceCard>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 max-[900px]:flex-col">
              <div>
                <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                  Bộ lọc kiểm duyệt
                </p>
                <h3 className="text-lg font-bold mt-0.5">Tìm nhanh hồ sơ cần xử lý</h3>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-[minmax(0,1.8fr)_240px_auto] items-end max-[1200px]:grid-cols-1">
              <Input
                label="Tìm theo công ty, mã số thuế hoặc email HR"
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="VD: mã số thuế, tên công ty, hr@company.vn"
                value={draftQuery}
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-[#d9e2f1] text-[0.92rem] font-semibold">
                  Lọc trạng thái
                </span>
                <select
                  className={inputSelectClass}
                  onChange={(e) =>
                    setFilters((cur) => ({
                      ...cur,
                      page: 0,
                      status: e.target.value as VerificationStatus | "ALL",
                    }))
                  }
                  value={filters.status}
                >
                  {queueStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-3 max-[1200px]:justify-start max-[720px]:flex-col">
                <Button
                  className="min-w-[140px]"
                  onClick={() =>
                    setFilters((cur) => ({ ...cur, page: 0, query: draftQuery.trim() }))
                  }
                  type="button"
                >
                  <Search size={16} />
                  Tìm kiếm
                </Button>
                <Button
                  className="min-w-[160px]"
                  onClick={() => {
                    setDraftQuery("");
                    setFilters({ page: 0, size: 10, status: "PENDING_REVIEW", query: "" });
                  }}
                  type="button"
                  variant="ghost"
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[1rem] border border-[rgba(127,150,186,0.14)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[#aeb9ca]">
              <span>
                Trạng thái mặc định: <span className="font-semibold text-[#dbe4f4]">Chờ xét duyệt</span>
              </span>
              <span>
                Từ khóa hiện tại:{" "}
                <span className="font-semibold text-[#dbe4f4]">
                  {filters.query || "Chưa áp dụng"}
                </span>
              </span>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Tổng quan hàng đợi
              </p>
              <h3 className="text-lg font-bold mt-0.5">
                {page?.totalElements ?? 0} yêu cầu
              </h3>
            </div>
          </div>
          <p className="text-[#aeb9ca] text-sm">
            Ưu tiên xử lý các hồ sơ đang chờ xét duyệt, sau đó mở trang chi tiết để
            kiểm tra tài liệu và ghi nhận quyết định.
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard>
        {queueQuery.isLoading ? (
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="text-lg font-semibold">Đang tải hàng đợi xác thực...</h3>
            <p className="text-[#aeb9ca] text-sm">
              Đang lấy danh sách yêu cầu mới nhất từ API quản trị.
            </p>
          </div>
        ) : null}

        {queueQuery.isError ? (
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="text-lg font-semibold">Tải hàng đợi thất bại.</h3>
            <p className="text-[#aeb9ca] text-sm">
              Tải lại trang hoặc thử lại khi backend sẵn sàng.
            </p>
          </div>
        ) : null}

        {!queueQuery.isLoading && !queueQuery.isError && page && page.content.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto min-[721px]:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Công ty", "Mã số thuế", "Email HR", "Trạng thái", "Ngày nộp", "Tuổi", "Thao tác"].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-[0.95rem] px-3 text-left border-b border-[rgba(142,160,186,0.11)]
                            text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em] font-semibold"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {page.content.map((row) => (
                    <tr key={row.requestId} className="hover:bg-white/[0.02] transition-colors">
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
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-sm text-[#aeb9ca]">
                        {formatDate(row.submittedAt)}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-sm font-mono">
                        {getAgeLabel(row.submittedAt)}
                      </td>
                      <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                        <Link
                          className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
                          to={`/verification/${row.requestId}`}
                        >
                          Xem chi tiết <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 min-[721px]:hidden">
              {page.content.map((row) => (
                <div
                  key={row.requestId}
                  className="rounded-[1.1rem] border border-[rgba(127,150,186,0.14)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#dbe4f4] break-words">{row.companyName}</p>
                      <p className="mt-1 text-sm text-[#aeb9ca] break-all">
                        {row.hrEmail ?? "Chưa có email HR"}
                      </p>
                    </div>
                    <StatusBadge status={row.verificationStatus} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[#aeb9ca]">
                    <p>
                      Mã số thuế: <span className="font-medium text-[#dbe4f4]">{row.taxCode ?? "—"}</span>
                    </p>
                    <p>
                      Ngày nộp: <span className="font-medium text-[#dbe4f4]">{formatDate(row.submittedAt)}</span>
                    </p>
                    <p>
                      Tuổi hồ sơ: <span className="font-medium text-[#dbe4f4]">{getAgeLabel(row.submittedAt)}</span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <Link
                      className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
                      to={`/verification/${row.requestId}`}
                    >
                      Xem chi tiết <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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

        {!queueQuery.isLoading && !queueQuery.isError && page && page.content.length === 0 ? (
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="text-lg font-semibold">Không có yêu cầu nào khớp bộ lọc này.</h3>
            <p className="text-[#aeb9ca] text-sm">
              Điều chỉnh trạng thái hoặc từ khóa tìm kiếm để mở rộng phạm vi xét duyệt.
            </p>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}
