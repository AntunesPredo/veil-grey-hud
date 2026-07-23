import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox, Button } from "../../../shared/ui/Form";
import type { Item, CustomEffect } from "../../../shared/types/veil-grey";

export function ArsenalRow({
  id,
  type,
  data,
  isSelected,
  onToggle,
  onDelete,
  onView,
}: {
  id: string;
  type: "ITEM" | "EFFECT";
  data: Item | CustomEffect;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type, payload: data },
  });

  const isEff = type === "EFFECT";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 border-l-4 bg-[var(--theme-background)] p-1.5 transition-colors ${
        isSelected ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10" : "border-[var(--theme-border)] hover:bg-white/5"
      } ${isDragging ? "opacity-50 border-dashed z-50" : "z-10"}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-1 px-2 text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)] touch-none"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      <Checkbox label="" checked={isSelected} onChange={onToggle} />

      <span className="text-[10px] font-bold uppercase truncate flex-1 leading-tight">
        {isEff ? (
          <>
            [{(data as CustomEffect).mode}] {(data as CustomEffect).description}{" "}
            (
            {(data as CustomEffect).val > 0
              ? `+${(data as CustomEffect).val}`
              : (data as CustomEffect).val}
            )

          </>
        ) : (
          (data as Item).name
        )}
      </span>

      <div className="flex gap-1 shrink-0">
        <Button
          size="sm"
          variant="primary"
          className="rounded-none px-2"
          onClick={() => {
            navigator.clipboard.writeText(String(data.id));
            import("../../../shared/ui/RetroToast").then((m) => m.RetroToast.success("HASH COPIADA: " + data.id));
          }}
          title="Copiar Hash"
        >
          #HASH
        </Button>
        <Button
          size="sm"
          variant="primary"
          className="rounded-none px-2"
          onClick={onView}
        >
          VIEW
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex items-center justify-center rounded-none px-2"
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
    </div>
  );
}
