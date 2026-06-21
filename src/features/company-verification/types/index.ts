export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_ADDITIONAL_INFO";

export type OperationalStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED";

export type VerificationDocument = {
  id: string;
  documentUrl: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
};

export type VerificationRequestSummary = {
  requestId: string;
  companyId: string;
  companyName: string;
  taxCode: string | null;
  hrEmail: string | null;
  verificationStatus: VerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  documents: VerificationDocument[];
};

export type VerificationRequestDetail = {
  requestId: string;
  companyId: string;
  companyName: string;
  hrEmail: string | null;
  taxCode: string | null;
  legalRepresentativeName: string | null;
  businessEmail: string | null;
  website: string | null;
  verificationStatus: VerificationStatus;
  operationalStatus: OperationalStatus;
  adminNote: string | null;
  blockReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  documents: VerificationDocument[];
};

export type AdminVerificationDecisionPayload = {
  note: string;
};

export type QueueQuery = {
  page?: number;
  size?: number;
  status?: VerificationStatus | "ALL";
  query?: string;
};

export type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};
