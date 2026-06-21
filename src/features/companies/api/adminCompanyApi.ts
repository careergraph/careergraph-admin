import api from "@/lib/http";
import { unwrapResponse } from "@/lib/api";
import type { VerificationRequestDetail, VerificationRequestSummary, SpringPage } from "@/features/company-verification/types";

export interface AdminCompanyListItem {
  companyId: string;
  companyName: string;
  taxCode: string | null;
  hrEmail: string | null;
  verificationStatus: string;
  operationalStatus: string;
  submittedAt: string | null;
  totalRequests: number;
}

export interface AdminCompanyListQuery {
  page?: number;
  size?: number;
  verificationStatus?: string;
  operationalStatus?: string;
  query?: string;
}

export interface AdminDashboardSummary {
  pendingVerification: number;
  reviewedToday: number;
  companiesMonitored: number;
  policyIncidents: number;
  latestPendingRequests: VerificationRequestSummary[];
}

export const adminCompanyApi = {
  async listCompanies(params?: AdminCompanyListQuery) {
    const normalizedParams = {
      ...params,
      verificationStatus: params?.verificationStatus || undefined,
      operationalStatus: params?.operationalStatus || undefined,
    };
    const response = await api.get("/admin/companies", {
      params: normalizedParams,
    });
    return unwrapResponse<SpringPage<AdminCompanyListItem>>(response);
  },

  async blockCompany(companyId: string, reason: string) {
    const response = await api.post(`/admin/companies/${companyId}/block`, {
      reason,
    });
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async unblockCompany(companyId: string, note: string) {
    const response = await api.post(`/admin/companies/${companyId}/unblock`, {
      note,
    });
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async getCompanyVerificationHistory(companyId: string) {
    const response = await api.get(`/admin/companies/${companyId}/verification-requests`);
    return unwrapResponse<VerificationRequestSummary[]>(response);
  },

  async getCompanyDetail(companyId: string) {
    const response = await api.get(`/admin/companies/${companyId}`);
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async getDashboardSummary() {
    const response = await api.get("/admin/dashboard-summary");
    return unwrapResponse<AdminDashboardSummary>(response);
  },
};
