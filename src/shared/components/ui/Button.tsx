import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-br from-[#4372f0] to-[#1d9a8b] text-white border-transparent",
  secondary:
    "border-[rgba(118,145,184,0.22)] bg-[rgba(19,31,53,0.82)] text-[#e5ecf8]",
  ghost: "bg-transparent border-transparent text-[#dbe4f4]",
  danger:
    "bg-gradient-to-br from-[#a33748] to-[#862a56] text-[#fff1f3] border-[rgba(255,136,153,0.22)]",
};

export function Button({
  children,
  className,
  loading,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 min-h-[2.9rem] px-4 py-3",
        "rounded-[0.95rem] border transition-all duration-150 text-sm font-medium",
        "enabled:hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}
