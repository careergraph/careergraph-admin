import { Activity, Building2, ShieldCheck, TimerReset } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminCompanyApi } from "@/features/companies/api/adminCompanyApi";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuthStore } from "@/stores/authStore";

export function DashboardPage() {
  const admin = useAuthStore((state) => state.admin);
  const summaryQuery = useQuery({
    queryFn: () => adminCompanyApi.getDashboardSummary(),
    queryKey: ["admin-dashboard-summary"],
  });
  const summary = summaryQuery.data;

  const dashboardStats = [
    {
      label: "Chờ xác thực",
      value: summary?.pendingVerification ?? "--",
      icon: TimerReset,
      hint: "Số yêu cầu đang chờ admin xử lý trong hàng đợi xác thực.",
    },
    {
      label: "Đã duyệt hôm nay",
      value: summary?.reviewedToday ?? "--",
      icon: ShieldCheck,
      hint: "Tổng số hồ sơ đã được review trong ngày hiện tại.",
    },
    {
      label: "Công ty giám sát",
      value: summary?.companiesMonitored ?? "--",
      icon: Building2,
      hint: "Tổng doanh nghiệp đang nằm trong phạm vi giám sát vận hành.",
    },
    {
      label: "Sự cố chính sách",
      value: summary?.policyIncidents ?? "--",
      icon: Activity,
      hint: "Số doanh nghiệp đang bị khóa hoặc tạm dừng.",
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Trung tâm điều hành"
        description={`Đăng nhập với ${admin?.email || "administrator"}. Không gian này sẵn sàng cho hàng đợi xác thực và công cụ kiểm soát doanh nghiệp.`}
      />

      <section className="stats-grid">
        {dashboardStats.map((item) => (
          <SurfaceCard key={item.label}>
            <div className="stat-row">
              <div>
                <p className="muted-label">{item.label}</p>
                <h3>{item.value}</h3>
              </div>
              <span className="icon-chip">
                <item.icon size={18} />
              </span>
            </div>
            <p className="surface-copy">{item.hint}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="two-column-grid">
        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Điểm tích hợp hàng đợi</p>
              <h3>Tiếp nhận xác thực</h3>
            </div>
          </div>
          {summaryQuery.isLoading ? (
            <p className="surface-copy">Đang tải danh sách chờ xét duyệt...</p>
          ) : summaryQuery.isError ? (
            <p className="surface-copy">Không thể tải dữ liệu tổng quan từ backend.</p>
          ) : summary?.latestPendingRequests?.length ? (
            <div className="stack-sm">
              {summary.latestPendingRequests.map((request) => (
                <div key={request.requestId} className="rounded-2xl border border-slate-200/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{request.companyName}</p>
                      <p className="surface-copy">{request.hrEmail || "Chưa có email HR"}</p>
                    </div>
                    <StatusBadge status={request.verificationStatus} />
                  </div>
                  <div className="mt-3">
                    <Link className="inline-link" to={`/verification/${request.requestId}`}>
                      Mở hồ sơ review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="surface-copy">Hiện không có yêu cầu chờ xét duyệt nào.</p>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="panel-title-row">
            <div>
              <p className="muted-label">Điểm tích hợp chế tài</p>
              <h3>Kiểm soát doanh nghiệp</h3>
            </div>
          </div>
          <p className="surface-copy">
            Admin có thể mở trang doanh nghiệp để khóa, mở khóa và xem lịch sử xác thực mà
            không cần đi qua request detail.
          </p>
          <div className="mt-3">
            <Link className="inline-link" to="/companies">
              Mở trung tâm quản lý công ty
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
