import type { InputHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-[var(--theme-background)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors placeholder-[var(--theme-accent)]/30 font-mono tracking-wider rounded-none ${props.className || ""}`}
    />
  );
}


export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChangeText: (value: string) => void;
  step?: number;
}

export function NumberInput({ value, onChangeText, step = 1, className = "", ...props }: NumberInputProps) {
  const handleDecrement = () => {
    const num = Number(value);
    if (!isNaN(num)) onChangeText(String(num - step));
  };
  const handleIncrement = () => {
    const num = Number(value);
    if (!isNaN(num)) onChangeText(String(num + step));
  };

  return (
    <div className={`flex items-stretch group ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        className="px-3 border-2 border-r-0 border-[var(--theme-accent)]/50 text-[var(--theme-accent)]/50 hover:bg-[var(--theme-accent)] hover:text-black hover:border-[var(--theme-accent)] transition-colors flex items-center justify-center font-bold"
      >
        -
      </button>
      <input
        {...props}
        type="number"
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        className="w-full bg-[var(--theme-background)] border-y-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors placeholder-[var(--theme-accent)]/30 font-mono tracking-wider text-center text-2xl font-black [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none shadow-inner"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="px-3 border-2 border-l-0 border-[var(--theme-accent)]/50 text-[var(--theme-accent)]/50 hover:bg-[var(--theme-accent)] hover:text-black hover:border-[var(--theme-accent)] transition-colors flex items-center justify-center font-bold"
      >
        +
      </button>
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  fluid = false,
  colorClass = "text-[var(--theme-accent)]",
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  fluid?: boolean;
  colorClass?: string;
}) {
  return (
    <label
      className={`flex items-center cursor-pointer transition-colors font-mono font-bold tracking-widest uppercase ${disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${fluid
          ? "w-full h-full justify-center gap-4 text-xs"
          : "gap-3 hover:bg-current/10 p-1 text-[10px]"
        } ${colorClass}`}
    >
      <div
        className={`flex items-center justify-center border-2 border-current rotate-45 transition-all duration-300 ${checked
          ? "bg-current shadow-[0_0_12px_currentColor] scale-110"
          : "bg-black"
          } ${fluid ? "w-4 h-4" : "w-3.5 h-3.5"}`}
      >
        {checked && (
          <div
            className={`bg-[var(--theme-background)] ${fluid ? "w-2 h-2" : "w-1.5 h-1.5"
              }`}
          />
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      <span className={checked && fluid ? "drop-shadow-[0_0_8px_currentColor]" : ""}>
        {label}
      </span>
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
      "border-2 border-[var(--theme-success)] bg-[var(--theme-success)]/10 text-white hover:bg-[var(--theme-success)] hover:text-white hover:shadow-[0_0_10px_var(--theme-success)]",
    danger:
      "border-2 border-[var(--theme-danger)] bg-[var(--theme-danger)]/10 text-white hover:bg-[var(--theme-danger)] hover:text-white hover:shadow-[0_0_10px_var(--theme-danger)]",
    warning:
      "border-2 border-[var(--theme-warning)] bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] hover:bg-[var(--theme-warning)] hover:text-white hover:shadow-[0_0_10px_var(--theme-warning)]",
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

export interface MultiNumberStepperProps {
  value: number;
  max?: number;
  onChange: (amount: number) => void;
  label?: string;
}

export function MultiNumberStepper({
  value,
  max,
  onChange,
  label = "HP",
}: MultiNumberStepperProps) {
  return (
    <div className="flex items-stretch shrink-0">
      <Button
        variant="danger"
        size="sm"
        className="h-8 flex items-center justify-center border-r-0 px-1 text-[10px] min-w-[28px]"
        onClick={() => onChange(-10)}
      >
        -10
      </Button>
      <Button
        variant="danger"
        size="sm"
        className="h-8 flex items-center justify-center border-r-0 px-1 text-[10px] min-w-[28px] border-l border-l-[var(--theme-danger)]"
        onClick={() => onChange(-5)}
      >
        -5
      </Button>
      <Button
        variant="danger"
        size="sm"
        className="h-8 flex items-center justify-center border-r-0 px-1 text-[10px] min-w-[28px] border-l border-l-[var(--theme-danger)]"
        onClick={() => onChange(-1)}
      >
        -1
      </Button>

      <div className="px-3 flex flex-col items-center justify-center bg-black border-y-2 border-[var(--theme-accent)]">
        <span className="text-[12px] font-black text-[var(--theme-accent)] font-mono leading-none uppercase tracking-widest">
          {label}: {value}{max !== undefined ? `/${max}` : ""}
        </span>
      </div>

      <Button
        variant="success"
        size="sm"
        className="h-8 flex items-center justify-center border-l-0 px-1 text-[10px] min-w-[28px]"
        onClick={() => onChange(1)}
      >
        +1
      </Button>
      <Button
        variant="success"
        size="sm"
        className="h-8 flex items-center justify-center border-l-0 px-1 text-[10px] min-w-[28px] border-r border-r-[var(--theme-success)]"
        onClick={() => onChange(5)}
      >
        +5
      </Button>
      <Button
        variant="success"
        size="sm"
        className="h-8 flex items-center justify-center border-l-0 px-1 text-[10px] min-w-[28px] border-r-2 border-r-[var(--theme-success)]"
        onClick={() => onChange(10)}
      >
        +10
      </Button>
    </div>
  );
}

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  labelMap?: Record<number, string>;
  title?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  labelMap,
  title,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col w-full gap-4 my-2">
      {title && (
        <span className="text-[10px] font-bold tracking-widest text-[var(--theme-accent)] uppercase">
          {title}
        </span>
      )}

      <div className="relative w-full h-8 flex items-center group">
        <div className="absolute w-full h-1 bg-black border border-[var(--theme-accent)]/30 top-1/2 -translate-y-1/2" />

        <div
          className="absolute h-1 bg-[var(--theme-accent)] top-1/2 -translate-y-1/2 shadow-[0_0_8px_var(--theme-accent)] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div
          className="absolute w-4 h-4 bg-black border-2 border-[var(--theme-accent)] rotate-45 top-1/2 -translate-y-1/2 shadow-[0_0_10px_var(--theme-accent)] transition-all duration-300 pointer-events-none group-hover:scale-125 group-hover:bg-[var(--theme-accent)]"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono font-bold text-[var(--theme-accent)]/70">
          {labelMap ? labelMap[min] : min}
        </span>
        <span className="text-[11px] font-mono font-black text-[var(--theme-accent)] uppercase px-2 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]">
          {labelMap && labelMap[value] ? labelMap[value] : value}
        </span>
        <span className="text-[9px] font-mono font-bold text-[var(--theme-accent)]/70">
          {labelMap ? labelMap[max] : max}
        </span>
      </div>
    </div>
  );
}
