import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminAuthApi } from "@/features/auth/api/adminAuthApi";
import { isTokenExpired } from "@/lib/authToken";
import { useAuthStore } from "@/stores/authStore";
import { FullScreenState } from "@/shared/components/ui/FullScreenState";

export function AdminAuthGuard() {
  const location = useLocation();
  const { accessToken, admin, hydrated, setAdmin, clearAuth } = useAuthStore();

  const shouldValidate = useMemo(
    () => Boolean(hydrated && accessToken && !isTokenExpired(accessToken)),
    [accessToken, hydrated]
  );

  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: adminAuthApi.getSession,
    enabled: shouldValidate,
    retry: false,
  });

  if (!hydrated) {
    return (
      <FullScreenState
        title="Đang khởi tạo phiên"
        description="Đang nạp không gian làm việc quản trị viên."
      />
    );
  }

  const shouldRedirectToLogin =
    !accessToken ||
    isTokenExpired(accessToken) ||
    (admin?.role ? admin.role !== "ADMIN" : false) ||
    sessionQuery.isError;

  useEffect(() => {
    if (sessionQuery.isSuccess && sessionQuery.data) {
      if (
        admin?.email !== sessionQuery.data.email ||
        admin?.role !== sessionQuery.data.role ||
        admin?.id !== sessionQuery.data.id
      ) {
        setAdmin(sessionQuery.data);
      }
    }
  }, [admin?.email, admin?.id, admin?.role, sessionQuery.data, sessionQuery.isSuccess, setAdmin]);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      clearAuth();
    }
  }, [clearAuth, shouldRedirectToLogin]);

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (sessionQuery.isLoading) {
    return (
      <FullScreenState
        title="Đang xác minh quyền truy cập"
        description="Đang kiểm tra quyền quản trị viên với backend."
      />
    );
  }

  return <Outlet />;
}
