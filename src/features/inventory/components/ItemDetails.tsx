import type { Item, CustomEffect } from "../../../shared/types/veil-grey";

export function ItemDetails({ item }: { item: Item }) {
  if (!item.description && (!item.effects || item.effects.length === 0))
    return null;

  return (
    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[var(--theme-border)] border-dashed">
      {item.description && (
        <span className="text-[10px] text-[var(--theme-text)]/80 italic leading-relaxed border-l-2 border-[var(--theme-accent)]/30 pl-2">
          {item.description}
        </span>
      )}

      {item.effects && item.effects.length > 0 && (
        <div className="flex flex-col gap-1">
          {item.effects.map((eff: CustomEffect) => (
            <div
              key={eff.id}
              className="text-[9px] font-mono flex items-center gap-1 bg-[var(--theme-background)] px-1 py-0.5 border border-[var(--theme-border)] w-fit"
            >
              <span
                className={
                  eff.val > 0
                    ? "text-[var(--theme-success)]"
                    : "text-[var(--theme-danger)]"
                }
              >
                {eff.val > 0 ? "+" : ""}
                {eff.val}
              </span>
              <span className="text-[var(--theme-accent)]">[{eff.target}]</span>
              <span className="text-[var(--theme-text)]/50 italic">
                ({eff.mode})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
