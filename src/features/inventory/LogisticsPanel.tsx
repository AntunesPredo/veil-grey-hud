import { useCharacterStore } from "../character/store";
import { InventoryManager } from "./InventoryManager";

export function LogisticsPanel() {
  const { isOverweight, currentLoad, maxLoad } = useCharacterStore();

  return (
    <div className="h-full relative">
      <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)] flex flex-col h-full overflow-hidden">
        <div className="bg-[var(--theme-background)]/80 border-b border-[var(--theme-accent)]/40 p-3 font-bold tracking-widest flex justify-between z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] md:text-xs text-[var(--theme-accent)] uppercase flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2H4v6h16v-6h-2v2h-2v-5h-2v5z" />
            </svg>
            LOGÍSTICA & INVENTÁRIO
          </span>
          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <span className="text-[var(--theme-text)]/50 hidden md:block">
              CARGA ESTRUTURAL:
            </span>
            <div
              className={`px-2 py-0.5 border ${isOverweight ? "border-[var(--theme-danger)] text-[var(--theme-danger)] bg-[var(--theme-danger)]/10 animate-pulse" : "border-[var(--theme-success)] text-[var(--theme-success)] bg-[var(--theme-success)]/10"}`}
            >
              {currentLoad} / {maxLoad} SLOTS
            </div>
          </div>
        </div>

        <div className="p-2 md:p-4 flex flex-col gap-4 flex-1 overflow-hidden">
          <InventoryManager currentLoad={currentLoad} maxLoad={maxLoad} />
        </div>
      </div>
    </div>
  );
}
