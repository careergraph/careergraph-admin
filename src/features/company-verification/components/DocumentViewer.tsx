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

  if (!document) return null;

  const isImageMime = imageMimePattern.test(document.mimeType ?? "");
  const isPdf =
    document.mimeType === "application/pdf" ||
    document.documentUrl.toLowerCase().endsWith(".pdf") ||
    document.documentUrl.includes("/f_pdf/");

  const isCloudinaryImageCdn =
    isImageMime && document.documentUrl.includes("/image/upload/");
  const isRawImage = isImageMime && !isCloudinaryImageCdn;

  const canPreview = isPdf || (isImageMime && !imageLoadError && isCloudinaryImageCdn);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center p-4
        bg-[rgba(4,8,15,0.72)] backdrop-blur-[10px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        className="w-[min(1080px,100%)] flex flex-col gap-4 p-5 rounded-[1.35rem]
          border border-[rgba(127,150,186,0.14)]
          bg-gradient-to-b from-[rgba(19,31,53,0.98)] to-[rgba(11,20,37,0.96)]
          shadow-[0_24px_90px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[#8fc8ff] text-[0.8rem] font-bold tracking-[0.14em] uppercase">
              Xem tài liệu
            </div>
            <h3 className="text-[1.35rem] font-bold mt-0.5">
              {document.originalFileName}
            </h3>
            <p className="text-[#aeb9ca] text-sm">
              {document.documentType ?? "Tài liệu xác thực"}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() =>
                window.open(document.documentUrl, "_blank", "noopener,noreferrer")
              }
              type="button"
              variant="secondary"
            >
              <Download size={16} />
              Tải xuống
            </Button>
            <Button onClick={onClose} type="button" variant="ghost">
              Đóng
            </Button>
          </div>
        </div>

        <div
          className="mt-2 min-h-[480px] rounded-2xl border border-[rgba(127,150,186,0.14)]
            overflow-hidden bg-[rgba(5,10,18,0.85)]"
        >
          {isPdf && !isRawImage ? (
            <iframe
              className="w-full border-0"
              src={document.documentUrl}
              title={document.originalFileName}
              style={{ height: "70vh", minHeight: "560px" }}
            />
          ) : null}

          {isImageMime && isCloudinaryImageCdn && !imageLoadError ? (
            <img
              alt={document.originalFileName}
              className="block w-full object-contain bg-[#0b1423]"
              src={document.documentUrl}
              onError={() => setImageLoadError(true)}
              style={{ maxHeight: "70vh", minHeight: "560px" }}
            />
          ) : null}

          {(isRawImage || imageLoadError) && !isPdf ? (
            <div className="grid place-items-center gap-2 min-h-[220px] text-center p-4">
              <AlertTriangle size={32} className="text-amber-400" />
              <h3 className="text-lg font-semibold">Không thể xem trước</h3>
              <p className="text-[#aeb9ca] text-sm">
                Loại tài liệu này không thể xem trực tiếp trên trình duyệt.
                Vui lòng nhấn "Tải xuống" để mở bằng ứng dụng phù hợp.
              </p>
            </div>
          ) : null}

          {!isImageMime && !isPdf ? (
            <div className="grid place-items-center gap-2 min-h-[220px] text-center p-4">
              <h3 className="text-lg font-semibold">
                Không hỗ trợ xem trước loại file này.
              </h3>
              <p className="text-[#aeb9ca] text-sm">
                Nhấn "Tải xuống" để kiểm tra hoặc tải về tài liệu.
              </p>
            </div>
          ) : null}

          {!canPreview && !isRawImage && !imageLoadError && isImageMime && !isCloudinaryImageCdn ? null : null}
        </div>
      </div>
    </div>
  );
}
