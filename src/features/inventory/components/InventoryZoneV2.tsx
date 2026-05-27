import { useDroppable, useDndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import type { Item, ContainerItem } from "../../../shared/types/veil-grey";
import { ItemNodeV2 } from "./ItemNodeV2";

interface InventoryZoneV2Props {
  zoneId: string;
  items: Item[];
  allInventory: Item[];
  title?: string;
  headerExtra?: React.ReactNode;
  isEditMode: boolean;
  onToggleEquip: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isCollapsedZone?: boolean;
  onExpandZone?: () => void;
  activeDragItem?: Item | null;
  isNestedAmmo?: boolean;
}

export function InventoryZoneV2({
  zoneId,
  items,
  allInventory,
  title,
  headerExtra,
  isEditMode,
  onToggleEquip,
  onEdit,
  onDelete,
  isCollapsedZone,
  onExpandZone,
  activeDragItem,
  isNestedAmmo = false,
}: InventoryZoneV2Props) {
  const { setNodeRef, isOver: isDirectOver } = useDroppable({ id: zoneId });
  const { over, active } = useDndContext();

  const isInnerDrawer = zoneId.startsWith("drawer::");

  let isDropTarget = isDirectOver;
  if (over && active && !isDirectOver) {
    const overIdStr = String(over.id);
    const overItem = allInventory.find((i) => String(i.id) === overIdStr);
    if (overItem) {
      if (isInnerDrawer) {
        const containerId = zoneId.split("::")[1];
        const dName =
          zoneId.split("::")[2] === "GERAL" ? null : zoneId.split("::")[2];
        if (overItem.parentId === containerId && overItem.drawer === dName) {
          isDropTarget = true;
        }
      } else {
        if (overItem.parentId === null) {
          if (zoneId === "zone_carried" && overItem.isCarried)
            isDropTarget = true;
          if (zoneId === "zone_base" && !overItem.isCarried)
            isDropTarget = true;
        }
      }
    }
  }

  let dropFeedbackClass =
    "border-[var(--theme-border)] bg-[var(--theme-background)]/20";

  if (isDropTarget && activeDragItem) {
    if (isInnerDrawer) {
      const containerId = zoneId.split("::")[1];
      const container = allInventory.find(
        (i) => String(i.id) === containerId,
      ) as ContainerItem;
      const capacity = container?.containerProps?.slotCapacity;

      if (capacity !== undefined) {
        const usedSlots = allInventory
          .filter((i) => i.parentId === containerId)
          .reduce((acc, i) => acc + i.slots * i.quantity, 0);

        const incomingUsage = activeDragItem.slots * activeDragItem.quantity;
        const currentUsage =
          activeDragItem.parentId === containerId
            ? activeDragItem.slots * activeDragItem.quantity
            : 0;

        if (usedSlots - currentUsage + incomingUsage <= capacity) {
          dropFeedbackClass =
            "border-[var(--theme-success)] bg-[var(--theme-success)]/10 shadow-[0_0_15px_rgba(0,255,0,0.2)_inset]";
        } else {
          dropFeedbackClass =
            "border-[var(--theme-danger)] bg-[var(--theme-danger)]/10 shadow-[0_0_15px_rgba(255,0,0,0.2)_inset]";
        }
      } else {
        dropFeedbackClass =
          "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 shadow-[0_0_15px_rgba(255,255,255,0.1)_inset]";
      }
    } else {
      const isCarried = zoneId === "zone_carried";
      dropFeedbackClass = `border-[${isCarried ? "var(--theme-success)" : "var(--theme-warning)"}] bg-[${isCarried ? "var(--theme-success)" : "var(--theme-warning)"}]/10 shadow-[0_0_15px_rgba(255,255,255,0.05)_inset]`;
    }
  } else if (isCollapsedZone) {
    dropFeedbackClass =
      "bg-[#050505] border-[var(--theme-border)] hover:border-[var(--theme-accent)]";
  }

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        flex: isCollapsedZone ? 0.2 : 1,
      }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      onClick={isCollapsedZone ? onExpandZone : undefined}
      ref={setNodeRef}
      className={`flex flex-col min-h-0 relative border-2 overflow-hidden ${
        isCollapsedZone ? "cursor-pointer group" : ""
      } ${dropFeedbackClass} ${isInnerDrawer && !isCollapsedZone ? "border-l-4" : ""}`}
    >
      {isCollapsedZone && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 8px, var(--theme-border) 8px, var(--theme-border) 16px)",
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {isCollapsedZone ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="z-10 flex flex-col items-center gap-2 mt-4 py-6 w-full h-full"
          >
            <span className="text-[12px] text-[var(--theme-accent)] font-bold animate-pulse mb-4">
              ▼
            </span>
            {(title || "ABRIR").split("").map((char, idx) => (
              <span
                key={idx}
                className="text-[12px] font-black font-mono text-[var(--theme-text)]/50 group-hover:text-[var(--theme-accent)] uppercase leading-none"
              >
                {char === " " ? <span className="mb-2 block" /> : char}
              </span>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full h-full min-w-[280px]"
          >
            {(title || headerExtra) && (
              <div className="bg-[var(--theme-background)]/90 p-2 border-b-2 border-[var(--theme-border)] flex justify-between items-center z-10 shrink-0 shadow-sm">
                {title && (
                  <span className="text-[10px] md:text-xs font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                    {title}
                  </span>
                )}
                {headerExtra}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2 relative">
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <ItemNodeV2
                    key={item.id}
                    item={item}
                    allInventory={allInventory}
                    isEditMode={isEditMode}
                    onToggleEquip={onToggleEquip}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    activeDragItem={activeDragItem}
                    isNestedAmmo={isNestedAmmo}
                  />
                ))}
              </SortableContext>
              {items.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--theme-text)]/30 text-[12px] tracking-widest font-mono uppercase pointer-events-none">
                  [ ÁREA VAZIA ]
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
