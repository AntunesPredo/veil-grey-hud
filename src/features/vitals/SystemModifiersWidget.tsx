import { CustomEffectModal } from "../stats/CustomEffectModal";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import type { CustomEffectTarget } from "../../shared/types/veil-grey";
import { Button } from "../../shared/ui/Form";
import { useCharacterStore } from "../character/store";
import { EffectsList } from "../../shared/ui/EffectsList";

export function SystemModifiersWidget() {
  const { customEffects, removeCustomEffect } = useCharacterStore();
  const effectModal = useDisclosure();

  const renderMod = (val: number) => {
    const value = val || 0;
    return (
      <span
        className={`font-mono font-bold ${value > 0 ? "text-[var(--theme-success)]" : value < 0 ? "text-[var(--theme-danger)]" : "text-[var(--theme-text)]"}`}
      >
        {value === 0 ? value : value > 0 ? `+${value}` : `-${value}`}
      </span>
    );
  };

  const sumModsByTarget = (target: CustomEffectTarget): number => {
    let value = 0;
    customEffects
      .filter((e) => e.target === target)
      .map((e) => (value += e.val));
    return value;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[var(--theme-accent)] font-bold border-b border-[var(--theme-border)] mb-1 pb-1">
            MODS DE ATRIBUTO
          </span>
          <div className="flex justify-between items-center text-[10px]">
            <span>FÍSICO</span> {renderMod(sumModsByTarget("ATT_PHYSICAL"))}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>MENTAL</span> {renderMod(sumModsByTarget("ATT_MENTAL"))}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>SOCIAL</span> {renderMod(sumModsByTarget("ATT_SOCIAL"))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[var(--theme-accent)] font-bold border-b border-[var(--theme-border)] mb-1 pb-1">
            MODS DE PERÍCIA
          </span>
          <div className="flex justify-between items-center text-[10px]">
            <span>FÍSICA</span> {renderMod(sumModsByTarget("SKILL_PHYSICAL"))}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>MENTAL</span> {renderMod(sumModsByTarget("SKILL_MENTAL"))}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>SOCIAL</span> {renderMod(sumModsByTarget("SKILL_SOCIAL"))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] border-t border-dashed border-[var(--theme-border)] pt-2">
        <span className="font-bold text-[var(--theme-text)]/50">
          MOD DE VIDA
        </span>
        {renderMod(sumModsByTarget("HP"))}
      </div>
      <div className="flex justify-between items-center text-[10px] border-t border-dashed border-[var(--theme-border)] pt-2">
        <span className="font-bold text-[var(--theme-text)]/50">
          MOD DE INSANIDADE
        </span>
        {renderMod(sumModsByTarget("INSANITY"))}
      </div>
      <div className="flex justify-between items-center text-[10px] border-t border-dashed border-[var(--theme-border)] pt-2">
        <span className="font-bold text-[var(--theme-text)]/50">
          MOD DE MOVIMENTO
        </span>
        {renderMod(sumModsByTarget("MOVEMENT"))}
      </div>

      <div className="border-t border-[var(--theme-accent)]/30 pt-4 mt-2">
        <Button
          className="w-full border-dashed text-[var(--theme-accent)] border-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] mb-2"
          onClick={effectModal.onOpen}
        >
          [+] ADICIONAR EFEITO GLOBAL
        </Button>

        <div className="max-h-[150px] overflow-y-auto custom-scrollbar">
          <EffectsList
            effects={customEffects.filter((e) => e.link === null)}
            onRemove={removeCustomEffect}
          />
        </div>
      </div>

      <CustomEffectModal
        isOpen={effectModal.isOpen}
        onClose={effectModal.onClose}
        allowedModes={["FIXED"]}
      />
    </div>
  );
}
