import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, ...props },
  ref
) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className={`input${error ? " input-error" : ""}`} ref={ref} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
});
