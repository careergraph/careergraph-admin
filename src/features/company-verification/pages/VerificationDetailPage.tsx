import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCheck,
  FileText,
  Info,
  ShieldBan,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { companyVerificationApi } from "@/features/company-verification/api/companyVerificationApi";
import { DecisionDialog } from "@/features/company-verification/components/DecisionDialog";
import { DocumentViewer } from "@/features/company-verification/components/DocumentViewer";
import { VerificationSummaryPanel } from "@/features/company-verification/components/VerificationSummaryPanel";
import type { VerificationDocument } from "@/features/company-verification/types";
import { adminCompanyApi } from "@/features/companies/api/adminCompanyApi";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";

const formatDateTime = (value: string | null) => {
  if (!value) return "Không có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

type ActiveDialog = "approve" | "reject" | "needs-info" | "block" | null;

export function VerificationDetailPage() {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [activeDocument, setActiveDocument] = useState<VerificationDocument | null>(null);

  const detailQuery = useQuery({
    queryFn: () => companyVerificationApi.getDetail(requestId),
    queryKey: ["verification-detail", requestId],
  });

  const detail = detailQuery.data;

  const decisionMutation = useMutation({
    mutationFn: async (payload: {
      action: Exclude<ActiveDialog, "block" | null>;
      note: string;
    }) => {
      if (payload.action === "approve")
        return companyVerificationApi.approve(requestId, { note: payload.note });
      if (payload.action === "reject")
        return companyVerificationApi.reject(requestId, { note: payload.note });
      return companyVerificationApi.requestAdditionalInfo(requestId, { note: payload.note });
    },
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["verification-detail", requestId], updatedDetail);
      await queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      setActiveDialog(null);
    },
  });

  const companyMutation = useMutation({
    mutationFn: async (reason: string) =>
      adminCompanyApi.blockCompany(detail?.companyId ?? "", reason),
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["verification-detail", requestId], updatedDetail);
      await queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      setActiveDialog(null);
    },
  });

  const canReviewPendingRequest =
    detail?.verificationStatus === "PENDING_REVIEW" &&
    detail?.operationalStatus !== "BLOCKED";
  const canBlockCompany = detail?.operationalStatus !== "BLOCKED";

  const timelineItems = detail
    ? [
        { label: "Nộp vào hàng đợi", value: formatDateTime(detail.submittedAt) },
        { label: "Cập nhật review lần cuối", value: formatDateTime(detail.reviewedAt) },
        { label: "Ghi chú admin", value: detail.adminNote ?? "Chưa có ghi chú admin." },
        { label: "Lý do khóa", value: detail.blockReason ?? "Công ty chưa bị khóa." },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Chi tiết xác thực"
        title={detail?.companyName ?? "Hồ sơ xác thực doanh nghiệp"}
        description={`Theo dõi hồ sơ ${requestId}, kiểm tra tài liệu đã nộp và ghi nhận quyết định xét duyệt theo đúng quy trình quản trị.`}
      />

      {detailQuery.isLoading ? (
        <SurfaceCard>
          <div className="grid place-items-center min-h-[220px] text-center gap-2">
            <h3 className="text-lg font-semibold">Đang tải yêu cầu xác thực...</h3>
            <p className="text-[#aeb9ca] text-sm">
              Đang lấy ảnh chụp mới nhất, trạng thái và tài liệu đã tải lên.
            </p>
          </div>
        </SurfaceCard>
      ) : null}

      {detailQuery.isError ? (
        <SurfaceCard>
          <div className="grid place-items-center min-h-[140px] text-center gap-2">
            <AlertTriangle size={18} className="text-[#ff9dad]" />
            <h3 className="text-lg font-semibold">Không thể tải yêu cầu xác thực.</h3>
            <p className="text-[#aeb9ca] text-sm">
              Yêu cầu có thể không còn tồn tại hoặc API quản trị đang không khả dụng.
            </p>
          </div>
        </SurfaceCard>
      ) : null}

      {detail ? (
        <>
          <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
            <VerificationSummaryPanel detail={detail} />

            <SurfaceCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                    Hành động kiểm duyệt
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">Điều khiển quyết định</h3>
                </div>
                <StatusBadge status={detail.verificationStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
                <Button
                  disabled={!canReviewPendingRequest}
                  onClick={() => setActiveDialog("approve")}
                  type="button"
                >
                  <CheckCheck size={16} />
                  Phê duyệt
                </Button>
                <Button
                  variant="danger"
                  disabled={!canReviewPendingRequest}
                  onClick={() => setActiveDialog("reject")}
                  type="button"
                >
                  <XCircle size={16} />
                  Từ chối
                </Button>
                <Button
                  disabled={!canReviewPendingRequest}
                  onClick={() => setActiveDialog("needs-info")}
                  type="button"
                  variant="secondary"
                >
                  <Info size={16} />
                  Yêu cầu bổ sung
                </Button>
                <Button
                  variant="danger"
                  disabled={!canBlockCompany}
                  onClick={() => setActiveDialog("block")}
                  type="button"
                >
                  <ShieldBan size={16} />
                  Khóa công ty
                </Button>
              </div>

              <p className="text-[#aeb9ca] text-sm">
                Các quyết định xét duyệt chỉ khả dụng khi hồ sơ đang ở trạng thái chờ xử lý.
                Sau khi đã có kết luận, chỉ nên sử dụng các thao tác quản trị như khóa công ty khi thực sự cần thiết.
              </p>

              <div>
                <Button
                  onClick={() =>
                    navigate(
                      `/companies/${detail.companyId}?requestId=${detail.requestId}`,
                      { state: { verificationDetail: detail } }
                    )
                  }
                  type="button"
                  variant="ghost"
                  >
                  Mở hồ sơ doanh nghiệp
                </Button>
              </div>
            </SurfaceCard>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
            <SurfaceCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                    Tài liệu xác thực
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">Bằng chứng đã nộp</h3>
                </div>
                <span
                  className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]
                    bg-[rgba(42,78,151,0.3)] text-[#cde0ff]"
                >
                  <FileText size={18} />
                </span>
              </div>

              {detail.documents.length > 0 ? (
                <div className="grid gap-3.5">
                  {detail.documents.map((doc) => (
                    <button
                      key={doc.id}
                      className="flex items-center justify-between gap-4 w-full p-4
                        rounded-2xl border border-[rgba(127,150,186,0.14)]
                        bg-[rgba(14,23,39,0.85)] text-left cursor-pointer
                        transition-all duration-150
                        hover:border-[rgba(130,177,255,0.4)] hover:-translate-y-px"
                      onClick={() => setActiveDocument(doc)}
                      type="button"
                    >
                      <div>
                        <p className="font-bold text-sm">{doc.originalFileName}</p>
                        <p className="text-[#aeb9ca] text-sm mt-0.5">
                          {doc.documentType ?? "Tài liệu xác thực"}
                        </p>
                      </div>
                      <span className="text-[#90a1bb] text-[0.82rem] shrink-0">
                        {doc.mimeType ?? "Không rõ định dạng"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid place-items-center min-h-[140px] text-center gap-2">
                  <h3 className="text-lg font-semibold">Chưa đính kèm tài liệu.</h3>
                  <p className="text-[#aeb9ca] text-sm">
                    Yêu cầu này hiện chưa có bằng chứng nào để xem trước.
                  </p>
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                    Kiểm toán và ghi chú
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">Ngữ cảnh xét duyệt</h3>
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
          </div>
        </>
      ) : null}

      <DecisionDialog
        confirmLabel="Phê duyệt yêu cầu"
        description="Phê duyệt sẽ đánh dấu xác thực công ty là đã duyệt và có thể mở khóa các hành động HR được bảo vệ."
        loading={decisionMutation.isPending && activeDialog === "approve"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "approve", note: value })
        }
        open={activeDialog === "approve"}
        placeholder="Ghi chú phê duyệt hoặc ngữ cảnh kiểm toán (tùy chọn)."
        required={false}
        title="Phê duyệt yêu cầu xác thực"
      />

      <DecisionDialog
        confirmLabel="Từ chối yêu cầu"
        description="Lý do từ chối là bắt buộc để đội HR hiểu điều gì cần sửa chữa."
        loading={decisionMutation.isPending && activeDialog === "reject"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "reject", note: value })
        }
        open={activeDialog === "reject"}
        placeholder="Mô tả lý do từ chối yêu cầu xác thực này."
        title="Từ chối yêu cầu xác thực"
        tone="danger"
      />

      <DecisionDialog
        confirmLabel="Gửi yêu cầu bổ sung"
        description="Sử dụng khi công ty có thể tiếp tục chu kỳ xác thực nhưng phải cung cấp bằng chứng rõ ràng hơn."
        loading={decisionMutation.isPending && activeDialog === "needs-info"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "needs-info", note: value })
        }
        open={activeDialog === "needs-info"}
        placeholder="Liệt kê các tài liệu thiếu hoặc nội dung đội HR phải bổ sung."
        title="Yêu cầu bổ sung thông tin"
      />

      <DecisionDialog
        confirmLabel="Khóa công ty"
        description="Khóa là hành động thực thi và yêu cầu lý do rõ ràng, có thể xem xét lại."
        loading={companyMutation.isPending && activeDialog === "block"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) => companyMutation.mutateAsync(value)}
        open={activeDialog === "block"}
        placeholder="Ghi rõ lý do chính sách, tuân thủ hoặc an toàn khi khóa công ty này."
        title="Khóa công ty"
        tone="danger"
      />

      <DocumentViewer
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
      />
    </div>
  );
}
