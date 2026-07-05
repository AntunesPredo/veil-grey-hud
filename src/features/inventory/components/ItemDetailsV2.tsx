import { Markdown } from "../../../shared/ui/Markdown";
import { GlitchImage } from "../../../shared/ui/GlitchImage";
import { EffectsList } from "../../../shared/ui/EffectsList";
import type { Item, CustomEffect } from "../../../shared/types/veil-grey";
import { useSystemData } from "../../../shared/hooks/useSystemData";

interface ItemDetailsV2Props {
  item: Item;
  inheritedEffects?: CustomEffect[];
}

export function ItemDetailsV2({
  item,
  inheritedEffects = [],
}: ItemDetailsV2Props) {
  const hasInstantActions =
    "instantActions" in item &&
    Array.isArray(item.instantActions) &&
    item.instantActions.length > 0;

  const { attributes } = useSystemData();

  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-[var(--theme-border)] mt-2">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1 mb-3 text-[11px]">
          <span className="bg-[var(--theme-background)] border border-[var(--theme-border)] px-1.5 py-0.5 font-bold tracking-widest text-[var(--theme-text)]/70">
            TYPE: {item.type}
          </span>

          {item.type !== "MATERIAL" &&
            item.type !== "CONTAINER" &&
            item.type !== "EQUIPABLE" &&
            item.commsType && (
              <span className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/30 text-[var(--theme-warning)] px-1.5 py-0.5 font-bold tracking-widest">
                BASE: {item.commsType}
              </span>
            )}

          {item.type === "CONSUMABLE" && (item.bonusDamage || 0) > 0 && (
            <span className="bg-[var(--theme-danger)]/10 border border-[var(--theme-danger)]/30 text-[var(--theme-danger)] px-1.5 py-0.5 font-bold tracking-widest">
              DMG MOD: +{item.bonusDamage}
            </span>
          )}
        </div>

        {item.type === "ACTIVE" &&
          item.combatProps &&
          item.combatProps.weaponType !== "NONE" && (
            <div className="flex flex-1 justify-center gap-2 text-[12px] font-mono opacity-70">
              <span>DANO: {item.combatProps.baseDamage}</span> |
              <span>ALCANCE: {item.combatProps.range}</span>|
              {item.combatProps.weaponType === "RANGED" ? (
                <span>BASE DIFF: {item.combatProps.baseDifficulty}</span>
              ) : (
                <>
                  <span>ESCALA: {item.combatProps.scalingTier}</span>|
                  <span>
                    ATT:{" "}
                    {attributes.find(
                      (e) => e.id === item.combatProps?.scalingAttr,
                    )?.short ?? "-"}
                  </span>
                </>
              )}
            </div>
          )}
      </div>

      <div className="text-[11px] text-[var(--theme-accent)] leading-relaxed">
        {"imageUrl" in item && item.imageUrl && (
          <div className="float-left mr-3 w-[180px] max-w-[40%]">
            <div className="overflow-hidden border border-[var(--theme-border)] bg-black/50">
              <GlitchImage
                src={item.imageUrl as string}
                alt={item.name}
                noLoad
                canZoom
                className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
              />
            </div>
          </div>
        )}

        {item.wallet && (
          <div className="border-l-2 border-emerald-500 pl-3 mb-2 bg-emerald-900/10 p-2 text-emerald-400 font-mono text-[10px]">
            <div className="font-bold tracking-widest mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              CARTEIRA DIGITAL
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Moeda: {item.wallet.type === "CC" ? "Corp Credit (CC)" : "Fuck Corp Credit (FCC)"}</span>
              <span>Saldo Atual: {item.wallet.value}</span>
              <span>Limite: {item.wallet.max === null ? "Ilimitado" : item.wallet.max}</span>
            </div>
          </div>
        )}

        {item.description && (
          <div className="border-l-2 border-[var(--theme-accent)] pl-3">
            <Markdown content={item.description} />
          </div>
        )}

        <div className="clear-both" />
      </div>

      {hasInstantActions && (
        <div className="flex flex-col gap-1 border-t border-dashed border-[var(--theme-border)] pt-2">
          <span className="text-[9px] text-[var(--theme-success)] uppercase font-bold tracking-widest">
            AÇÕES IMEDIATAS (ON USE)
          </span>
          {item.instantActions.map((act) => (
            <div
              key={act.id}
              className="flex gap-2 text-[10px] font-mono text-[var(--theme-success)] bg-[var(--theme-success)]/10 px-2 py-1"
            >
              <span className="font-bold">
                [{act.target.replace("_", ":")}]
              </span>
              <span>
                {act.description} ({act.val > 0 ? `+${act.val}` : act.val})
              </span>
            </div>
          ))}
        </div>
      )}

      <EffectsList effects={item.effects} />
      {inheritedEffects.length > 0 && (
        <EffectsList
          effects={inheritedEffects}
          title="EFEITOS HERDADOS (CARGA/MUNIÇÃO)"
        />
      )}
    </div>
  );
}
