import type { AxiosResponse } from "axios";

export type ApiEnvelope<T> = {
  status?: string | number;
  message?: string;
  data: T;
};

export const unwrapResponse = <T>(response: AxiosResponse<ApiEnvelope<T>>): T =>
  response.data.data;
