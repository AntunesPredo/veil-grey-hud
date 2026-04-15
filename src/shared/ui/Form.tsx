import type { InputHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-transparent border border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-2 py-1 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors placeholder-[var(--theme-accent)]/30 font-mono ${props.className || ""}`}
    />
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 font-mono text-[10px] text-[var(--theme-accent)] tracking-wider">
      <div
        className={`w-3 h-3 flex items-center justify-center border border-[var(--theme-accent)] rotate-45 transition-colors ${checked ? "bg-[var(--theme-accent)]" : "bg-black"}`}
      >
        {checked && <div className="w-1.5 h-1.5 bg-black" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      {label}
    </label>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "warning";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClasses =
    size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs";
  const variants = {
    primary:
      "border border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black",
    success:
      "border border-[var(--theme-success)]/50 text-[var(--theme-success)] hover:bg-[var(--theme-success)]/20",
    danger:
      "border border-[var(--theme-danger)]/50 text-[var(--theme-danger)] hover:bg-[var(--theme-danger)]/20",
    warning:
      "border border-[var(--theme-warning)]/50 text-[var(--theme-warning)] hover:bg-[var(--theme-warning)]/20",
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${sizeClasses} ${variants[variant]} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
