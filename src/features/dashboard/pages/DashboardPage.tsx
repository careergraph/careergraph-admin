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
      label: "Hồ sơ chờ xử lý",
      value: summary?.pendingVerification ?? "--",
      icon: TimerReset,
      hint: "Số hồ sơ xác thực đang chờ bộ phận quản trị xem xét.",
    },
    {
      label: "Đã xử lý hôm nay",
      value: summary?.reviewedToday ?? "--",
      icon: ShieldCheck,
      hint: "Tổng số hồ sơ đã được xử lý trong ngày làm việc hiện tại.",
    },
    {
      label: "Doanh nghiệp theo dõi",
      value: summary?.companiesMonitored ?? "--",
      icon: Building2,
      hint: "Tổng số doanh nghiệp đang nằm trong phạm vi theo dõi vận hành.",
    },
    {
      label: "Cảnh báo tuân thủ",
      value: summary?.policyIncidents ?? "--",
      icon: Activity,
      hint: "Số doanh nghiệp đang bị khóa hoặc tạm dừng để xử lý rủi ro vận hành.",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Tổng quan"
        title="Trung tâm điều hành"
        description={`Đăng nhập với ${admin?.email ?? "quản trị viên"}. Theo dõi hồ sơ xác thực, trạng thái doanh nghiệp và các cảnh báo vận hành trên cùng một màn hình.`}
      />

      <section className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
        {dashboardStats.map((item) => (
          <SurfaceCard key={item.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
              </div>
              <span
                className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]
                  bg-[rgba(42,78,151,0.3)] text-[#cde0ff]"
              >
                <item.icon size={18} />
              </span>
            </div>
            <p className="text-[#aeb9ca] text-sm">{item.hint}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Danh sách chờ xử lý
              </p>
              <h3 className="text-lg font-bold mt-0.5">Hồ sơ xác thực mới nhất</h3>
            </div>
          </div>
          {summaryQuery.isLoading ? (
            <p className="text-[#aeb9ca] text-sm">Đang tải danh sách chờ xét duyệt...</p>
          ) : summaryQuery.isError ? (
            <p className="text-[#aeb9ca] text-sm">
              Không thể tải dữ liệu tổng quan từ backend.
            </p>
          ) : summary?.latestPendingRequests?.length ? (
            <div className="flex flex-col gap-2.5">
              {summary.latestPendingRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="rounded-xl border border-[rgba(127,150,186,0.14)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#dbe4f4]">{request.companyName}</p>
                      <p className="text-[#aeb9ca] text-sm">
                        {request.hrEmail ?? "Chưa có email HR"}
                      </p>
                    </div>
                    <StatusBadge status={request.verificationStatus} />
                  </div>
                  <div className="mt-3">
                    <Link
                      className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
                      to={`/verification/${request.requestId}`}
                    >
                      Mở hồ sơ xét duyệt
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#aeb9ca] text-sm">
              Hiện không có yêu cầu chờ xét duyệt nào.
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
                Điều phối doanh nghiệp
              </p>
              <h3 className="text-lg font-bold mt-0.5">Quản lý trạng thái doanh nghiệp</h3>
            </div>
          </div>
          <p className="text-[#aeb9ca] text-sm">
            Truy cập nhanh danh sách doanh nghiệp để rà soát trạng thái xác thực,
            khóa hoặc mở khóa tài khoản khi cần thiết.
          </p>
          <div>
            <Link
              className="inline-flex items-center gap-1.5 text-[#91b7ff] text-sm hover:underline"
              to="/companies/company-control"
            >
              Mở trang quản lý doanh nghiệp
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
