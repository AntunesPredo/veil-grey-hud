import React from 'react';

export type CutCornerPreset = 'top-left' | 'bottom-edges' | 'bottom-right' | 'none';

export interface HardwarePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerSize?: number;
  borderWidth?: number;
  borderColorClass?: string;
  innerColorClass?: string;
  preset?: CutCornerPreset;
  innerClassName?: string;
}

export function getClipPath(preset: CutCornerPreset, size: number) {
  if (size <= 0) return 'none';
  switch (preset) {
    case 'top-left':
      return `polygon(${size}px 0, 100% 0, 100% 100%, 0 100%, 0 ${size}px)`;
    case 'bottom-edges':
      return `polygon(0 0, 100% 0, calc(100% - ${size}px) 100%, ${size}px 100%)`;
    case 'bottom-right':
      return `polygon(0 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%)`;
    case 'none':
    default:
      return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
  }
}

export const HardwarePanel = React.forwardRef<HTMLDivElement, HardwarePanelProps>(
  (
    {
      cornerSize = 12,
      borderWidth = 2,
      borderColorClass = 'bg-[var(--theme-border)]',
      innerColorClass = 'bg-[var(--theme-background)]',
      preset = 'top-left',
      className = '',
      innerClassName = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const outerPath = getClipPath(preset, cornerSize);
    // Inner polygon shrinks slightly to maintain parallel diagonals
    const innerPath = getClipPath(preset, Math.max(0, cornerSize - 1));

    return (
      <div
        ref={ref}
        className={`relative ${borderColorClass} ${className}`}
        style={{
          ...style,
          padding: `${borderWidth}px`,
          clipPath: outerPath,
          WebkitClipPath: outerPath,
        }}
        {...props}
      >
        <div
          className={`w-full h-full relative ${innerColorClass} ${innerClassName}`}
          style={{
            clipPath: innerPath,
            WebkitClipPath: innerPath,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

HardwarePanel.displayName = 'HardwarePanel';
