import type { CustomEffect } from "../../shared/types/veil-grey";
import { Button } from "../../shared/ui/Form";

export type EffectsListProps = {
  effects: CustomEffect[];
  onRemove: (id: number) => void;
};

export function EffectsList({ effects, onRemove }: EffectsListProps) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[var(--theme-border)] border-dashed">
      {effects.map((eff) => (
        <div
          key={eff.id}
          className="flex justify-between items-center bg-[var(--theme-accent)]/5 border border-[var(--theme-accent)]/20 px-2 py-1"
        >
          <span className="text-[12px] uppercase font-mono tracking-wider">
            <span
              className={`font-bold ${eff.val === 0 ? "text-[var(--theme-accent)]" : eff.val > 0 ? "text-[var(--theme-success)]" : "text-[var(--theme-danger)]"}`}
            >
              [{eff.val > 0 ? "+" : ""}
              {eff.val}]
            </span>{" "}
            {eff.description}{" "}
            <span className="text-[var(--theme-text)]">
              [{eff.target.replace("_", ":")}]
            </span>
          </span>
          <Button
            size="sm"
            variant="danger"
            className="border-none py-0"
            onClick={() => onRemove(eff.id)}
          >
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </div>
      ))}
    </div>
  );
}
