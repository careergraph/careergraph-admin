import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";

type DecisionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  required?: boolean;
  placeholder?: string;
  initialValue?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (value: string) => Promise<unknown> | void;
};

export function DecisionDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "default",
  required = true,
  placeholder,
  initialValue = "",
  loading,
  onClose,
  onConfirm,
}: DecisionDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
    setError("");
  }, [initialValue, open]);

  if (!open) return null;

  const handleConfirm = async () => {
    const trimmedValue = value.trim();
    if (required && !trimmedValue) {
      setError("Trường này là bắt buộc.");
      return;
    }
    setError("");
    await onConfirm(trimmedValue);
  };

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center p-4
        bg-[rgba(4,8,15,0.72)] backdrop-blur-[10px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        className="w-[min(640px,100%)] flex flex-col gap-4 p-5 rounded-[1.35rem]
          border border-[rgba(127,150,186,0.14)]
          bg-gradient-to-b from-[rgba(19,31,53,0.98)] to-[rgba(11,20,37,0.96)]
          shadow-[0_24px_90px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex flex-col gap-1.5">
          <div className="text-[#8fc8ff] text-[0.8rem] font-bold tracking-[0.14em] uppercase">
            Hành động kiểm duyệt
          </div>
          <h3 className="text-[1.35rem] font-bold">{title}</h3>
          <p className="text-[#aeb9ca] text-sm">{description}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[#d9e2f1] text-[0.92rem] font-semibold">
            {required ? "Lý do hoặc ghi chú" : "Ghi chú (tùy chọn)"}
          </span>
          <textarea
            className={[
              "w-full px-[0.95rem] py-[0.85rem] rounded-[0.95rem] min-h-[8rem]",
              "border bg-[rgba(6,13,25,0.55)] text-[#eff4ff] outline-none resize-y",
              "transition-all duration-150",
              "focus:border-[rgba(130,177,255,0.65)] focus:shadow-[0_0_0_3px_rgba(67,114,240,0.18)]",
              error
                ? "border-[rgba(255,125,149,0.65)]"
                : "border-[rgba(125,147,184,0.16)]",
            ].join(" ")}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={5}
            value={value}
          />
          {error ? (
            <span className="text-[#ff9dad] text-[0.85rem]">{error}</span>
          ) : null}
        </label>

        <div className="flex justify-end gap-3 max-[720px]:flex-col">
          <Button onClick={onClose} type="button" variant="ghost">
            Hủy
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            loading={loading}
            onClick={() => void handleConfirm()}
            type="button"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
