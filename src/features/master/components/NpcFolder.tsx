import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../../shared/ui/Form";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface NpcFolderProps {
  id: string;
  name: string;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleAllActive: (isActive: boolean) => void;
  children: React.ReactNode;
}

export function NpcFolder({
  id,
  name,
  isOpen,
  onToggle,
  onDelete,
  onToggleAllActive,
  children,
}: NpcFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `npcFolder_${id}`, data: { type: "NPC_FOLDER" } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `npcFolder_${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`relative group border-2 border-[var(--theme-border)] bg-[var(--theme-background)] transition-colors ${
        isDragging ? "opacity-50" : ""
      } ${isOver ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10" : ""}`}
    >
      <div 
        className="flex items-center justify-between p-2 bg-black/60 hover:bg-black/80 transition-colors cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-1.5 text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors"
          >
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--theme-accent)] drop-shadow-[0_0_4px_var(--theme-accent)]">
            DIR: {name}
          </span>
          <motion.span 
            animate={{ rotate: isOpen ? 90 : 0 }} 
            className="text-[var(--theme-accent)] ml-2 text-xs"
          >
            ▶
          </motion.span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="success"
            className="h-7 px-3 text-[10px]"
            onClick={(e) => { e.stopPropagation(); onToggleAllActive(true); }}
          >
            ON
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="h-7 px-3 text-[10px]"
            onClick={(e) => { e.stopPropagation(); onToggleAllActive(false); }}
          >
            OFF
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="h-7 px-3 text-[10px]"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            EXCLUIR
          </Button>
        </div>
      </div>

      <div ref={setDropRef}>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 flex flex-col gap-2 bg-black/40 border-t-2 border-[var(--theme-border)]">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
