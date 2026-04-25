import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useCharacterStore } from "../../character/store";
import type {
  Item,
  Skill,
  CustomEffect,
} from "../../../shared/types/veil-grey";
import { dispatchDiscordLog } from "../../../shared/utils/discordWebhook";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { ItemHeader } from "./ItemHeader";
import { ItemActions } from "./ItemActions";
import { ItemDetails } from "./ItemDetails";
import { ItemRecursion } from "./ItemRecursion";
import { executeRawRoll } from "../../../shared/utils/diceEngine";
import { useSystemData } from "../../../shared/hooks/useSystemData";

type ItemNodeWrapperProps = {
  item: Item;
  allInventory: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragId: number | null;
  isEditMode: boolean;
  isOverlay?: boolean;
  isNestedAmmo?: boolean;
};

export const ItemNodeWrapper = React.memo(
  ({
    item,
    allInventory,
    onEdit,
    onDelete,
    activeDragId,
    isEditMode,
    isOverlay = false,
    isNestedAmmo = false,
  }: ItemNodeWrapperProps) => {
    const name = useCharacterStore((state) => state.name);
    const skills = useCharacterStore((state) => state.skills);
    const updateInventoryItem = useCharacterStore(
      (state) => state.updateInventoryItem,
    );
    const toggleEquipItem = useCharacterStore((state) => state.toggleEquipItem);
    const consumeItem = useCharacterStore((state) => state.consumeItem);
    const consumeRechargeable = useCharacterStore(
      (state) => state.consumeRechargeable,
    );

    const { getSkillById } = useSystemData();
    const [isDescOpen, setIsDescOpen] = useState(false);

    const childrenItems = useMemo(
      () => allInventory.filter((i) => i.parentId === item.id),
      [allInventory, item.id],
    );

    const isAbleToContain =
      (item.type === "CONTAINER" || item.type === "EQUIPABLE") &&
      !!item.containerProps;
    const isMicroContainer =
      item.type === "RECHARGEABLE" ||
      item.type === "KIT" ||
      (item.type === "ACTIVE" && "requiresAmmo" in item && item.requiresAmmo);
    const canEquip = item.parentId === null && item.isCarried;
    const isEquippableType =
      item.type === "EQUIPABLE" || item.type === "ACTIVE";

    const currentUses =
      item.type === "RECHARGEABLE" || item.type === "KIT"
        ? childrenItems
            .filter((i) => i.type === "CONSUMABLE")
            .reduce((sum, i) => sum + i.uses * i.quantity, 0)
        : "uses" in item
          ? item.uses
          : 0;

    let hasAmmo = true;
    if (item.type === "ACTIVE" && "requiresAmmo" in item && item.requiresAmmo) {
      const ammos = childrenItems.filter(
        (i) => i.type === "CONSUMABLE" && i.uses > 0,
      );
      let magAmmos = 0;
      childrenItems
        .filter((i) => i.type === "RECHARGEABLE")
        .forEach((mag) => {
          magAmmos += allInventory.filter(
            (i) =>
              i.parentId === mag.id && i.type === "CONSUMABLE" && i.uses > 0,
          ).length;
        });
      hasAmmo = ammos.length > 0 || magAmmos > 0;
    }
    const disableUse =
      item.type === "ACTIVE" &&
      (!item.isEquipped ||
        ("requiresAmmo" in item && item.requiresAmmo && !hasAmmo));
    const inheritedEffects = useMemo(() => {
      let effects: CustomEffect[] = [];
      if (
        item.type === "RECHARGEABLE" ||
        item.type === "KIT" ||
        (item.type === "ACTIVE" && "requiresAmmo" in item && item.requiresAmmo)
      ) {
        const ammos = childrenItems.filter((i) => i.type === "CONSUMABLE");
        const effMap = new Map();

        ammos.forEach((ammo) => {
          ammo.effects?.forEach((e) => {
            effMap.set(e.description + e.target + e.val, e);
          });
        });

        const rechargeables = childrenItems.filter(
          (i) => i.type === "RECHARGEABLE",
        );
        rechargeables.forEach((mag) => {
          allInventory
            .filter((i) => i.parentId === mag.id && i.type === "CONSUMABLE")
            .forEach((ammo) => {
              ammo.effects?.forEach((e) => {
                effMap.set(e.description + e.target + e.val, e);
              });
            });
        });

        effects = Array.from(effMap.values());
        return effects;
      }
    }, [item, childrenItems, allInventory]);

    const {
      attributes,
      listeners,
      setNodeRef: setDragRef,
      isDragging,
    } = useDraggable({
      id: item.id,
      data: item,
    });

    const { isOver, setNodeRef: setDropRef } = useDroppable({
      id: item.id,
      data: item,
      disabled: isDragging || (!isAbleToContain && !isMicroContainer),
    });

    const baseBgClass = isOverlay
      ? "bg-[var(--theme-background)]"
      : item.isCarried
        ? "bg-[var(--theme-background)]"
        : "bg-[var(--theme-background)] opacity-70 grayscale";
    const borderClass = item.isEquipped
      ? "border-[var(--theme-success)]"
      : "border-[var(--theme-border)]";
    const dropHighlight = isOver
      ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 shadow-[0_0_10px_var(--theme-accent)_inset] z-10"
      : "";

    const handleToggleEquip = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleEquipItem(item.id);
      const actionStr = !item.isEquipped ? "EQUIPOU" : "DESEQUIPOU";
      dispatchDiscordLog(
        "INVENTORY",
        name,
        ` **AÇÃO:** [${name}] ${actionStr} **${item.name}**.`,
      );
    };

    const handleUse = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disableUse) return;
      if (
        item.type === "MATERIAL" ||
        item.type === "CONTAINER" ||
        item.type === "EQUIPABLE"
      )
        return;

      if (item.type === "ACTIVE" && !item.isEquipped) {
        RetroToast.error("ITEM PRECISA ESTAR EQUIPADO PARA USO.");
        return;
      }

      if (item.type === "RECHARGEABLE" || item.type === "KIT") {
        if (currentUses > 0) {
          consumeRechargeable(item.id);
          let msg = ` **AÇÃO:** [${name}] utilizou **${item.name}**.`;
          if (item.type === "KIT" && item.skillId) {
            const itemSkill = getSkillById(item.skillId);
            const skillVal = skills[item.skillId as keyof typeof skills] || 0;
            const rollRes = executeRawRoll(`1d20+${skillVal}`);
            msg += `\n **ROLAGEM (${itemSkill?.label || "NO-SKILL"}):** ${rollRes.total}`;
          }
          dispatchDiscordLog("INVENTORY", name, msg);
          RetroToast.success(`USADO: ${item.name}`);
        } else {
          RetroToast.error("COMPARTIMENTO VAZIO. RECARREGUE.");
        }
      } else {
        const res = consumeItem(item.id);
        if (res.success) {
          let msg = `  **AÇÃO:** [${name}] usou **${item.name}**.`;

          if (item.type === "ACTIVE") {
            if (res.rollData?.skillId) {
              const itemSkill = getSkillById(res.rollData.skillId as Skill);
              const skillVal =
                skills[res.rollData.skillId as keyof typeof skills] || 0;

              const rollRes = executeRawRoll(`1d20+${skillVal}`);
              msg += `\n **ROLAGEM (${itemSkill?.label || "NO-SKILL"}):** ${rollRes.total}`;
            }
            msg += `\n **DESGASTE:** -${res.rollData?.loss} Integridade.`;
          }

          dispatchDiscordLog("INVENTORY", name, msg);
          RetroToast.success(`USADO: ${item.name}`);
        } else {
          RetroToast.error(res.message);
        }
      }
    };

    const handleWebhook = (e: React.MouseEvent) => {
      e.stopPropagation();
      let msg = `**MATÉRIA SCANEADA:**\n**NOME:** ${item.name} [${item.type}]\n**PESO:** ${item.slots} SLOTS\n`;
      if (item.quantity > 1) msg += `**QTD:** ${item.quantity}\n`;
      if (item.description) msg += `*${item.description}*\n`;
      dispatchDiscordLog("INVENTORY", name, msg);
      RetroToast.info("DADOS TRANSMITIDOS.");
    };

    if (isDragging && !isOverlay) {
      return (
        <div
          ref={setDropRef}
          className="border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-background)]/20 h-14 rounded-sm animate-pulse"
        />
      );
    }

    return (
      <div
        ref={setDropRef}
        className={`flex flex-col border transition-all duration-200 ${baseBgClass} ${borderClass} ${dropHighlight}`}
      >
        <div onClick={() => setIsDescOpen(!isDescOpen)}>
          <ItemHeader
            item={item}
            isEditMode={isEditMode}
            isEquippable={isEquippableType && canEquip}
            currentUses={currentUses}
            onToggleEquip={handleToggleEquip}
            onWebhook={handleWebhook}
            onQuickUse={handleUse}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            setDragRef={setDragRef}
            listeners={listeners}
            attributes={attributes}
            isNestedAmmo={isNestedAmmo}
            disableUse={disableUse}
          />
        </div>

        <AnimatePresence initial={false}>
          {isDescOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-1 flex flex-col gap-3 border-t border-[var(--theme-border)]">
                <ItemDetails item={item} inheritedEffects={inheritedEffects} />

                {!isEditMode && (
                  <ItemActions
                    item={item}
                    allInventory={allInventory}
                    currentUses={currentUses}
                    onUse={handleUse}
                    onUpdateQty={(val) =>
                      updateInventoryItem(item.id, "quantity", Math.max(1, val))
                    }
                    isNestedAmmo={isNestedAmmo}
                    disableUse={disableUse}
                  />
                )}

                {(!isEditMode || isOverlay) && (
                  <ItemRecursion
                    item={item}
                    childrenItems={childrenItems}
                    allInventory={allInventory}
                    isAbleToContain={isAbleToContain}
                    isMicroContainer={isMicroContainer}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    activeDragId={activeDragId}
                    isEditMode={isEditMode}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
  (prev, next) => {
    if (
      prev.isEditMode !== next.isEditMode ||
      prev.activeDragId !== next.activeDragId ||
      prev.isNestedAmmo !== next.isNestedAmmo
    )
      return false;
    if (JSON.stringify(prev.item) !== JSON.stringify(next.item)) return false;

    const getChildrenHash = (inv: Item[], parentId: number) => {
      const direct = inv.filter((i) => i.parentId === parentId);
      let hash = direct
        .map((i) => `${i.id}-Q${i.quantity}-U${"uses" in i ? i.uses : 0}`)
        .join("|");
      direct.forEach((d) => {
        const nested = inv.filter((i) => i.parentId === d.id);
        if (nested.length > 0) {
          hash +=
            "::" +
            nested
              .map((i) => `${i.id}-Q${i.quantity}-U${"uses" in i ? i.uses : 0}`)
              .join("|");
        }
      });
      return hash;
    };

    const prevHash = getChildrenHash(prev.allInventory, prev.item.id);
    const nextHash = getChildrenHash(next.allInventory, next.item.id);

    if (prevHash !== nextHash) return false;

    return true;
  },
);
