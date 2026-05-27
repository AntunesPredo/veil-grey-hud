interface TelemetryBarProps {
  percentage: number;
}

export function TelemetryBar({ percentage }: TelemetryBarProps) {
  const safePct = Math.min(Math.max(percentage, 0), 100);

  let colorClass = "var(--theme-accent)";
  let isDanger = false;

  if (safePct <= 25) {
    colorClass = "var(--theme-danger)";
    isDanger = true;
  } else if (safePct <= 50) {
    colorClass = "var(--theme-warning)";
  }

  return (
    <div className="flex items-center gap-1 w-[60px] md:w-[80px]">
      <svg
        width="100%"
        height="10"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <rect
          x="0"
          y="0"
          width="100"
          height="10"
          fill="transparent"
          stroke="var(--theme-border)"
          strokeWidth="2"
        />
        <rect
          x="1"
          y="1"
          width={Math.max(0, safePct - 2)}
          height="8"
          fill={colorClass}
          className={`transition-all duration-500 ${isDanger ? "animate-pulse" : ""}`}
        />
      </svg>
    </div>
  );
}
