import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  pointerWithin,
  DragOverlay,
} from "@dnd-kit/core";
import type { Item } from "../types/veil-grey";
import { FiDollarSign, FiLock, FiCheck, CcLogo, FccLogo } from "./Icons";
import { RetroToast } from "./RetroToast";

interface WalletSelectorDndProps {
  inventory: Item[];
  currency: string;
  selectedWalletId: string | null;
  onSelect: (walletId: string) => void;
  onUnselect?: () => void;
}

function WalletCard({ item, isSelected, isOverlay = false }: { item: Item; isSelected: boolean; isOverlay?: boolean }) {
  const isBlocked = !item.isCarried;
  const Logo = item.wallet?.type === "CC" ? CcLogo : item.wallet?.type === "FCC" ? FccLogo : FiDollarSign;
  
  return (
    <div
      className={`relative flex items-center p-3 border border-slate-700/50 text-xs font-mono select-none min-w-[14rem] max-w-[16rem] h-20 shadow-lg backdrop-blur-md transition-all duration-200
        ${
          isSelected
            ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] opacity-50 shadow-[0_0_10px_var(--theme-accent)]"
            : isBlocked
              ? "bg-slate-900/80 text-slate-500 opacity-60 grayscale cursor-not-allowed"
              : isOverlay
                ? "border-[var(--theme-accent)] bg-slate-800 shadow-[0_0_20px_var(--theme-accent)] scale-105 z-[9999]"
                : "bg-slate-800/60 text-slate-300 cursor-grab active:cursor-grabbing hover:bg-slate-700 hover:border-slate-500 hover:shadow-md"
        }
      `}
    >
      {isBlocked && (
        <div className="absolute top-2 right-2 bg-slate-900 p-1 border border-slate-700">
          <FiLock className="text-red-400 text-xs" />
        </div>
      )}
      
      <div className={`flex items-center justify-center w-10 h-10 bg-black/40 border border-white/5 mr-3 ${isSelected ? 'text-[var(--theme-accent)]' : 'text-emerald-400'}`}>
        <Logo className="w-6 h-6" />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="font-bold truncate w-full tracking-wide text-sm text-white drop-shadow-md">{item.name}</span>
        <span className="opacity-80 mt-1 flex items-center gap-1 font-medium text-emerald-300">
          Saldo: <span className="text-white">{item.wallet?.value}</span>
        </span>
      </div>
    </div>
  );
}

function DraggableWallet({ item, isSelected }: { item: Item; isSelected: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
    disabled: !item.isCarried || isSelected,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-30' : ''}`}
    >
      <WalletCard item={item} isSelected={isSelected} />
    </div>
  );
}

function DroppableZone({ selectedWallet, currency }: { selectedWallet: Item | undefined; currency: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "wallet-drop-zone",
  });
  
  const Logo = currency === "CC" ? CcLogo : currency === "FCC" ? FccLogo : FiDollarSign;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center h-36 w-full border border-dashed transition-all duration-300 overflow-hidden
        ${
          isOver
            ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] shadow-[inset_0_0_20px_var(--theme-accent)]"
            : selectedWallet
              ? "border-emerald-500 bg-emerald-900/20 text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]"
              : "border-slate-600 bg-slate-900/50 text-slate-500 hover:bg-slate-800/50 hover:border-slate-500"
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {selectedWallet ? (
        <div className="flex flex-col items-center animate-fade-in relative z-10">
          <div className="bg-emerald-500/20 p-3 mb-2">
            <FiCheck className="text-4xl text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-widest text-white drop-shadow-md">{selectedWallet.name}</span>
          <span className="font-mono text-sm mt-1 bg-black/50 px-3 py-1 border border-emerald-500/30">
            SALDO: <span className="text-white font-bold">{selectedWallet.wallet?.value}</span>
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center pointer-events-none relative z-10">
          <Logo className={`w-12 h-12 mb-3 ${isOver ? 'animate-pulse text-[var(--theme-accent)]' : 'opacity-40'}`} />
          <span className="font-mono text-sm tracking-widest font-semibold">
            ARRASTE A CARTEIRA AQUI
          </span>
        </div>
      )}
    </div>
  );
}

export function WalletSelectorDnd({
  inventory,
  currency,
  selectedWalletId,
  onSelect,
  onUnselect,
}: WalletSelectorDndProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const compatibleWallets = inventory.filter(
    (i) => i.wallet && i.wallet.type === currency,
  );

  const selectedWallet = compatibleWallets.find((w) => w.id === selectedWalletId);
  const activeWallet = compatibleWallets.find((w) => w.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && over.id === "wallet-drop-zone") {
      const item = active.data.current?.item as Item | undefined;
      if (item && item.isCarried) {
        onSelect(item.id);
      } else {
        RetroToast.error("ESTE ITEM NÃO ESTÁ SENDO CARREGADO.");
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-5 w-full mt-2">
        <DroppableZone selectedWallet={selectedWallet} currency={currency} />
        
        <div className="flex flex-col bg-slate-900/60 p-4 border border-slate-700/80 relative shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] text-[var(--theme-accent)] font-bold tracking-widest uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--theme-accent)] animate-pulse" />
              CARTEIRAS COMPATÍVEIS ({currency})
            </span>
            {selectedWalletId && onUnselect && (
              <button 
                onClick={onUnselect}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors font-bold uppercase tracking-wider bg-black/40 px-2 py-1 border border-white/5"
              >
                LIMPAR SELEÇÃO
              </button>
            )}
          </div>
          
          {compatibleWallets.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {compatibleWallets.map((wallet) => (
                <DraggableWallet
                  key={wallet.id}
                  item={wallet}
                  isSelected={wallet.id === selectedWalletId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm font-mono text-slate-500 bg-black/20 border border-dashed border-slate-700">
              NENHUMA CARTEIRA ({currency}) ENCONTRADA.
            </div>
          )}
        </div>
      </div>
      
      <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeWallet ? (
          <WalletCard item={activeWallet} isSelected={false} isOverlay={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
