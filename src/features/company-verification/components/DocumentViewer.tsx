import { useState } from "react";
import type { VerificationDocument } from "@/features/company-verification/types";
import { Button } from "@/shared/components/ui/Button";
import { AlertTriangle, Download } from "lucide-react";

type DocumentViewerProps = {
  document: VerificationDocument | null;
  onClose: () => void;
};

const imageMimePattern = /^image\//i;

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  if (!document) {
    return null;
  }

  const isImageMime = imageMimePattern.test(document.mimeType ?? "");
  const isPdf =
    document.mimeType === "application/pdf" ||
    document.documentUrl.toLowerCase().endsWith(".pdf") ||
    document.documentUrl.includes("/f_pdf/");

  // Detect if image is from Cloudinary image CDN (can be displayed) or raw CDN (should download)
  const isCloudinaryImageCdn = isImageMime && document.documentUrl.includes("/image/upload/");
  const isRawImage = isImageMime && !isCloudinaryImageCdn;

  const canPreview = isPdf || (isImageMime && !imageLoadError && isCloudinaryImageCdn);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="dialog-panel dialog-panel-wide"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-title-row">
          <div>
            <div className="eyebrow">Document Viewer</div>
            <h3 className="dialog-title">{document.originalFileName}</h3>
            <p className="surface-copy">
              {document.documentType || "Verification document"}
            </p>
          </div>
          <div className="dialog-actions">
            <Button
              onClick={() =>
                window.open(document.documentUrl, "_blank", "noopener,noreferrer")
              }
              type="button"
              variant="secondary"
            >
              <Download size={16} />
              Download
            </Button>
            <Button onClick={onClose} type="button" variant="ghost">
              Close
            </Button>
          </div>
        </div>

        <div className="document-preview-shell">
          {isPdf && !isRawImage ? (
            <iframe
              className="document-frame"
              src={document.documentUrl}
              title={document.originalFileName}
              style={{ height: "70vh", minHeight: "560px" }}
            />
          ) : null}

          {isImageMime && isCloudinaryImageCdn && !imageLoadError ? (
            <img
              alt={document.originalFileName}
              className="document-image"
              src={document.documentUrl}
              onError={() => setImageLoadError(true)}
              style={{ maxHeight: "70vh", minHeight: "560px", width: "100%", objectFit: "contain" }}
            />
          ) : null}

          {(isRawImage || imageLoadError) && !isPdf ? (
            <div className="empty-state">
              <AlertTriangle size={32} className="text-amber-600" />
              <h3>Preview not available</h3>
              <p className="surface-copy">
                This document type cannot be previewed in the browser. Click the "Download" button
                to open it in your default application.
              </p>
            </div>
          ) : null}

          {!isImageMime && !isPdf ? (
            <div className="empty-state">
              <h3>Preview is not available for this file type.</h3>
              <p className="surface-copy">
                Click the "Download" button to inspect or download this document.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
