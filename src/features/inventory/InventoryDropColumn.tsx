import { useDroppable } from "@dnd-kit/core";
import type { Item } from "../../shared/types/veil-grey";
import { motion, AnimatePresence } from "framer-motion";
import { ItemNodeWrapper } from "./components/ItemNodeWrapper";

type InventoryDropColumnProps = {
  id: string;
  items: Item[];
  allInventory: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  activeDragId: number | null;
  isEditMode: boolean;
  title?: string;
  headerExtra?: React.ReactNode;
};

export function InventoryDropColumn({
  id,
  items,
  allInventory,
  onEdit,
  onDelete,
  activeDragId,
  isEditMode,
  title,
  headerExtra,
}: InventoryDropColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col border transition-colors duration-200 overflow-hidden ${
        isOver
          ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 shadow-[0_0_15px_rgba(255,255,255,0.1)_inset]"
          : "border-[var(--theme-border)] bg-[var(--theme-background)]/40"
      }`}
    >
      {(title || headerExtra) && (
        <div className="bg-[var(--theme-background)]/80 p-2 border-b border-[var(--theme-border)] flex justify-between items-center sticky top-0 z-10 shadow-sm">
          {title && (
            <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
              {title}
            </span>
          )}
          {headerExtra}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-2">
        <AnimatePresence>
          {items.map((item: Item) => (
            <ItemNodeWrapper
              key={item.id}
              item={item}
              allInventory={allInventory}
              onEdit={onEdit}
              onDelete={onDelete}
              activeDragId={activeDragId}
              isEditMode={isEditMode}
            />
          ))}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--theme-text)]/40 mt-10 text-[10px] tracking-widest font-mono uppercase"
            >
              [ MATRIZ VAZIA ]
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
