import { useCharacterStore } from "../../features/character/store";
import type { CustomEffect } from "../types/veil-grey";

export function useActiveModifiers() {
  const { customEffects, inventory } = useCharacterStore();

  const equippedItemEffects: CustomEffect[] = inventory
    .filter((i) => i.isEquipped)
    .flatMap((i) => i.effects?.filter((e) => e.mode === "FIXED") || []);

  const activeEffects = [...customEffects, ...equippedItemEffects];

  const getTargetSum = (target: string): number => {
    return activeEffects
      .filter((e) => e.target === target && e.mode !== "OPTIONAL")
      .reduce((sum, e) => sum + e.val, 0);
  };

  const getAttrMod = (attrId: string, categoryId: string) => {
    return getTargetSum(attrId) + getTargetSum(categoryId);
  };

  const getSkillMod = (skillId: string, categoryId: string) => {
    return getTargetSum(skillId) + getTargetSum(categoryId);
  };

  return {
    activeEffects,
    getTargetSum,
    getAttrMod,
    getSkillMod,
  };
}
