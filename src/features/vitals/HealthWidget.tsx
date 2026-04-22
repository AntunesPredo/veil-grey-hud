import { motion } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { useVitalsStore } from "./useVitalsStore";
import { Button, Checkbox } from "../../shared/ui/Form";
import type { EquipableItem } from "../../shared/types/veil-grey";

export function HealthWidget() {
  const { hp, toggleAutoInjury, setManualInjury, inventory } =
    useCharacterStore();
  const { maxHp, isInjured, isVeryInjured } = useCharacterStats();
  const { openModal } = useVitalsStore();

  const equippedArmor = inventory.find(
    (i) => i.isEquipped && (i as EquipableItem).armorProps,
  ) as EquipableItem;
  const hpPorc = (hp.current / maxHp) * 100;
  console.log({ equippedArmor });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-[0.2em]">
            SINAIS VITAIS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--theme-accent)] glow-text">
              {hp.current}
            </span>
            <span className="text-xs text-[var(--theme-text)]/40">
              / {maxHp} PV
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => openModal("DAMAGE")}
            className="h-10 px-4 border-dashed text-[10px]"
          >
            [ REGISTAR TRAUMA ]
          </Button>
          <Button
            variant="success"
            onClick={() => openModal("HEALING")}
            className="h-10 px-4 border-dashed text-[10px]"
          >
            [ INJETAR CURA ]
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 bg-[var(--theme-background)] p-2 border border-[var(--theme-border)] shadow-inner">
        {equippedArmor && (
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[8px] font-bold text-[var(--theme-warning)] uppercase tracking-widest">
              <span>ESTRUTURA BALÍSTICA: {equippedArmor.name}</span>
              <span>
                {equippedArmor.armorProps?.pe} /{" "}
                {equippedArmor.armorProps?.maxPe} PE
              </span>
            </div>
            <div className="h-1.5 bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/30 w-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--theme-warning)]"
                animate={{
                  width: `${(equippedArmor.armorProps!.pe / equippedArmor.armorProps!.maxPe) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {hp.temp > 0 && (
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[8px] font-bold text-[var(--theme-success)] uppercase tracking-widest">
              <span>PROTEÇÃO NEURAL / TEMP</span>
              <span>{hp.temp} PT</span>
            </div>
            <div className="h-1.5 bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/30 w-full overflow-hidden">
              <div className="h-full bg-[var(--theme-success)] w-full animate-pulse" />
            </div>
          </div>
        )}

        <div className="h-4 bg-[var(--theme-accent)]/5 border border-[var(--theme-accent)]/20 w-full relative overflow-hidden mt-1">
          <motion.div
            className={`h-full transition-colors duration-500 ${isVeryInjured ? "bg-[var(--theme-danger)]" : isInjured ? "bg-[var(--theme-warning)]" : "bg-[var(--theme-accent)]"}`}
            animate={{ width: `${Math.min(hpPorc, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 bg-[var(--theme-accent)]/5 border border-[var(--theme-border)]">
        <div className="col-span-2 border-b border-[var(--theme-border)] pb-2 mb-1">
          <Checkbox
            label="AUTO-APLICAR FERIMENTOS"
            checked={hp.autoApplyInjury}
            onChange={toggleAutoInjury}
          />
        </div>
        <Checkbox
          label="MACHUCADO"
          checked={isInjured}
          onChange={() => setManualInjury("isInjured", !hp.isInjured)}
          disabled={hp.autoApplyInjury}
        />
        <Checkbox
          label="CRÍTICO"
          checked={isVeryInjured}
          onChange={() => setManualInjury("isVeryInjured", !hp.isVeryInjured)}
          disabled={hp.autoApplyInjury}
        />
      </div>
    </div>
  );
}
