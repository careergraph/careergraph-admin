import api from "@/lib/http";
import { unwrapResponse } from "@/lib/api";
import type {
  AdminVerificationDecisionPayload,
  QueueQuery,
  SpringPage,
  VerificationRequestDetail,
  VerificationRequestSummary,
} from "@/features/company-verification/types";

export const companyVerificationApi = {
  async getQueue(params?: QueueQuery) {
    const normalizedParams = {
      ...params,
      status: params?.status === "ALL" ? undefined : params?.status,
    };
    const response = await api.get("/admin/company-verification-requests", {
      params: normalizedParams,
    });
    return unwrapResponse<SpringPage<VerificationRequestSummary>>(response);
  },

  async getDetail(requestId: string) {
    const response = await api.get(
      `/admin/company-verification-requests/${requestId}`
    );
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async approve(requestId: string, payload: AdminVerificationDecisionPayload) {
    const response = await api.post(
      `/admin/company-verification-requests/${requestId}/approve`,
      payload
    );
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async reject(requestId: string, payload: AdminVerificationDecisionPayload) {
    const response = await api.post(
      `/admin/company-verification-requests/${requestId}/reject`,
      payload
    );
    return unwrapResponse<VerificationRequestDetail>(response);
  },

  async requestAdditionalInfo(
    requestId: string,
    payload: AdminVerificationDecisionPayload
  ) {
    const response = await api.post(
      `/admin/company-verification-requests/${requestId}/request-additional-info`,
      payload
    );
    return unwrapResponse<VerificationRequestDetail>(response);
  },
};
