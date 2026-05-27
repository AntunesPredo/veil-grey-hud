interface HardwareGaugeProps {
  current: number;
  max: number;
  color?: string;
}

export function HardwareGauge({
  current,
  max,
  color = "var(--theme-warning)",
}: HardwareGaugeProps) {
  const blocksToRender = Math.min(max, 30);

  return (
    <div className="flex gap-[2px] items-center shrink-0">
      {Array.from({ length: blocksToRender }).map((_, i) => (
        <svg key={i} width="6" height="10" viewBox="0 0 6 10" className="block">
          <rect
            x="0"
            y="0"
            width="6"
            height="10"
            fill={i < current ? color : "transparent"}
            stroke={color}
            strokeWidth="1"
            className="transition-colors duration-300"
          />
        </svg>
      ))}
      {max > 30 && (
        <span className="text-[8px] ml-1" style={{ color }}>
          +
        </span>
      )}
    </div>
  );
}
