import type { Item } from "../../../shared/types/veil-grey";
import { Button } from "../../../shared/ui/Form";
import { useCustomSvgIcons } from "../../../shared/hooks/useCustomSvgIcons";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface ItemHeaderProps {
  item: Item;
  isEditMode: boolean;
  isEquippable: boolean;
  currentUses: number;
  onToggleEquip: (e: React.MouseEvent) => void;
  onWebhook: (e: React.MouseEvent) => void;
  onQuickUse: (e: React.MouseEvent) => void; // Novo
  onEdit: () => void;
  onDelete: () => void;
  setDragRef: (element: HTMLElement | null) => void;
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes | undefined;
  isInsideRechargeable?: boolean;
}

const renderUseBlocks = (uses: number, maxUses: number) => {
  const blocks = [];
  for (let i = 0; i < maxUses; i++) {
    blocks.push(i < uses ? "■" : "□");
  }
  return blocks.join(" ");
};

export function ItemHeader({
  item,
  isEditMode,
  isEquippable,
  currentUses,
  onToggleEquip,
  onWebhook,
  onQuickUse,
  onEdit,
  onDelete,
  setDragRef,
  listeners,
  attributes,
  isInsideRechargeable = false,
}: ItemHeaderProps) {
  const { getSpecificSvg } = useCustomSvgIcons();

  const hasUses =
    "maxUses" in item &&
    (item.type === "CONSUMABLE" ||
      item.type === "ACTIVE" ||
      item.type === "RECHARGEABLE" ||
      item.type === "KIT");
  const maxUses = hasUses ? item.maxUses : 1;

  return (
    <div className="flex items-center justify-between p-2 cursor-pointer group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center shrink-0">
          {isEditMode ? (
            <div
              ref={setDragRef}
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing hover:text-[var(--theme-accent)] text-[var(--theme-text)]/40 px-1 touch-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
              </svg>
            </div>
          ) : (
            <div
              ref={setDragRef}
              {...listeners}
              {...attributes}
              className={`p-1.5 border bg-[var(--theme-background)] cursor-grab active:cursor-grabbing shadow-[0_0_8px_rgba(0,0,0,0.5)_inset] touch-none ${item.isEquipped ? "text-[var(--theme-success)] border-[var(--theme-success)]/30 hover:border-[var(--theme-success)]" : "text-[var(--theme-accent)] border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50"}`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                {getSpecificSvg(item.svgId)}
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold uppercase truncate text-xs tracking-wider ${item.isEquipped ? "text-[var(--theme-success)]" : "text-[var(--theme-accent)]"}`}
            >
              {item.name}
            </span>
            {!isEditMode && isEquippable && (
              <Button
                size="sm"
                onClick={onToggleEquip}
                className={`h-5 px-1.5 text-[8px] border-dashed ${item.isEquipped ? "bg-[var(--theme-success)]/20 border-[var(--theme-success)] text-[var(--theme-success)]" : "border-[var(--theme-border)] text-[var(--theme-text)]/50"}`}
              >
                {item.isEquipped ? "[EQUIPADO]" : "[DESEQUIPADO]"}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[9px] font-mono text-[var(--theme-text)]/60 bg-[var(--theme-background)]/60 px-1 border border-[var(--theme-border)]">
              SLOTS: {item.slots * item.quantity}{" "}
              {item.quantity > 1 && `(${item.slots}/UN)`}
            </span>
            {item.quantity > 1 && (
              <span className="text-[9px] font-mono text-[var(--theme-accent)] bg-[var(--theme-accent)]/10 px-1 border border-[var(--theme-accent)]/30">
                QTD: {item.quantity}
              </span>
            )}
            {hasUses && maxUses > 1 && (
              <span className="text-[9px] font-mono text-[var(--theme-warning)] bg-[var(--theme-warning)]/10 px-1 border border-[var(--theme-warning)]/30">
                {renderUseBlocks(currentUses, maxUses)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 shrink-0 pl-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditMode ? (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={onEdit}
              className="px-2 h-7 border-dashed"
            >
              MOD
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={onDelete}
              className="px-2 h-7 border-dashed"
            >
              X
            </Button>
          </>
        ) : (
          <>
            {hasUses && !isInsideRechargeable && (
              <Button
                size="sm"
                variant="warning"
                onClick={onQuickUse}
                className="h-6 px-1.5 border-dashed text-[10px] mr-1 shadow-[0_0_8px_rgba(204,122,0,0.2)]"
              >
                USAR
              </Button>
            )}
            <Button
              size="sm"
              onClick={onWebhook}
              className="h-6 px-1.5 border-none text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
