import {
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "@/app/App";
import { AdminAuthGuard } from "@/features/auth/components/AdminAuthGuard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { VerificationDetailPage } from "@/features/company-verification/pages/VerificationDetailPage";
import { VerificationQueuePage } from "@/features/company-verification/pages/VerificationQueuePage";
import { CompanyDetailPage } from "@/features/companies/pages/CompanyDetailPage";
import { CompanyListPage } from "@/features/companies/pages/CompanyListPage";
import { AppShell } from "@/shared/layout/AppShell";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminAuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/verification" element={<VerificationQueuePage />} />
          <Route
            path="/verification/:requestId"
            element={<VerificationDetailPage />}
          />
          <Route
            path="/companies/company-control"
            element={<CompanyListPage />}
          />
          <Route
            path="/companies/:companyId"
            element={<CompanyDetailPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  )
);
