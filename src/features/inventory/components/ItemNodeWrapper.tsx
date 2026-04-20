import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useCharacterStore } from "../../character/store";
import type { Item } from "../../../shared/types/veil-grey";
import { dispatchDiscordLog } from "../../../shared/utils/discordWebhook";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { ItemHeader } from "./ItemHeader";
import { ItemActions } from "./ItemActions";
import { ItemDetails } from "./ItemDetails";
import { ItemRecursion } from "./ItemRecursion";

type ItemNodeWrapperProps = {
  item: Item;
  allInventory: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragId: number | null;
  isEditMode: boolean;
  isOverlay?: boolean;
  isInsideRechargeable?: boolean;
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
    isInsideRechargeable = false,
  }: ItemNodeWrapperProps) => {
    const {
      updateInventoryItem,
      toggleEquipItem,
      consumeItem,
      consumeRechargeable,
      name,
    } = useCharacterStore();
    const [isDescOpen, setIsDescOpen] = useState(false);

    const childrenItems = allInventory.filter((i) => i.parentId === item.id);
    const isAbleToContain =
      (item.type === "CONTAINER" || item.type === "EQUIPABLE") &&
      !!item.containerProps;
    const isMicroContainer =
      item.type === "RECHARGEABLE" || item.type === "KIT";
    const canEquip = item.parentId === null && item.isCarried;
    const isEquippableType =
      item.type === "EQUIPABLE" || item.type === "ACTIVE";

    const currentUses =
      item.type === "RECHARGEABLE"
        ? childrenItems
            .filter((i) => i.type === "CONSUMABLE")
            .reduce((sum, i) => sum + i.uses * i.quantity, 0)
        : "uses" in item
          ? item.uses
          : 0;

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

    const handleUse = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        item.type === "MATERIAL" ||
        item.type === "CONTAINER" ||
        item.type === "EQUIPABLE"
      )
        return;

      if (item.type === "RECHARGEABLE") {
        if (currentUses > 0) {
          consumeRechargeable(item.id);
          dispatchDiscordLog(
            "INVENTORY",
            name,
            `🎯 **AÇÃO:** [${name}] realizou descarga de **${item.name}**.`,
          );
          RetroToast.success(`DESCARGA: ${item.name}`);
        } else {
          RetroToast.error("COMPARTIMENTO VAZIO. RECARREGUE.");
        }
      } else {
        if (currentUses > 0) {
          consumeItem(item.id);
          dispatchDiscordLog(
            "INVENTORY",
            name,
            `🎯 **AÇÃO:** [${name}] usou **${item.name}**.`,
          );
          RetroToast.success(`USADO: ${item.name}`);
        } else {
          RetroToast.error("CARGA DEPLECIONADA.");
        }
      }
    };

    const handleWebhook = (e: React.MouseEvent) => {
      e.stopPropagation();
      let msg = `📡 **MATÉRIA SCANEADA:**\n**NOME:** ${item.name} [${item.type}]\n**PESO:** ${item.slots} SLOTS\n`;
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
            onToggleEquip={(e) => {
              e.stopPropagation();
              toggleEquipItem(item.id);
            }}
            onWebhook={handleWebhook}
            onQuickUse={handleUse}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            setDragRef={setDragRef}
            listeners={listeners}
            attributes={attributes}
            isInsideRechargeable={isInsideRechargeable}
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
                <ItemDetails item={item} />

                {!isEditMode && (
                  <ItemActions
                    item={item}
                    allInventory={allInventory}
                    currentUses={currentUses}
                    onUse={handleUse}
                    onUpdateQty={(val) =>
                      updateInventoryItem(item.id, "quantity", Math.max(1, val))
                    }
                    isInsideRechargeable={isInsideRechargeable}
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
      prev.isInsideRechargeable !== next.isInsideRechargeable
    )
      return false;

    if (JSON.stringify(prev.item) !== JSON.stringify(next.item)) return false;

    const getChildrenHash = (inv: Item[], parentId: number) =>
      inv
        .filter((i) => i.parentId === parentId)
        .map((i) => `${i.id}-Q${i.quantity}-U${"uses" in i ? i.uses : 0}`)
        .join("|");

    const prevHash = getChildrenHash(prev.allInventory, prev.item.id);
    const nextHash = getChildrenHash(next.allInventory, next.item.id);

    if (prevHash !== nextHash) return false;

    return true;
  },
);
