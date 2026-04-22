import { useMemo } from "react";
import { useCharacterStore } from "../../features/character/store";
import { VG_CONFIG } from "../config/system.config";
import { buildSustenanceStages } from "../utils/mathUtils";
import type { SustenanceState } from "../types/veil-grey";

export function useCharacterStats() {
  const { attributes, inventory, hp, sustenance } = useCharacterStore();

  return useMemo(() => {
    const rules = VG_CONFIG.rules;

    const secondaryAttributes = {
      agility: Math.floor((attributes.dexterity + attributes.instinct) / 2),
      mass: attributes.strength + attributes.constitution,
      mental_health: Math.floor(
        (attributes.intelligence + attributes.wisdom) / 2,
      ),
      perception: Math.floor(
        (attributes.intelligence + attributes.instinct) / 2,
      ),
    };

    const maxHp: number = rules.baseHp;
    const maxInsanity = rules.baseInsanity + secondaryAttributes.mental_health;
    const maxSustenance = rules.baseSustenance + secondaryAttributes.mass;
    const maxLoad = rules.baseLoad + secondaryAttributes.mass;

    const currentLoad = inventory.reduce((total, item) => {
      if (!item.isCarried || item.parentId !== null) return total;
      const itemTotalSlots = item.slots * item.quantity;
      const hasProps =
        (item.type === "CONTAINER" || item.type === "EQUIPABLE") &&
        item.containerProps;

      if (hasProps && item.containerProps) {
        const props = item.containerProps;
        const inside = inventory
          .filter((i) => i.parentId === item.id && i.isCarried)
          .reduce((s, i) => s + i.slots * i.quantity, 0);

        let activeRed = 0;
        if (item.type === "CONTAINER") {
          activeRed = Math.min(props.slotReduction, inside);
        } else if (item.type === "EQUIPABLE") {
          activeRed = item.isEquipped
            ? Math.min(props.slotReduction, inside)
            : 0;
        }
        return total + itemTotalSlots + (inside - activeRed);
      }

      if (item.type === "RECHARGEABLE") {
        const reductionPerUnit = item.perItemSlotReduction || 0;
        const inside = inventory
          .filter((i) => i.parentId === item.id && i.isCarried)
          .reduce((s, i) => {
            const reducedSlotPerUnit = Math.max(0, i.slots - reductionPerUnit);
            return s + reducedSlotPerUnit * i.quantity;
          }, 0);
        return total + itemTotalSlots + inside;
      }

      return total + itemTotalSlots;
    }, 0);

    const isOverweight = currentLoad > maxLoad;

    const hpPorc = maxHp === 0 ? 0 : (hp.current / maxHp) * 100;
    const isInjured = hp.autoApplyInjury
      ? hpPorc <= rules.thresholdInjured
      : hp.isInjured;
    const isVeryInjured = hp.autoApplyInjury
      ? hpPorc <= rules.thresholdCrit
      : hp.isVeryInjured;

    let sustenanceState: SustenanceState = "FULL";
    const sustanceStages = buildSustenanceStages(maxSustenance);
    if (sustenance.current <= sustanceStages[0] - 1)
      sustenanceState = "STARVING";
    else if (sustenance.current <= sustanceStages[0] - 1 + sustanceStages[1])
      sustenanceState = "HUNGRY";
    else if (
      sustenance.current <=
      sustanceStages[0] - 1 + sustanceStages[1] + sustanceStages[2]
    )
      sustenanceState = "SATIATED";

    return {
      secondaryAttributes,
      maxHp,
      maxInsanity,
      maxSustenance,
      maxLoad,
      currentLoad,
      isOverweight,
      isInjured,
      isVeryInjured,
      sustenanceState,
      sustanceStages,
    };
  }, [attributes, inventory, hp, sustenance]);
}
