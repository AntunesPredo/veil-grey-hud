import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../../shared/ui/Form";
import { Accordion } from "../../../shared/ui/Accordion";

interface ArsenalFolderProps {
  id: string;
  name: string;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export function ArsenalFolder({
  id,
  name,
  isOpen,
  onToggle,
  onDelete,
  children,
}: ArsenalFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `sortable_${id}`, data: { type: "FOLDER" } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `folder_${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`relative group border-2 transition-colors ${isDragging ? "opacity-50" : ""
        } ${isOver ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/20" : "border-transparent"}`}
    >
      <div className="absolute right-8 top-1 flex gap-1 z-10">
        <div
          {...listeners}
          {...attributes}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing p-0.5 text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)] bg-[var(--theme-background)] border border-[var(--theme-border)]"
        >
          <svg viewBox="0 0 20 20" className="w-3 h-3 fill-current">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>
        <Button
          size="sm"
          variant="danger"
          className="flex items-center justify-center rounded-none px-2 bg-[var(--theme-danger)]/90"
          onClick={onDelete}
        >
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </div>

      <div ref={setDropRef}>
        <Accordion title={`DIR: ${name}`} isOpen={isOpen} onToggle={onToggle}>
          <div className="flex flex-col gap-1 min-h-[40px] p-1">{children}</div>
        </Accordion>
      </div>
    </div>
  );
}
