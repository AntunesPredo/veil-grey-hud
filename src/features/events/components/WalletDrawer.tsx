import { useDraggable } from "@dnd-kit/core";
import { FiChevronUp, FiChevronDown, FiCreditCard } from "../../../shared/ui/Icons";
import type { BaseItem } from "../../../shared/types/veil-grey";
import { useCharacterStore } from "../../character/store";

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

function DraggableWalletItem({ item, disabled }: { item: BaseItem; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `wallet-${item.id}`,
    data: {
      type: "WALLET",
      item,
    },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-none flex justify-between items-center border mb-2 ${disabled
          ? "bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed"
          : isDragging
            ? "bg-indigo-900 border-indigo-500 shadow-lg z-50 opacity-90 cursor-grabbing"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600 cursor-grab"
        }`}
    >
      <div className="flex items-center gap-2">
        <FiCreditCard className="text-slate-400" />
        <span className="font-bold text-white text-sm">{item.name}</span>
      </div>
      <div className="text-sm font-mono text-emerald-400">
        ${item.wallet?.value} <span className="text-xs text-slate-400">{item.wallet?.type}</span>
      </div>
    </div>
  );
}

export function WalletDrawer({ isOpen, onClose, onOpen }: WalletDrawerProps) {
  const inventory = useCharacterStore((state) => state.inventory);

  const walletItems = inventory.filter((i) => i.wallet);

  const ccWallets = walletItems.filter((i) => i.wallet?.type === "CC");
  const fccWallets = walletItems.filter((i) => i.wallet?.type === "FCC");

  if (!isOpen) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors z-40"
        onClick={onOpen}
      >
        <span className="text-slate-300 font-bold text-xs uppercase flex items-center gap-2">
          <FiChevronUp /> Selecionar Carteira <FiChevronUp />
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 rounded-none-xl overflow-hidden animate-in slide-in-from-bottom-full duration-300">
      <div
        className="h-10 bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={onClose}
      >
        <span className="text-slate-300 font-bold text-xs uppercase flex items-center gap-2">
          <FiChevronDown /> Esconder Carteiras <FiChevronDown />
        </span>
      </div>
      <div className="p-4 max-h-[40vh] overflow-y-auto">
        {walletItems.length === 0 ? (
          <p className="text-slate-500 text-center text-sm">Nenhuma carteira encontrada no inventário.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-700">
                Corp Credits (CC)
              </h4>
              {ccWallets.length === 0 && <p className="text-slate-600 text-xs italic">Nenhuma carteira CC.</p>}
              {ccWallets.map((item) => (
                <DraggableWalletItem key={item.id} item={item} disabled={!item.isCarried} />
              ))}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-700">
                Fuck Corp Credits (FCC)
              </h4>
              {fccWallets.length === 0 && <p className="text-slate-600 text-xs italic">Nenhuma carteira FCC.</p>}
              {fccWallets.map((item) => (
                <DraggableWalletItem key={item.id} item={item} disabled={!item.isCarried} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

