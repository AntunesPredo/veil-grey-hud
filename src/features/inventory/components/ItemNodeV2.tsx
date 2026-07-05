import React, { useState, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomEffect, Item } from "../../../shared/types/veil-grey";
import { ItemHeaderV2 } from "./ItemHeaderV2";
import { InventoryZoneV2 } from "./InventoryZoneV2";
import { ItemDetailsV2 } from "./ItemDetailsV2";
import { ItemActionsV2 } from "./ItemActionsV2";
import { useCharacterStore } from "../../character/store";
import { Button, Input } from "../../../shared/ui/Form";
import { TargetSelectionModal } from "../../../shared/ui/TargetSelectionModal";
import { useActionEngine } from "../hooks/useActionEngine";

interface ItemNodeV2Props {
  item: Item;
  allInventory: Item[];
  isEditMode: boolean;
  onToggleEquip: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragItem?: Item | null;
  isPreview?: boolean;
  isNestedAmmo?: boolean;
}

export const ItemNodeV2 = ({
  item,
  allInventory,
  isEditMode,
  onToggleEquip,
  onEdit,
  onDelete,
  activeDragItem,
  isPreview = false,
  isNestedAmmo = false,
}: ItemNodeV2Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const manageDrawer = useCharacterStore((state) => state.manageDrawer);

  const [creatingDrawer, setCreatingDrawer] = useState(false);
  const [editingDrawer, setEditingDrawer] = useState<string | null>(null);
  const [drawerInput, setDrawerInput] = useState("");
  const [isEditingDrawers, setIsEditingDrawers] = useState(false);

  const {
    currentUses,
    disableUse,
    handleUse,
    executeCombatAction,
    isTargetModalOpen,
    setIsTargetModalOpen,
  } = useActionEngine(item, allInventory);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "ITEM", item },
    disabled: isPreview,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging && !isPreview
      ? { zIndex: 50, opacity: 0.4 }
      : { zIndex: 10 }),
  };

  const isContainer =
    (item.type === "CONTAINER" || item.type === "EQUIPABLE") &&
    !!item.containerProps &&
    item.containerProps.slotCapacity > 0;
  const isMicroContainer =
    ["RECHARGEABLE", "ACTIVE", "KIT"].includes(item.type) &&
    ("requiresAmmo" in item ? item.requiresAmmo : true);

  const childrenItems = useMemo(
    () => allInventory.filter((i) => i.parentId === item.id),
    [allInventory, item.id],
  );

  const shouldShowContent =
    item.type === "EQUIPABLE" ? item.parentId === null : true;

  const usedSlots = childrenItems.reduce(
    (acc, child) => acc + child.slots * child.quantity,
    0,
  );
  const capacity =
    "containerProps" in item ? item.containerProps?.slotCapacity : null;

  const savedDrawers =
    "containerProps" in item ? item.containerProps?.drawers || [] : [];
  const allDrawers = Array.from(
    new Set([
      ...savedDrawers,
      ...childrenItems.map((c) => c.drawer).filter(Boolean),
    ]),
  );

  if (!allDrawers.includes("RECARGA") && isMicroContainer) {
    allDrawers.unshift("RECARGA");
  } else if (
    !allDrawers.includes("GERAL") &&
    capacity !== null &&
    capacity !== 0
  )
    allDrawers.unshift("GERAL");

  const handleCreateDrawer = () => {
    if (drawerInput.trim())
      manageDrawer(
        item.id,
        "CREATE",
        undefined,
        drawerInput.toUpperCase().trim(),
      );
    setCreatingDrawer(false);
    setDrawerInput("");
  };

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
    return effects;
  }, [item, childrenItems, allInventory]);

  return (
    <div
      ref={isPreview ? null : setNodeRef}
      style={style}
      className={`relative flex flex-col w-full bg-[var(--theme-background)] border-2 border-transparent transition-opacity duration-150`}
    >
      <TargetSelectionModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSelect={executeCombatAction}
      />

      <ItemHeaderV2
        item={item}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        listeners={isPreview ? undefined : listeners}
        attributes={isPreview ? undefined : attributes}
        isEditMode={isEditMode}
        currentUses={currentUses}
        onUse={handleUse}
        disableUse={disableUse}
        onEdit={onEdit}
        onDelete={onDelete}
        isNestedAmmo={isNestedAmmo}
      />

      <AnimatePresence>
        {isOpen && !isPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#030303] border-x-2 border-b-2 border-[var(--theme-border)]"
          >
            <div className="p-1 flex flex-col gap-3">
              <ItemDetailsV2 item={item} inheritedEffects={inheritedEffects} />

              <ItemActionsV2
                item={item}
                allInventory={allInventory}
                currentUses={currentUses}
                onUse={handleUse}
                disableUse={disableUse}
                isNestedAmmo={isNestedAmmo}
                isEditMode={isEditMode}
              />

              {(isContainer || isMicroContainer) && shouldShowContent && (
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <div className="flex justify-between items-center mb-1 pb-2">
                    <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                      {isMicroContainer
                        ? "COMPARTIMENTO DE CARGA"
                        : `ARMAZENAMENTO (${usedSlots}/${capacity} SLOTS)`}
                    </span>
                    {!isMicroContainer && (
                      <div className="flex gap-2">
                        {allDrawers.length > 1 && (
                          <Button
                            size="sm"
                            className="px-1 text-[8px] border-dashed"
                            onClick={() =>
                              setIsEditingDrawers(!isEditingDrawers)
                            }
                          >
                            {isEditingDrawers ? "OK" : "EDITAR GAVETAS"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="px-1 text-[8px] border-dashed"
                          onClick={() => {
                            setCreatingDrawer(true);
                            setDrawerInput("");
                          }}
                        >
                          + GAVETA
                        </Button>
                      </div>
                    )}
                  </div>

                  {creatingDrawer && (
                    <div className="flex gap-1 mb-2 bg-[var(--theme-accent)]/10 p-1">
                      <Input
                        autoFocus
                        placeholder="NOME DA GAVETA..."
                        value={drawerInput}
                        onChange={(e) => setDrawerInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateDrawer()
                        }
                        className="text-[10px] h-6 flex-1 bg-[var(--theme-background)]"
                      />
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleCreateDrawer}
                        className="h-6 text-[9px] px-2 border-dashed"
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setCreatingDrawer(false)}
                        className="h-6 text-[9px] px-2 border-dashed"
                      >
                        X
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {allDrawers.map((drawerName) => {
                      return (
                        <div
                          key={drawerName as string}
                          className="flex flex-col"
                        >
                          {editingDrawer === drawerName ? (
                            <div className="flex gap-1 w-full p-1 bg-[var(--theme-background)]/40">
                              <Input
                                autoFocus
                                value={drawerInput}
                                onChange={(e) => setDrawerInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && drawerName) {
                                    manageDrawer(
                                      item.id,
                                      "RENAME",
                                      drawerName as string,
                                      drawerInput.toUpperCase().trim(),
                                    );
                                    setEditingDrawer(null);
                                  }
                                }}
                                className="text-[9px] h-5 flex-1 bg-[var(--theme-background)] px-1"
                              />
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => {
                                  if (drawerName)
                                    manageDrawer(
                                      item.id,
                                      "RENAME",
                                      drawerName as string,
                                      drawerInput.toUpperCase().trim(),
                                    );
                                  setEditingDrawer(null);
                                }}
                                className="h-5 text-[8px] px-1.5 border-none"
                              >
                                OK
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setEditingDrawer(null)}
                                className="h-5 text-[8px] px-1.5 border-none"
                              >
                                X
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-1 group">
                              <span className="text-[9px] font-bold text-[var(--theme-text)]/50 uppercase tracking-widest group-hover:text-[var(--theme-accent)] transition-colors">
                                / {drawerName}
                              </span>
                              {drawerName !== "GERAL" &&
                                isEditingDrawers &&
                                !isMicroContainer && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      className="h-5 text-[8px] border-none hover:text-[var(--theme-accent)]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDrawer(drawerName as string);
                                        setDrawerInput(drawerName as string);
                                      }}
                                    >
                                      ✎
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      className="h-5 text-[8px] border-none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        manageDrawer(
                                          item.id,
                                          "DELETE",
                                          drawerName as string,
                                        );
                                      }}
                                    >
                                      X
                                    </Button>
                                  </div>
                                )}
                            </div>
                          )}

                          <InventoryZoneV2
                            zoneId={`drawer::${item.id}::${drawerName}`}
                            items={childrenItems.filter((i) =>
                              i.drawer
                                ? i.drawer === drawerName
                                : isMicroContainer
                                  ? "RECARGA" === drawerName
                                  : "GERAL" === drawerName,
                            )}
                            allInventory={allInventory}
                            isEditMode={isEditMode}
                            onToggleEquip={onToggleEquip}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            activeDragItem={activeDragItem}
                            isNestedAmmo={
                              item.type === "RECHARGEABLE" ||
                              item.type === "ACTIVE" ||
                              item.type === "KIT"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
