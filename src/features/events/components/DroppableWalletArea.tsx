import { useDroppable } from "@dnd-kit/core";
import { FiPlus, FiCreditCard } from "../../../shared/ui/Icons";
import type { BaseItem } from "../../../shared/types/veil-grey";

interface DroppableWalletAreaProps {
  id: string;
  selectedWallet: BaseItem | null;
  expectedCurrency?: "CC" | "FCC";
  onClear?: () => void;
  label?: string;
}

export function DroppableWalletArea({
  id,
  selectedWallet,
  expectedCurrency,
  onClear,
  label = "Arraste uma carteira aqui",
}: DroppableWalletAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "WALLET_AREA",
      expectedCurrency,
    },
  });

  if (selectedWallet) {
    return (
      <div className="p-3 bg-slate-800 border border-emerald-500/50 rounded-none relative flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-900/50 rounded-none text-emerald-400">
            <FiCreditCard />
          </div>
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedWallet.name}
            </div>
            <div className="text-xs text-slate-400">
              Saldo: <span className="text-emerald-400 font-mono">${selectedWallet.wallet?.value} {selectedWallet.wallet?.type}</span>
            </div>
          </div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 px-2"
          >
            Remover
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`p-6 border-2 border-dashed rounded-none flex flex-col items-center justify-center transition-colors ${
        isOver
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
          : "border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-500 hover:text-slate-400"
      }`}
    >
      <FiPlus className="text-2xl mb-2" />
      <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
      {expectedCurrency && (
        <span className="text-xs mt-1">Moeda requerida: {expectedCurrency}</span>
      )}
    </div>
  );
}

