import type { Item, CustomEffect } from "../../../shared/types/veil-grey";
import { EffectsList } from "../../../shared/ui/EffectsList";

interface ItemDetailsProps {
  item: Item;
  inheritedEffects?: CustomEffect[];
}

export function ItemDetails({ item, inheritedEffects = [] }: ItemDetailsProps) {
  const hasOwnEffects = item.effects && item.effects.length > 0;
  const hasInheritedEffects = inheritedEffects && inheritedEffects.length > 0;

  if (
    !item.description &&
    !hasOwnEffects &&
    !hasInheritedEffects &&
    item.type !== "ACTIVE"
  )
    return null;

  return (
    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[var(--theme-border)] border-dashed">
      {item.type === "ACTIVE" && item.requiresAmmo && (
        <span className="text-[9px] bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] border border-[var(--theme-warning)]/30 px-2 py-1 w-fit font-bold tracking-widest">
          REQUER MUNIÇÃO: {item.commsType}
        </span>
      )}
      {item.description && (
        <span className="text-[10px] text-[var(--theme-text)]/80 italic leading-relaxed border-l-2 border-[var(--theme-accent)]/30 pl-2">
          {item.description}
        </span>
      )}
      <EffectsList effects={item.effects} />
      <EffectsList
        effects={inheritedEffects}
        title="EFEITOS DA MUNIÇÃO / CARGA INTERNA:"
      />
    </div>
  );
}
