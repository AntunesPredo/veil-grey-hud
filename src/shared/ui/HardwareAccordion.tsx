import React, { useState } from 'react';
import { HardwarePanel } from './HardwarePanel';

export interface HardwareAccordionProps {
  title: string;
  count?: number;
  colorTheme?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HardwareAccordion({
  title,
  count,
  colorTheme = 'border-[var(--theme-border)] text-[var(--theme-border)]',
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
}: HardwareAccordionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  const textColorClass = colorTheme.replace('border-', 'text-');
  const borderColorClass = colorTheme;

  return (
    <div className="flex flex-col w-full mb-4">
      <div className="transition-all duration-300">
        <HardwarePanel
          preset="top-left"
          cornerSize={12}
          borderWidth={2}
          borderColorClass={`cursor-pointer group ${borderColorClass}`}
          innerColorClass={`transition-colors duration-300 ${isOpen ? 'bg-[#181818]' : 'bg-[#0f0f0f] group-hover:bg-[#141414]'}`}
          onClick={handleToggle}
          className="h-14 w-full select-none"
          innerClassName="flex items-center justify-between px-4 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(255,255,255,0.02)_4px,rgba(255,255,255,0.02)_8px)]"
        >
          <div className="flex items-center gap-3">
            {count !== undefined && (
              <span className="font-mono font-bold text-[var(--theme-accent)] tracking-widest text-sm bg-black/40 px-2 py-0.5 border border-white/5">
                {count.toString().padStart(2, '0')}
              </span>
            )}
            <h3 className={`font-bold uppercase tracking-widest ${textColorClass} text-sm md:text-base ${isOpen ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}>
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-center text-[var(--theme-accent)]">
            {isOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M4 15L12 7L20 15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M4 9L12 17L20 9" />
              </svg>
            )}
          </div>
        </HardwarePanel>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
