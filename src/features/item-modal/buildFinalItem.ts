import type { ItemFormData } from "./ItemModal";
import type {
  ActiveItem,
  ConsumableItem,
  ContainerItem,
  EquipableItem,
  Item,
  KitItem,
  MaterialItem,
  RechargeableItem,
} from "../../shared/types/veil-grey";

export const buildFinalItem = (data: ItemFormData): Item => {
  const base = {
    id: data.id || Date.now(),
    name: data.name.trim(),
    description: data.description.trim(),
    slots: data.slots,
    quantity: data.quantity,
    isCarried: true,
    isEquipped: false,
    parentId: null,
    drawer: data.drawer || null,
    effects: data.effects || [],
    svgId: data.svgId,
  };

  switch (data.type) {
    case "MATERIAL":
      return { ...base, type: "MATERIAL" } as MaterialItem;
    case "CONSUMABLE":
      return {
        ...base,
        type: "CONSUMABLE",
        uses: data.uses,
        maxUses: data.maxUses,
        commsType: data.commsType || "",
      } as ConsumableItem;
    case "RECHARGEABLE":
      return {
        ...base,
        type: "RECHARGEABLE",
        uses: data.uses,
        maxUses: data.maxUses,
        commsType: data.commsType || "",
        perItemSlotReduction: data.perItemSlotReduction || 0,
      } as RechargeableItem;
    case "ACTIVE":
      return {
        ...base,
        type: "ACTIVE",
        uses: data.uses,
        maxUses: data.maxUses,
        quality: data.quality || 1,
        condition: data.condition || 100,
        commsType: data.commsType || "",
        requiresAmmo: data.requiresAmmo,
        skillId: data.skillId,
      } as ActiveItem;
    case "KIT":
      return {
        ...base,
        type: "KIT",
        uses: data.uses,
        maxUses: data.maxUses,
        skillId: data.skillId,
        commsType: data.commsType || "",
      } as KitItem;
    case "CONTAINER":
      return {
        ...base,
        type: "CONTAINER",
        containerProps: data.containerProps,
      } as ContainerItem;
    case "EQUIPABLE":
      return {
        ...base,
        type: "EQUIPABLE",
        containerProps: data.containerProps,
      } as EquipableItem;
  }
};
