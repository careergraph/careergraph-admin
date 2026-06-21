import { LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "@/features/auth/api/adminAuthApi";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/ui/Button";

export function Topbar() {
  const navigate = useNavigate();
  const admin = useAuthStore((state) => state.admin);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header
      className="flex items-center justify-between gap-4 px-8 py-5 pb-4
        border-b border-[rgba(159,174,196,0.1)] backdrop-blur-lg
        max-[720px]:flex-col max-[720px]:items-start max-[720px]:px-4"
    >
      <div>
        <p className="text-[#90a1bb] text-[0.78rem] uppercase tracking-[0.08em]">
          Không gian bảo vệ
        </p>
        <h2 className="mt-0.5 text-[1.1rem] font-semibold">Shell quản trị viên</h2>
      </div>

      <div className="flex items-center gap-3 max-[720px]:w-full max-[720px]:flex-col max-[720px]:items-stretch">
        <div
          className="inline-flex items-center gap-2 px-[0.95rem] py-[0.7rem]
            border border-[rgba(115,152,228,0.18)] rounded-full
            bg-[rgba(16,29,51,0.68)] text-[#c9d6eb] text-sm"
        >
          <Shield size={16} />
          <span>{admin?.email ?? "admin"}</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
