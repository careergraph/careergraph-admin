import api from "@/lib/http";
import { unwrapResponse } from "@/lib/api";
import { decodeAccessToken } from "@/lib/authToken";
import type { AdminSession, LoginPayload } from "@/features/auth/types";
import { useAuthStore } from "@/stores/authStore";

type LoginResponse = {
  accessToken: string;
};

const assertAdminFromToken = (token: string): AdminSession => {
  const claims = decodeAccessToken(token);

  if (!claims || claims.role !== "ADMIN") {
    throw new Error("Tài khoản không có quyền quản trị.");
  }

  return {
    id: claims.sub ?? "",
    email: claims.email ?? "",
    role: claims.role,
  };
};

export const adminAuthApi = {
  async login(payload: Omit<LoginPayload, "role">) {
    const response = await api.post("/auth/login", {
      ...payload,
      role: "ADMIN",
    });
    const data = unwrapResponse<LoginResponse>(response);
    return {
      accessToken: data.accessToken,
      admin: assertAdminFromToken(data.accessToken),
    };
  },

  async getSession() {
    const probeResponse = await api.get("/admin/company-verification-requests", {
      params: {
        page: 0,
        size: 1,
      },
    });

    unwrapResponse(probeResponse);

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      throw new Error("Phiên đăng nhập không hợp lệ.");
    }

    return assertAdminFromToken(token);
  },

  async logout() {
    await api.post("/auth/logout");
  },
};
