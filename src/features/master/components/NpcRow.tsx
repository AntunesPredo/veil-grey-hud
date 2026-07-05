import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Checkbox, MultiNumberStepper } from "../../../shared/ui/Form";
import type { MasterNpc } from "../masterStore";

interface NpcRowProps {
  npc: MasterNpc;
  onToggleActive: () => void;
  onToggleEnemy: () => void;
  onAdvancedCreation: () => void;
  onQuickActions: () => void;
  onDelete: () => void;
  onHpChange: (amount: number) => void;
  isQuickActionActive?: boolean;
}

export function NpcRow({
  npc,
  onToggleActive,
  onToggleEnemy,
  onAdvancedCreation,
  onQuickActions,
  onDelete,
  onHpChange,
  isQuickActionActive,
}: NpcRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: npc.id, data: { type: "NPC", payload: npc } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-y-2 border-r-2 border-l-4 h-14 flex relative rounded-none transition-all duration-300 backdrop-blur-sm font-mono tracking-widest border-[var(--theme-border)] ${
        isDragging ? "opacity-30 z-50 shadow-[0_0_15px_var(--theme-accent)]" : "bg-black/80"
      }`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center justify-center border-r-2 border-[var(--theme-border)]/50 bg-black/60 z-20">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors"
        >
          <span className="text-[8px] leading-tight flex flex-col items-center">
            <span>:</span><span>:</span><span>:</span>
          </span>
        </div>
      </div>

      <div
        className={`flex-1 pl-8 pr-4 flex items-center relative overflow-hidden transition-all duration-300 ${
          npc.isActive
            ? "border-r-4 " + (npc.isEnemy ? "border-[var(--theme-danger)]" : "border-[var(--theme-success)]")
            : "border-r-2 border-[var(--theme-border)] bg-black/40"
        }`}
      >
        {npc.isActive && (
          <div 
            className={`absolute inset-0 opacity-40 animate-[pulse_3s_ease-in-out_infinite] ${
              npc.isEnemy ? "bg-[var(--theme-danger)] shadow-[inset_0_0_40px_var(--theme-danger)]" : "bg-[var(--theme-success)] shadow-[inset_0_0_40px_var(--theme-success)]"
            }`}
          />
        )}
        <div className="flex flex-col relative z-10">
          <span
            className={`font-black text-lg uppercase tracking-widest leading-none ${
              npc.isEnemy ? "text-[var(--theme-danger)] drop-shadow-[0_0_4px_var(--theme-danger)]" : "text-[var(--theme-accent)] drop-shadow-[0_0_4px_var(--theme-accent)]"
            }`}
          >
            {npc.isActive ? "> " : ""}{npc.name}
          </span>
          <span className="text-[9px] uppercase font-mono opacity-60 tracking-widest mt-1">
            [{npc.type === "HUMAN" ? "HUMANOIDE" : "MONSTRO"}]
          </span>
        </div>
      </div>

      <div className="flex items-center px-4 shrink-0 bg-black/80 border-r-2 border-[var(--theme-border)]">
        <MultiNumberStepper
          value={npc.hp?.current || 0}
          max={npc.hp?.baseMax || 0}
          onChange={onHpChange}
        />
      </div>

      <div className="flex w-[480px] shrink-0 border-l-4 border-[var(--theme-border)] bg-[var(--theme-background)] divide-x-2 divide-[var(--theme-border)]">
        <div className="flex items-center justify-center w-32 p-0 shrink-0">
          <Checkbox
            fluid
            colorClass="text-[var(--theme-danger)]"
            label="INIMIGO"
            checked={npc.isEnemy || false}
            onChange={onToggleEnemy}
          />
        </div>
        <Button
          size="sm"
          variant={npc.isActive ? "success" : "primary"}
          onClick={onToggleActive}
          className="flex-1 h-full border-none !px-0"
        >
          {npc.isActive ? "OFFLINE" : "ONLINE"}
        </Button>
        <Button
          size="sm"
          variant="warning"
          onClick={onAdvancedCreation}
          className="flex-1 h-full border-none !px-0"
        >
          {npc.type === "HUMAN" && npc.creationStatus === "CLOSED"
            ? "POSSUIR"
            : "CONFIG"}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={onQuickActions}
          disabled={isQuickActionActive}
          className="flex-1 h-full border-none px-4"
        >
          QUICK ACTIONS
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          className="flex-1 h-full border-none !px-0"
        >
          EXCLUIR
        </Button>
      </div>
    </div>
  );
}
