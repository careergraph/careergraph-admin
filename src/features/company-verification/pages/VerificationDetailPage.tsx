import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCheck,
  FileText,
  Info,
  ShieldBan,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { companyVerificationApi } from "@/features/company-verification/api/companyVerificationApi";
import { DecisionDialog } from "@/features/company-verification/components/DecisionDialog";
import { DocumentViewer } from "@/features/company-verification/components/DocumentViewer";
import { VerificationSummaryPanel } from "@/features/company-verification/components/VerificationSummaryPanel";
import type {
  VerificationDocument,
} from "@/features/company-verification/types";
import { adminCompanyApi } from "@/features/companies/api/adminCompanyApi";
import { PageHeader } from "@/shared/components/PageHeader";
import { SurfaceCard } from "@/shared/components/SurfaceCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/Button";

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

type ActiveDialog =
  | "approve"
  | "reject"
  | "needs-info"
  | "block"
  | null;

export function VerificationDetailPage() {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [activeDocument, setActiveDocument] =
    useState<VerificationDocument | null>(null);

  const detailQuery = useQuery({
    queryFn: () => companyVerificationApi.getDetail(requestId),
    queryKey: ["verification-detail", requestId],
  });

  const detail = detailQuery.data;

  const decisionMutation = useMutation({
    mutationFn: async (payload: {
      action: Exclude<ActiveDialog, "block" | null>;
      note: string;
    }) => {
      if (payload.action === "approve") {
        return companyVerificationApi.approve(requestId, { note: payload.note });
      }
      if (payload.action === "reject") {
        return companyVerificationApi.reject(requestId, { note: payload.note });
      }
      return companyVerificationApi.requestAdditionalInfo(requestId, {
        note: payload.note,
      });
    },
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["verification-detail", requestId], updatedDetail);
      await queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      setActiveDialog(null);
    },
  });

  const companyMutation = useMutation({
    mutationFn: async (reason: string) =>
      adminCompanyApi.blockCompany(detail?.companyId ?? "", reason),
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["verification-detail", requestId], updatedDetail);
      await queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      setActiveDialog(null);
    },
  });

  const actionDisabled =
    !detail ||
    detail.verificationStatus === "APPROVED" ||
    detail.operationalStatus === "BLOCKED";

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Verification detail"
        title={detail?.companyName || "Verification workspace"}
        description={`Request ${requestId} review workspace for evidence inspection, moderation decisions, and company enforcement.`}
      />

      {detailQuery.isLoading ? (
        <SurfaceCard>
          <div className="empty-state">
            <h3>Loading verification request...</h3>
            <p className="surface-copy">
              Pulling the latest request snapshot, status, and uploaded
              documents.
            </p>
          </div>
        </SurfaceCard>
      ) : null}

      {detailQuery.isError ? (
        <SurfaceCard>
          <div className="empty-state compact-empty-state">
            <AlertTriangle size={18} />
            <div>
              <h3>Verification request could not be loaded.</h3>
              <p className="surface-copy">
                The request may no longer exist, or the admin API is currently
                unavailable.
              </p>
            </div>
          </div>
        </SurfaceCard>
      ) : null}

      {detail ? (
        <>
          <div className="two-column-grid">
            <VerificationSummaryPanel detail={detail} />

            <SurfaceCard>
              <div className="panel-title-row">
                <div>
                  <p className="muted-label">Moderation actions</p>
                  <h3>Decision controls</h3>
                </div>
                <StatusBadge status={detail.verificationStatus} />
              </div>

              <div className="action-grid">
                <Button
                  disabled={actionDisabled}
                  onClick={() => setActiveDialog("approve")}
                  type="button"
                >
                  <CheckCheck size={16} />
                  Approve
                </Button>
                <Button
                  className="button-danger"
                  disabled={!detail || detail.operationalStatus === "BLOCKED"}
                  onClick={() => setActiveDialog("reject")}
                  type="button"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
                <Button
                  disabled={detail.operationalStatus === "BLOCKED"}
                  onClick={() => setActiveDialog("needs-info")}
                  type="button"
                  variant="secondary"
                >
                  <Info size={16} />
                  Request info
                </Button>
                <Button
                  className="button-danger"
                  disabled={detail.operationalStatus === "BLOCKED"}
                  onClick={() => setActiveDialog("block")}
                  type="button"
                  variant="secondary"
                >
                  <ShieldBan size={16} />
                  Block company
                </Button>
              </div>

              <p className="surface-copy">
                Approve is disabled after the company is already approved or
                blocked. Reject and request-info remain available while the
                request is still part of an active review cycle.
              </p>

              <div className="inline-actions">
                <Button
                  onClick={() =>
                    navigate(
                      `/companies/${detail.companyId}?requestId=${detail.requestId}`,
                      { state: { verificationDetail: detail } }
                    )
                  }
                  type="button"
                  variant="ghost"
                >
                  Open company control
                </Button>
              </div>
            </SurfaceCard>
          </div>

          <div className="two-column-grid">
            <SurfaceCard>
              <div className="panel-title-row">
                <div>
                  <p className="muted-label">Verification documents</p>
                  <h3>Evidence submitted</h3>
                </div>
                <span className="icon-chip">
                  <FileText size={18} />
                </span>
              </div>

              {detail.documents.length > 0 ? (
                <div className="document-list">
                  {detail.documents.map((document) => (
                    <button
                      className="document-card"
                      key={document.id}
                      onClick={() => setActiveDocument(document)}
                      type="button"
                    >
                      <div>
                        <p className="document-title">
                          {document.originalFileName}
                        </p>
                        <p className="surface-copy">
                          {document.documentType || "Verification document"}
                        </p>
                      </div>
                      <span className="document-meta">
                        {document.mimeType || "Unknown format"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact-empty-state">
                  <h3>No documents were attached.</h3>
                  <p className="surface-copy">
                    This request currently has no uploaded evidence to preview.
                  </p>
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard>
              <div className="panel-title-row">
                <div>
                  <p className="muted-label">Audit and notes</p>
                  <h3>Review context</h3>
                </div>
              </div>
              <div className="timeline-list">
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <p className="timeline-title">Submitted to queue</p>
                    <p className="surface-copy">
                      {formatDateTime(detail.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <p className="timeline-title">Last review update</p>
                    <p className="surface-copy">
                      {formatDateTime(detail.reviewedAt)}
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <p className="timeline-title">Admin note</p>
                    <p className="surface-copy">
                      {detail.adminNote || "No admin note recorded yet."}
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <p className="timeline-title">Block reason</p>
                    <p className="surface-copy">
                      {detail.blockReason || "Company is not currently blocked."}
                    </p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}

      <DecisionDialog
        confirmLabel="Approve request"
        description="Approval will mark the company verification as approved and may unlock protected HR actions."
        loading={decisionMutation.isPending && activeDialog === "approve"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "approve", note: value })
        }
        open={activeDialog === "approve"}
        placeholder="Optional approval note or audit context."
        required={false}
        title="Approve verification request"
      />

      <DecisionDialog
        confirmLabel="Reject request"
        description="A rejection reason is required so the HR team understands what must be corrected."
        loading={decisionMutation.isPending && activeDialog === "reject"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "reject", note: value })
        }
        open={activeDialog === "reject"}
        placeholder="Describe the reason for rejecting this verification request."
        title="Reject verification request"
        tone="danger"
      />

      <DecisionDialog
        confirmLabel="Request additional info"
        description="Use this when the company can continue the verification cycle but must provide clearer or missing evidence."
        loading={decisionMutation.isPending && activeDialog === "needs-info"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) =>
          decisionMutation.mutateAsync({ action: "needs-info", note: value })
        }
        open={activeDialog === "needs-info"}
        placeholder="List the missing documents or corrections the HR team must provide."
        title="Request additional information"
      />

      <DecisionDialog
        confirmLabel="Block company"
        description="Blocking is an enforcement action and requires a clear, reviewable reason."
        loading={companyMutation.isPending && activeDialog === "block"}
        onClose={() => setActiveDialog(null)}
        onConfirm={(value) => companyMutation.mutateAsync(value)}
        open={activeDialog === "block"}
        placeholder="Document the policy, compliance, or trust-and-safety reason for blocking this company."
        title="Block company"
        tone="danger"
      />

      <DocumentViewer
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
      />
    </div>
  );
}
