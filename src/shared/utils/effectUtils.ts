import type { EffectMode, ItemType } from "../types/veil-grey";

export const getAllowedModes = (type: ItemType): EffectMode[] => {
  switch (type) {
    case "EQUIPABLE":
    case "ACTIVE":
      return ["FIXED", "OPTIONAL"];
    case "KIT":
      return ["OPTIONAL"];
    case "CONSUMABLE":
      return ["OPTIONAL", "TEMP"];
    case "RECHARGEABLE":
    case "CONTAINER":
    case "MATERIAL":
    default:
      return [];
  }
};
