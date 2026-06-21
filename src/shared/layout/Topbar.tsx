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
    <header className="topbar">
      <div>
        <p className="muted-label">Protected workspace</p>
        <h2>Administrator shell</h2>
      </div>

      <div className="topbar-actions">
        <div className="admin-chip">
          <Shield size={16} />
          <span>{admin?.email || "admin"}</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </header>
  );
}
