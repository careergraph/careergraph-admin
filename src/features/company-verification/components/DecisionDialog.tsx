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
    if (!open) {
      return;
    }

    setValue(initialValue);
    setError("");
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleConfirm = async () => {
    const trimmedValue = value.trim();
    if (required && !trimmedValue) {
      setError("This field is required.");
      return;
    }

    setError("");
    await onConfirm(trimmedValue);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="stack-sm">
          <div className="eyebrow">Moderation Action</div>
          <h3 className="dialog-title">{title}</h3>
          <p className="surface-copy">{description}</p>
        </div>

        <label className="field">
          <span className="field-label">
            {required ? "Reason or note" : "Optional note"}
          </span>
          <textarea
            className={`textarea${error ? " input-error" : ""}`}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={5}
            value={value}
          />
          {error ? <span className="field-error">{error}</span> : null}
        </label>

        <div className="dialog-actions">
          <Button onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            className={tone === "danger" ? "button-danger" : undefined}
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
