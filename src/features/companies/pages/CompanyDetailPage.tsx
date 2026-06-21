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
  if (!value) {
    return "Chưa có";
  }

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
  const stateDetail = (location.state as { verificationDetail?: VerificationRequestDetail } | null)
    ?.verificationDetail;

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
    if (!detail) {
      return [];
    }

    return [
      {
        label: "Ngày gửi xác thực",
        value: formatDateTime(detail.submittedAt),
      },
      {
        label: "Lần review gần nhất",
        value: formatDateTime(detail.reviewedAt),
      },
      {
        label: "Lý do khóa",
        value: detail.blockReason || "Không có lệnh khóa đang hiệu lực",
      },
      {
        label: "Ghi chú admin",
        value: detail.adminNote || "Chưa có ghi chú",
      },
    ];
  }, [detail]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Công ty"
        title={detail?.companyName || "Kiểm soát doanh nghiệp"}
        description="Điều khiển vận hành để khóa, mở khóa và xem bối cảnh xác thực mới nhất của doanh nghiệp."
      />

      <div className="two-column-grid">
        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Chế tài doanh nghiệp</p>
              <h3>Trạng thái vận hành</h3>
            </div>
            <span className="icon-chip">
              <ShieldAlert size={18} />
            </span>
          </div>
          {detail ? (
            <div className="stack-sm">
              <div className="inline-status-row">
                <StatusBadge status={detail.operationalStatus} />
                <StatusBadge status={detail.verificationStatus} />
              </div>
              <p className="surface-copy">
                Mã công ty: <span className="mono-text">{companyId}</span>
              </p>
              <p className="surface-copy">
                Lý do khóa hiện tại: {detail.blockReason || "Không có trạng thái khóa"}
              </p>
              <div className="inline-actions">
                {detail.operationalStatus === "BLOCKED" ? (
                  <Button onClick={() => setActiveDialog("unblock")} variant="secondary">
                    <Unlock size={16} />
                    Mở khóa công ty
                  </Button>
                ) : (
                  <Button className="button-danger" onClick={() => setActiveDialog("block")}>
                    <Lock size={16} />
                    Khóa công ty
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state compact-empty-state">
              <AlertTriangle size={18} />
              <div>
                <h3>Chưa có ảnh chụp trạng thái công ty.</h3>
                <p className="surface-copy">
                  Hãy mở trang này từ một yêu cầu xác thực để nạp ngữ cảnh backend theo request ID.
                </p>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Ảnh chụp mới nhất</p>
              <h3>Tóm tắt công ty</h3>
            </div>
            <span className="icon-chip">
              <Building2 size={18} />
            </span>
          </div>
          {detail ? (
            <div className="description-list">
              <div className="description-row">
                <dt>Email HR</dt>
                <dd>{detail.hrEmail || "Chưa cung cấp"}</dd>
              </div>
              <div className="description-row">
                <dt>Mã số thuế</dt>
                <dd>{detail.taxCode || "Chưa cung cấp"}</dd>
              </div>
              <div className="description-row">
                <dt>Người đại diện pháp lý</dt>
                <dd>{detail.legalRepresentativeName || "Chưa cung cấp"}</dd>
              </div>
              <div className="description-row">
                <dt>Email doanh nghiệp</dt>
                <dd>{detail.businessEmail || "Chưa cung cấp"}</dd>
              </div>
              <div className="description-row">
                <dt>Website</dt>
                <dd>{detail.website || "Chưa cung cấp"}</dd>
              </div>
            </div>
          ) : detailQuery.isLoading || companyDetailQuery.isLoading ? (
            <div className="empty-state">
              <h3>Đang tải ảnh chụp công ty...</h3>
              <p className="surface-copy">
                Hệ thống đang nạp ngữ cảnh kiểm duyệt mới nhất gắn với doanh nghiệp.
              </p>
            </div>
          ) : detailQuery.isError && companyDetailQuery.isError ? (
            <div className="empty-state compact-empty-state">
              <AlertTriangle size={18} />
              <div>
                <h3>Không thể tải thông tin công ty.</h3>
                <p className="surface-copy">Vui lòng tải lại trang hoặc mở lại từ danh sách công ty.</p>
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      </div>

      {detail ? (
        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Dòng thời gian kiểm duyệt</p>
              <h3>Ngữ cảnh vận hành gần nhất</h3>
            </div>
          </div>
          <div className="timeline-list">
            {timelineItems.map((item) => (
              <div key={item.label} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <p className="timeline-title">{item.label}</p>
                  <p className="surface-copy">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <div className="panel-title-row">
          <div>
            <p className="muted-label">Lịch sử công ty</p>
            <h3>Các yêu cầu xác thực</h3>
          </div>
        </div>
        {historyQuery.isLoading ? (
          <div className="empty-state">
            <h3>Đang tải lịch sử xác thực...</h3>
            <p className="surface-copy">Hệ thống đang lấy toàn bộ yêu cầu của công ty này.</p>
          </div>
        ) : historyQuery.isError ? (
          <div className="empty-state compact-empty-state">
            <AlertTriangle size={18} />
            <div>
              <h3>Tải lịch sử xác thực thất bại.</h3>
              <p className="surface-copy">Vui lòng thử lại hoặc làm mới trang sau ít phút.</p>
            </div>
          </div>
        ) : historyQuery.data && historyQuery.data.length > 0 ? (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú admin</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {historyQuery.data.map((request) => (
                  <tr key={request.requestId}>
                    <td>{formatDateTime(request.submittedAt)}</td>
                    <td>
                      <StatusBadge status={request.verificationStatus} />
                    </td>
                    <td>{request.adminNote || "—"}</td>
                    <td>
                      <Link className="inline-link" to={`/verification/${request.requestId}`}>
                        Xem chi tiết <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Chưa tìm thấy yêu cầu xác thực nào.</h3>
            <p className="surface-copy">Công ty này hiện chưa gửi bất kỳ yêu cầu xác thực nào.</p>
          </div>
        )}
      </SurfaceCard>

      <DecisionDialog
        confirmLabel="Xác nhận khóa"
        description="Khóa công ty sẽ ngay lập tức chặn các vận hành đã được duyệt. Backend hiện yêu cầu bắt buộc phải có lý do."
        loading={companyMutation.isPending && activeDialog === "block"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) => companyMutation.mutateAsync({ action: "block", note: value })}
        open={activeDialog === "block"}
        placeholder="Ghi rõ lý do chính sách hoặc tuân thủ khi khóa công ty này."
        title="Khóa công ty"
        tone="danger"
      />

      <DecisionDialog
        confirmLabel="Xác nhận mở khóa"
        description="Backend hiện yêu cầu ghi chú mở khóa, vì vậy hãy mô tả rõ lý do có thể khôi phục doanh nghiệp."
        initialValue={detail?.adminNote ?? ""}
        loading={companyMutation.isPending && activeDialog === "unblock"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) => companyMutation.mutateAsync({ action: "unblock", note: value })}
        open={activeDialog === "unblock"}
        placeholder="Ghi rõ vì sao công ty có thể được khôi phục về trạng thái ACTIVE."
        title="Mở khóa công ty"
      />
    </div>
  );
}
