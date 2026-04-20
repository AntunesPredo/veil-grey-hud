import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import type { Item } from "../../../shared/types/veil-grey";
import { ItemNodeWrapper } from "./ItemNodeWrapper";
import { useCharacterStore } from "../../character/store";
import { Button, Input } from "../../../shared/ui/Form";

interface DrawerZoneProps {
  containerId: number;
  drawerName: string | null;
  items: Item[];
  allInventory: Item[];
  isMicroContainer: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragId: number | null;
  isEditMode: boolean;
  editingDrawer: string | null;
  setEditingDrawer: (name: string | null) => void;
  drawerInput: string;
  setDrawerInput: (val: string) => void;
  onRename: (oldName: string) => void;
  onRemoveDrawer: (name: string) => void;
  isNestedAmmo: boolean;
  isEditingDrawers: boolean;
}

function DrawerZone({
  containerId,
  drawerName,
  items,
  allInventory,
  isMicroContainer,
  onEdit,
  onDelete,
  activeDragId,
  isEditMode,
  editingDrawer,
  setEditingDrawer,
  drawerInput,
  setDrawerInput,
  onRename,
  onRemoveDrawer,
  isNestedAmmo,
  isEditingDrawers,
}: DrawerZoneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const droppableId = `drawer::${containerId}::${drawerName}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-1 border-l-2 pl-2 transition-colors duration-200 ${
        isOver
          ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 shadow-[0_0_10px_var(--theme-accent)_inset]"
          : "border-[var(--theme-border)]"
      }`}
    >
      {!isMicroContainer && (
        <div className="flex items-center justify-between bg-[var(--theme-background)]/40 p-1 group">
          {editingDrawer === drawerName ? (
            <div className="flex gap-1 w-full">
              <Input
                autoFocus
                value={drawerInput}
                onChange={(e) => setDrawerInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && onRename(drawerName ?? "-")
                }
                className="text-[9px] h-5 flex-1 bg-[var(--theme-background)]"
              />
              <Button
                size="sm"
                variant="success"
                onClick={() => onRename(drawerName ?? "-")}
                className="h-5 text-[8px] px-1.5"
              >
                OK
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setEditingDrawer(null)}
                className="h-5 text-[8px] px-1.5"
              >
                X
              </Button>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-1 cursor-pointer flex-1"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <svg
                  className="w-5 h-5 fill-[var(--theme-text)]/50 transition-transform duration-200"
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
                <span className="text-[10px] font-bold text-[var(--theme-text)]/50 uppercase tracking-widest hover:text-[var(--theme-accent)] transition-colors">
                  {drawerName}
                </span>
              </div>

              {drawerName !== "GERAL" && isEditingDrawers && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="h-5 text-[8px] border-none hover:text-[var(--theme-accent)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDrawer(drawerName);
                      if (drawerName !== null) {
                        setDrawerInput(drawerName);
                      }
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
                      if (drawerName !== null) {
                        onRemoveDrawer(drawerName);
                      }
                    }}
                  >
                    X
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-1 min-h-[24px] overflow-hidden"
          >
            {items.map((child: Item) => (
              <ItemNodeWrapper
                key={child.id}
                item={child}
                allInventory={allInventory}
                onEdit={onEdit}
                onDelete={onDelete}
                activeDragId={activeDragId}
                isEditMode={isEditMode}
                isNestedAmmo={isNestedAmmo}
              />
            ))}
            {items.length === 0 && (
              <span className="text-[8px] font-mono text-[var(--theme-text)]/30 italic pl-4 py-1">
                -- Vazio --
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ItemRecursionProps {
  item: Item;
  childrenItems: Item[];
  allInventory: Item[];
  isAbleToContain: boolean;
  isMicroContainer: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragId: number | null;
  isEditMode: boolean;
}

export function ItemRecursion({
  item,
  childrenItems,
  allInventory,
  isAbleToContain,
  isMicroContainer,
  onEdit,
  onDelete,
  activeDragId,
  isEditMode,
}: ItemRecursionProps) {
  const { manageDrawer } = useCharacterStore();
  const [creatingDrawer, setCreatingDrawer] = useState(false);
  const [editingDrawer, setEditingDrawer] = useState<string | null>(null);
  const [drawerInput, setDrawerInput] = useState("");
  const [isEditingDrawers, setIsEditingDrawers] = useState(false);

  if (!isAbleToContain && !isMicroContainer) return null;

  const savedDrawers =
    "containerProps" in item ? item.containerProps?.drawers || [] : [];

  const allDrawers = Array.from(
    new Set([
      ...savedDrawers,
      ...childrenItems.map((c) => c.drawer).filter(Boolean),
    ]),
  );
  if (childrenItems.some((c) => !c.drawer) || allDrawers.length === 0) {
    if (!allDrawers.includes("GERAL")) allDrawers.unshift("GERAL");
  }

  const groupedChildren = childrenItems.reduce(
    (acc, child) => {
      const d = child.drawer || "GERAL";
      if (!acc[d]) acc[d] = [];
      acc[d].push(child);
      return acc;
    },
    {} as Record<string, Item[]>,
  );

  const capacity =
    "containerProps" in item ? item.containerProps?.slotCapacity : null;

  const usedSlots = childrenItems.reduce(
    (acc, child) => acc + child.slots * child.quantity,
    0,
  );

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

  const handleRenameDrawer = (oldName: string) => {
    if (drawerInput.trim() && drawerInput !== oldName) {
      manageDrawer(
        item.id,
        "RENAME",
        oldName,
        drawerInput.toUpperCase().trim(),
      );
    }
    setEditingDrawer(null);
    setDrawerInput("");
  };

  const handleDeleteDrawer = (name: string) => {
    manageDrawer(item.id, "DELETE", name);
  };

  return (
    <div className="mt-2 border-t border-dashed border-[var(--theme-border)] pt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-bold text-[var(--theme-success)] tracking-widest uppercase">
          {item.type === "ACTIVE"
            ? "COMPARTIMENTO DE MUNIÇÃO:"
            : isMicroContainer
              ? "COMPARTIMENTO DE RECARGA:"
              : `ARMAZENAMENTO INTERNO (${usedSlots}/${capacity} SLOTS):`}
        </span>
        {!isMicroContainer && (
          <div className="flex items-center gap-2">
            {allDrawers.length > 1 ? (
              <Button
                size="sm"
                className="px-1 text-[8px] border-dashed"
                onClick={() => setIsEditingDrawers(!isEditingDrawers)}
              >
                {isEditingDrawers ? "OK" : "EDITAR GAVETAS"}
              </Button>
            ) : null}
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
            onKeyDown={(e) => e.key === "Enter" && handleCreateDrawer()}
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

      <div className="flex flex-col gap-2">
        {allDrawers.map((drawerName) => (
          <DrawerZone
            key={drawerName as string}
            containerId={item.id}
            drawerName={drawerName}
            items={groupedChildren[drawerName as string] || []}
            allInventory={allInventory}
            isMicroContainer={isMicroContainer}
            onEdit={onEdit}
            onDelete={onDelete}
            activeDragId={activeDragId}
            isEditMode={isEditMode}
            editingDrawer={editingDrawer}
            setEditingDrawer={setEditingDrawer}
            drawerInput={drawerInput}
            setDrawerInput={setDrawerInput}
            onRename={handleRenameDrawer}
            onRemoveDrawer={handleDeleteDrawer}
            isNestedAmmo={
              item.type === "RECHARGEABLE" ||
              item.type === "ACTIVE" ||
              item.type === "KIT"
            }
            isEditingDrawers={isEditingDrawers}
          />
        ))}
      </div>
    </div>
  );
}
