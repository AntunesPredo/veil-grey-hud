import type { Item } from "../../../shared/types/veil-grey";
import { useCustomSvgIcons } from "../../../shared/hooks/useCustomSvgIcons";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import { Button } from "../../../shared/ui/Form";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { useSystemData } from "../../../shared/hooks/useSystemData";
import { useCharacterStore } from "../../character/store";
import { HardwareGauge } from "../components/HardwareGauge";
import { TelemetryBar } from "../components/TelemetryBar";
import { generateInjectionHash } from "../../../shared/utils/hashIntegration";

const isDev =
  import.meta.env.VITE_IN_DEVELOPMENT === "true" || import.meta.env.DEV;

interface ItemHeaderV2Props {
  item: Item;
  isOpen: boolean;
  onToggle: () => void;
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes | undefined;
  isEditMode: boolean;
  currentUses: number;
  onUse: (e: React.MouseEvent) => void;
  disableUse: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isNestedAmmo?: boolean;
}

export function ItemHeaderV2({
  item,
  isOpen,
  onToggle,
  listeners,
  attributes,
  isEditMode,
  currentUses,
  onUse,
  disableUse,
  onEdit,
  onDelete,
  isNestedAmmo = false,
}: ItemHeaderV2Props) {
  const { getSpecificIcon } = useCustomSvgIcons();
  const { getSkillById } = useSystemData();
  const toggleEquipItem = useCharacterStore((state) => state.toggleEquipItem);
  const sandboxMode = useCharacterStore((state) => state.sandboxMode);

  const icon = getSpecificIcon(item.svgId);
  const hasUses = "maxUses" in item;
  const maxUses = hasUses ? item.maxUses : 1;
  const isActive = item.type === "ACTIVE";
  const pct = hasUses ? Math.min((currentUses / maxUses) * 100, 100) : 0;

  const itemSkill =
    (item.type === "ACTIVE" || item.type === "KIT") && item.skillId
      ? getSkillById(item.skillId)
      : null;
  const isEquippableType = item.type === "EQUIPABLE" || item.type === "ACTIVE";
  const canEquip = item.parentId === null && item.isCarried;

  const borderClass = item.isEquipped
    ? "border-[var(--theme-success)]"
    : "border-[var(--theme-border)]";

  const textClass = item.isEquipped
    ? "text-[var(--theme-success)]"
    : "text-[var(--theme-accent)]";

  const handleEquipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode) {
      RetroToast.error("MODO DE EDIÇÃO NECESSÁRIO PARA ALTERAR EQUIPAMENTOS.");
      return;
    }
    if (item.isSoulBound && item.isEquipped) {
      RetroToast.error("VINCULO ATIVO.");
      return;
    }
    toggleEquipItem(item.id);
  };

  const handleCopyHash = () => {
    generateInjectionHash({
      type: "ITEM",
      singleUse: true,
      data: {
        ...item,
        id: crypto.randomUUID(),
        parentId: null,
        isCarried: true,
        isEquipped: false,
      },
    });
  };

  const canUse =
    hasUses && !item.isEquipped && item.type !== "ACTIVE" && !isNestedAmmo;
  const canBattle = item.type === "ACTIVE" && item.isEquipped;
  const hasActions = (isEquippableType && canEquip) || canUse || canBattle;

  return (
    <div
      onClick={onToggle}
      className={`flex flex-col md:flex-row bg-[var(--theme-background)] border-2 ${borderClass} hover:border-[var(--theme-accent)] transition-all cursor-pointer select-none group relative overflow-hidden`}
    >
      <div className="flex flex-row flex-1 min-w-0">
        <div
          {...listeners}
          {...attributes}
          className={`w-16 md:w-20 shrink-0 border-r-2 ${borderClass} flex items-center justify-center bg-[var(--theme-background)]/50 p-2 cursor-grab active:cursor-grabbing hover:bg-[var(--theme-accent)]/10`}
        >
          <svg
            className={`w-10 h-10 md:w-12 md:h-12 fill-current ${textClass} group-hover:scale-110 transition-transform`}
            viewBox={icon.viewBox}
          >
            {icon.svg}
          </svg>
        </div>

        <div className="flex flex-col flex-1 p-2 justify-between min-w-0">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <span
              className={`font-black uppercase truncate text-sm md:text-base tracking-widest ${textClass}`}
            >
              {item.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <span className="text-[8px] md:text-[9px] text-[var(--theme-text)]/50 font-bold tracking-widest uppercase border border-[var(--theme-border)] px-1">
                {item.type}
              </span>
              {isDev && (
                <span
                  className="text-[9px] font-mono text-[var(--theme-warning)] px-1.5 py-0.5 bg-[var(--theme-warning)]/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHash();
                  }}
                >
                  [C]
                </span>
              )}
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-180 fill-[var(--theme-accent)]" : "rotate-0 fill-[var(--theme-text)]/50"}`}
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <span className="text-[9px] font-mono text-[var(--theme-text)]/70 bg-[var(--theme-background)] border border-[var(--theme-border)] px-1.5 py-0.5 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]">
              SLOTS: {item.slots * item.quantity}{" "}
              {item.quantity > 1 && `(${item.slots}/UN)`}
            </span>
            {item.quantity > 1 && (
              <span className="text-[9px] font-mono text-[var(--theme-accent)] bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 px-1.5 py-0.5">
                QTD: {item.quantity}
              </span>
            )}

            {hasUses && maxUses > 1 && !isActive && (
              <div className="flex items-center bg-[var(--theme-warning)]/10 px-1.5 py-1 border border-[var(--theme-warning)]/30 h-[19px]">
                <HardwareGauge current={currentUses} max={maxUses} />
              </div>
            )}
            {hasUses && isActive && (
              <div className="flex items-center px-1.5 py-1 bg-[var(--theme-background)] border border-[var(--theme-border)] h-[19px]">
                <TelemetryBar percentage={pct} />
              </div>
            )}

            {item.isEquipped && (
              <span className="text-[9px] font-mono text-[var(--theme-success)] font-bold ml-auto animate-pulse">
                [ON]
              </span>
            )}
          </div>
        </div>
      </div>

      {hasActions && (
        <div
          className="flex flex-row md:flex-col shrink-0 md:w-32 bg-[var(--theme-background)]/80 border-t-2 md:border-t-0 md:border-l-2 border-[var(--theme-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {isEquippableType && canEquip && (
            <Button
              size="sm"
              variant={item.isEquipped && isEditMode ? "success" : "primary"}
              className={`flex-1 border-none border-r-2 md:border-r-0 md:border-b-2 border-[var(--theme-border)] rounded-none text-[9px] md:text-[10px] py-4 md:py-2.5 px-1 leading-tight flex items-center justify-center gap-1 ${!isEditMode ? "opacity-40 grayscale hover:text-[var(--theme-accent)]" : ""}`}
              onClick={handleEquipClick}
            >
              {!isEditMode && (
                <svg
                  className="w-3 h-3 fill-current mb-[1px]"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                </svg>
              )}
              {!isEditMode
                ? "BLOQUEADO"
                : item.isEquipped
                  ? "DESEQUIPAR"
                  : "EQUIPAR"}
            </Button>
          )}

          {!isEditMode && canUse && (
            <Button
              size="sm"
              variant="warning"
              className="flex-1 border-none rounded-none text-[9px] md:text-[10px] py-4 md:py-2.5 px-1 break-words leading-tight bg-[var(--theme-warning)]/10 hover:bg-[var(--theme-warning)] hover:text-black"
              onClick={onUse}
              disabled={disableUse}
            >
              {itemSkill ? `[${itemSkill.label}]` : "USAR ITEM"}
            </Button>
          )}

          {canBattle && (
            <Button
              size="sm"
              variant="danger"
              className="flex-1 md:flex-none border-none rounded-none text-[9px] md:text-[10px] py-4 md:py-2.5 px-1 break-words leading-tight bg-[var(--theme-danger)]/10 hover:bg-[var(--theme-danger)] hover:text-white"
              onClick={onUse}
              disabled={disableUse}
            >
              USAR
            </Button>
          )}
        </div>
      )}
      {isEditMode && (
        <div
          className="flex flex-row md:flex-col shrink-0 md:w-22 bg-[var(--theme-background)]/80 border-t-2 md:border-t-0 md:border-l-2 border-[var(--theme-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {(sandboxMode || isDev) && (
            <Button
              size="sm"
              variant="primary"
              className="flex-1 md:flex-none border-none py-4 md:py-2.5 px-1 break-words leading-tight"
              onClick={() => onEdit(item)}
            >
              MOD
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            className="flex-1 border-none py-4 md:py-2.5 px-1 break-words leading-tight"
            onClick={() => onDelete(item)}
          >
            DEL
          </Button>
        </div>
      )}
    </div>
  );
}
