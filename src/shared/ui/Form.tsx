import type { InputHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-[var(--theme-background)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors placeholder-[var(--theme-accent)]/30 font-mono tracking-wider rounded-none ${props.className || ""}`}
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer hover:bg-[var(--theme-accent)]/5 p-1 transition-colors font-mono text-[10px] text-[var(--theme-accent)] font-bold tracking-widest uppercase ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`w-3.5 h-3.5 flex items-center justify-center border-2 border-[var(--theme-accent)] rotate-45 transition-all duration-300 ${checked ? "bg-[var(--theme-accent)] shadow-[0_0_8px_var(--theme-accent)]" : "bg-black"}`}
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
    "font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none rounded-none group";
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-xs";
  const variants = {
    primary:
      "border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black hover:shadow-[0_0_10px_var(--theme-accent)]",
    success:
      "border-2 border-[var(--theme-success)] bg-[var(--theme-success)]/10 text-[var(--theme-success)] hover:bg-[var(--theme-success)] hover:text-white hover:shadow-[0_0_10px_var(--theme-success)]",
    danger:
      "border-2 border-[var(--theme-danger)] bg-[var(--theme-danger)]/10 text-[var(--theme-danger)] hover:bg-[var(--theme-danger)] hover:text-white hover:shadow-[0_0_10px_var(--theme-danger)]",
    warning:
      "border-2 border-[var(--theme-warning)] bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] hover:bg-[var(--theme-warning)] hover:text-black hover:shadow-[0_0_10px_var(--theme-warning)]",
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
  const btnClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const valClass = size === "sm" ? "w-10" : "w-12";

  return (
    <div className="flex items-stretch shrink-0">
      <Button
        variant="danger"
        size="sm"
        className={`${btnClass} flex items-center justify-center border-r-0`}
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
        className={`${valClass} flex flex-col items-center justify-center bg-black border-y-2 border-[var(--theme-accent)]`}
      >
        <span className="text-sm font-black text-[var(--theme-accent)] font-mono leading-none">
          {value}
        </span>
      </div>
      <Button
        variant="success"
        size="sm"
        className={`${btnClass} flex items-center justify-center border-l-0`}
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
