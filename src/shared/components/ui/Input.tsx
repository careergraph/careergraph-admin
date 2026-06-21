import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[#d9e2f1] text-[0.92rem] font-semibold">{label}</span>
      <input
        className={cn(
          "w-full min-h-[3rem] px-[0.95rem] py-[0.85rem] rounded-[0.95rem]",
          "border bg-[rgba(6,13,25,0.55)] text-[#eff4ff] outline-none",
          "transition-all duration-150",
          "focus:border-[rgba(130,177,255,0.65)] focus:shadow-[0_0_0_3px_rgba(67,114,240,0.18)]",
          error
            ? "border-[rgba(255,125,149,0.65)]"
            : "border-[rgba(125,147,184,0.16)]",
          className
        )}
        ref={ref}
        {...props}
      />
      {error ? (
        <span className="text-[#ff9dad] text-[0.85rem]">{error}</span>
      ) : null}
    </label>
  );
});
