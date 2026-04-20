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
        {checked && (
          <div className="w-1.5 h-1.5 bg-[var(--theme-background)]" />
        )}
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
    "font-bold uppercase tracking-widest transition-colors disabled:opacity-10 disabled:cursor-not-allowed disabled:pointer-events-none group";
  const sizeClasses =
    size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs";
  const variants = {
    primary:
      "border border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black",
    success:
      "border bg-[var(--theme-success)]/20 border-[var(--theme-success)]/50 text-[var(--theme-success)] hover:text-[var(--theme-accent)] hover:bg-[var(--theme-success)]",
    danger:
      "border bg-[var(--theme-danger)]/20 border-[var(--theme-danger)]/50 text-[var(--theme-accent)] hover:bg-[var(--theme-danger)]",
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

interface NumberStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
  size?: "sm" | "md";
}

export function NumberStepper({
  value,
  onIncrement,
  onDecrement,
  disableIncrement = false,
  disableDecrement = false,
  size = "md",
}: NumberStepperProps) {
  const btnClass = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  const valClass = size === "sm" ? "w-8" : "w-10";

  return (
    <div className="flex items-stretch bg-[var(--theme-border)]/40 shrink-0">
      <Button
        variant="danger"
        size="sm"
        className={`${btnClass} flex items-center justify-center border-r-0 ition-colors`}
        onClick={onDecrement}
        disabled={disableDecrement}
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 10L1 6L15 6V10L1 10Z" fill="currentColor" />
        </svg>
      </Button>
      <div
        className={`${valClass} flex flex-col items-center justify-center bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)] py-1`}
      >
        <span className="text-sm font-bold text-[var(--theme-accent)] leading-none">
          {value}
        </span>
      </div>
      <Button
        variant="success"
        size="sm"
        className={`${btnClass} flex items-center justify-center border-l-0 transition-colors`}
        onClick={onIncrement}
        disabled={disableIncrement}
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z"
            fill="currentColor"
          />
        </svg>
      </Button>
    </div>
  );
}
