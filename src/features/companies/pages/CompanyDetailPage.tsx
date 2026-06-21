import { useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Building2, Lock, ShieldAlert, Unlock } from "lucide-react";
import { companyVerificationApi } from "@/features/company-verification/api/companyVerificationApi";
import { DecisionDialog } from "@/features/company-verification/components/DecisionDialog";
import type { VerificationRequestDetail } from "@/features/company-verification/types";
import { adminCompanyApi } from "@/features/companies/api/adminCompanyApi";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";

const formatDateTime = (value: string | null) => {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export function CompanyDetailPage() {
  const { companyId = "" } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<"block" | "unblock" | null>(null);
  const requestId = searchParams.get("requestId") ?? "";
  const stateDetail = (
    location.state as { verificationDetail?: VerificationRequestDetail } | null
  )?.verificationDetail;

  const detailQuery = useQuery({
    enabled: Boolean(requestId),
    initialData: stateDetail,
    queryFn: () => companyVerificationApi.getDetail(requestId),
    queryKey: ["verification-detail", requestId],
  });

  const companyDetailQuery = useQuery({
    enabled: Boolean(companyId),
    queryFn: () => adminCompanyApi.getCompanyDetail(companyId),
    queryKey: ["company-detail", companyId],
  });

  const historyQuery = useQuery({
    queryFn: () => adminCompanyApi.getCompanyVerificationHistory(companyId),
    queryKey: ["company-verification-history", companyId],
  });

  const detail = detailQuery.data ?? companyDetailQuery.data;

  const companyMutation = useMutation({
    mutationFn: async (payload: { action: "block" | "unblock"; note: string }) =>
      payload.action === "block"
        ? adminCompanyApi.blockCompany(companyId, payload.note)
        : adminCompanyApi.unblockCompany(companyId, payload.note),
    onSuccess: async (updatedDetail) => {
      if (requestId) {
        queryClient.setQueryData(["verification-detail", requestId], updatedDetail);
      }
      queryClient.setQueryData(["company-detail", companyId], updatedDetail);
      await queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      await queryClient.invalidateQueries({ queryKey: ["companies-list"] });
      setActiveDialog(null);
    },
  });

  const timelineItems = useMemo(() => {
    if (!detail) return [];
    return [
      { label: "Ngày gửi xác thực", value: formatDateTime(detail.submittedAt) },
      { label: "Lần review gần nhất", value: formatDateTime(detail.reviewedAt) },
      { label: "Lý do khóa", value: detail.blockReason ?? "Không có lệnh khóa đang hiệu lực" },
      { label: "Ghi chú admin", value: detail.adminNote ?? "Chưa có ghi chú" },
    ];
  }, [detail]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Công ty"
        title={detail?.companyName ?? "Kiểm soát doanh nghiệp"}
        description="Điều khiển vận hành để khóa, mở khóa và xem bối cảnh xác thực mới nhất của doanh nghiệp."
      />

      <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Chế tài doanh nghiệp
              </p>
              <h3 className="text-lg font-bold mt-0.5">Trạng thái vận hành</h3>
            </div>
            <span
              className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]
                bg-[rgba(42,78,151,0.3)] text-[#cde0ff]"
            >
              <ShieldAlert size={18} />
            </span>
          </div>

          {detail ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={detail.operationalStatus} />
                <StatusBadge status={detail.verificationStatus} />
              </div>
              <p className="text-[#aeb9ca] text-sm">
                Mã công ty:{" "}
                <span className="font-mono text-[#eff4ff]">{companyId}</span>
              </p>
              <p className="text-[#aeb9ca] text-sm">
                Lý do khóa hiện tại:{" "}
                {detail.blockReason ?? "Không có trạng thái khóa"}
              </p>
              <div className="flex flex-wrap gap-3">
                {detail.operationalStatus === "BLOCKED" ? (
                  <Button onClick={() => setActiveDialog("unblock")} variant="secondary">
                    <Unlock size={16} />
                    Mở khóa công ty
                  </Button>
                ) : (
                  <Button variant="danger" onClick={() => setActiveDialog("block")}>
                    <Lock size={16} />
                    Khóa công ty
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid place-items-center min-h-[140px] text-center gap-2">
              <AlertTriangle size={18} className="text-[#ff9dad]" />
              <div>
                <h3 className="font-semibold">Chưa có ảnh chụp trạng thái công ty.</h3>
                <p className="text-[#aeb9ca] text-sm mt-1">
                  Hãy mở trang này từ một yêu cầu xác thực để nạp ngữ cảnh backend.
                </p>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Ảnh chụp mới nhất
              </p>
              <h3 className="text-lg font-bold mt-0.5">Tóm tắt công ty</h3>
            </div>
            <span
              className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]
                bg-[rgba(42,78,151,0.3)] text-[#cde0ff]"
            >
              <Building2 size={18} />
            </span>
          </div>

          {detail ? (
            <dl className="grid gap-3.5">
              {[
                { label: "Email HR", value: detail.hrEmail },
                { label: "Mã số thuế", value: detail.taxCode },
                { label: "Người đại diện pháp lý", value: detail.legalRepresentativeName },
                { label: "Email doanh nghiệp", value: detail.businessEmail },
                { label: "Website", value: detail.website },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(140px,180px)_minmax(0,1fr)] gap-4
                    pb-3 border-b border-[rgba(142,160,186,0.11)]
                    max-[720px]:grid-cols-1 max-[720px]:gap-1"
                >
                  <dt className="text-[#90a1bb] text-sm">{row.label}</dt>
                  <dd className="m-0 text-sm">{row.value ?? "Chưa cung cấp"}</dd>
                </div>
              ))}
            </dl>
          ) : detailQuery.isLoading || companyDetailQuery.isLoading ? (
            <div className="grid place-items-center min-h-[220px] text-center gap-2">
              <h3 className="font-semibold">Đang tải ảnh chụp công ty...</h3>
              <p className="text-[#aeb9ca] text-sm">
                Hệ thống đang nạp ngữ cảnh kiểm duyệt mới nhất.
              </p>
            </div>
          ) : detailQuery.isError && companyDetailQuery.isError ? (
            <div className="grid place-items-center min-h-[140px] text-center gap-2">
              <AlertTriangle size={18} className="text-[#ff9dad]" />
              <div>
                <h3 className="font-semibold">Không thể tải thông tin công ty.</h3>
                <p className="text-[#aeb9ca] text-sm mt-1">
                  Vui lòng tải lại trang hoặc mở lại từ danh sách công ty.
                </p>
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      </div>

      {detail ? (
        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Dòng thời gian kiểm duyệt
              </p>
              <h3 className="text-lg font-bold mt-0.5">Ngữ cảnh vận hành gần nhất</h3>
            </div>
          </div>
          <div className="grid gap-3.5">
            {timelineItems.map((item) => (
              <div key={item.label} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                <div
                  className="w-3 h-3 mt-1 rounded-full shrink-0
                    bg-gradient-to-br from-[#4372f0] to-[#1d9a8b]
                    shadow-[0_0_0_6px_rgba(67,114,240,0.12)]"
                />
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-[#aeb9ca] text-sm mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
              Lịch sử công ty
            </p>
            <h3 className="text-lg font-bold mt-0.5">Các yêu cầu xác thực</h3>
          </div>
        </div>

        {historyQuery.isLoading ? (
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="font-semibold">Đang tải lịch sử xác thực...</h3>
            <p className="text-[#aeb9ca] text-sm">
              Hệ thống đang lấy toàn bộ yêu cầu của công ty này.
            </p>
          </div>
        ) : historyQuery.isError ? (
          <div className="grid place-items-center min-h-[140px] text-center gap-2">
            <AlertTriangle size={18} className="text-[#ff9dad]" />
            <div>
              <h3 className="font-semibold">Tải lịch sử xác thực thất bại.</h3>
              <p className="text-[#aeb9ca] text-sm mt-1">
                Vui lòng thử lại hoặc làm mới trang sau ít phút.
              </p>
            </div>
          </div>
        ) : historyQuery.data && historyQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Ngày gửi", "Trạng thái", "Ghi chú admin", "Thao tác"].map((h) => (
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
                {historyQuery.data.map((request) => (
                  <tr key={request.requestId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-sm text-[#aeb9ca]">
                      {formatDateTime(request.submittedAt)}
                    </td>
                    <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                      <StatusBadge status={request.verificationStatus} />
                    </td>
                    <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)] text-sm text-[#aeb9ca]">
                      {request.adminNote ?? "—"}
                    </td>
                    <td className="py-[0.95rem] px-3 border-b border-[rgba(142,160,186,0.11)]">
                      <Link
                        className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
                        to={`/verification/${request.requestId}`}
                      >
                        Xem chi tiết <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="font-semibold">Chưa tìm thấy yêu cầu xác thực nào.</h3>
            <p className="text-[#aeb9ca] text-sm">
              Công ty này hiện chưa gửi bất kỳ yêu cầu xác thực nào.
            </p>
          </div>
        )}
      </SurfaceCard>

      <DecisionDialog
        confirmLabel="Xác nhận khóa"
        description="Khóa công ty sẽ ngay lập tức chặn các vận hành đã được duyệt. Backend yêu cầu bắt buộc phải có lý do."
        loading={companyMutation.isPending && activeDialog === "block"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          companyMutation.mutateAsync({ action: "block", note: value })
        }
        open={activeDialog === "block"}
        placeholder="Ghi rõ lý do chính sách hoặc tuân thủ khi khóa công ty này."
        title="Khóa công ty"
        tone="danger"
      />

      <DecisionDialog
        confirmLabel="Xác nhận mở khóa"
        description="Backend yêu cầu ghi chú mở khóa, hãy mô tả rõ lý do khôi phục doanh nghiệp."
        initialValue={detail?.adminNote ?? ""}
        loading={companyMutation.isPending && activeDialog === "unblock"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          companyMutation.mutateAsync({ action: "unblock", note: value })
        }
        open={activeDialog === "unblock"}
        placeholder="Ghi rõ vì sao công ty có thể được khôi phục về trạng thái ACTIVE."
        title="Mở khóa công ty"
      />
    </div>
  );
}
