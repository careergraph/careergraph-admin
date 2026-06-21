import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeAccessToken, isTokenExpired } from "@/lib/authToken";
import type { AdminSession } from "@/features/auth/types";

type AuthState = {
  accessToken: string | null;
  admin: AdminSession | null;
  hydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setAdmin: (admin: AdminSession | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      admin: null,
      hydrated: false,
      setAccessToken: (token) => {
        if (!token || isTokenExpired(token)) {
          set({ accessToken: null, admin: null });
          return;
        }

        const claims = decodeAccessToken(token);
        const currentAdmin = get().admin;

        set({
          accessToken: token,
          admin: claims
            ? {
                id: claims.sub ?? currentAdmin?.id ?? "",
                email: claims.email ?? currentAdmin?.email ?? "",
                role: claims.role ?? currentAdmin?.role ?? "",
              }
            : currentAdmin,
        });
      },
      setAdmin: (admin) => set({ admin }),
      setHydrated: (hydrated) => set({ hydrated }),
      clearAuth: () => set({ accessToken: null, admin: null }),
    }),
    {
      name: "careergraph-admin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        if (state.accessToken && isTokenExpired(state.accessToken)) {
          state.accessToken = null;
          state.admin = null;
        }

        state.hydrated = true;
      },
    }
  )
);
