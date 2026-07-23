import { useState, useRef, useEffect } from "react";
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
import { FiDollarSign, FiLock, CcLogo, FccLogo } from "./Icons";
import { RetroToast } from "./RetroToast";
import { HardwarePanel } from "./HardwarePanel";

interface WalletSelectorDndProps {
  inventory: Item[];
  currency: string;
  selectedWalletId: string | null;
  onSelect: (walletId: string) => void;
  onUnselect?: () => void;
}

function TickerText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden whitespace-nowrap relative flex items-center"
      style={isOverflowing ? { WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)', maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)' } : {}}
    >
      {isOverflowing && (
        <style>{`
          @keyframes infinite-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-ticker {
            animation: infinite-ticker 4s linear infinite;
            display: inline-flex;
            width: max-content;
          }
        `}</style>
      )}

      {isOverflowing ? (
        <div className="animate-infinite-ticker">
          <span className="font-bold tracking-wide text-sm text-white drop-shadow-md pr-8">
            {text}
          </span>
          <span className="font-bold tracking-wide text-sm text-white drop-shadow-md pr-8">
            {text}
          </span>
        </div>
      ) : (
        <span ref={textRef} className="font-bold tracking-wide text-sm text-white drop-shadow-md">
          {text}
        </span>
      )}
    </div>
  );
}

function WalletCard({ item, isSelected, isOverlay = false }: { item: Item; isSelected: boolean; isOverlay?: boolean }) {
  const isBlocked = !item.isCarried;
  const Logo = item.wallet?.type === "CC" ? CcLogo : item.wallet?.type === "FCC" ? FccLogo : FiDollarSign;

  return (
    <HardwarePanel
      preset="top-left"
      cornerSize={12}
      borderWidth={2}
      borderColorClass={isSelected || isOverlay ? 'bg-[var(--theme-accent)]' : isBlocked ? 'bg-[#333]' : 'bg-[var(--theme-border)]'}
      innerColorClass={isSelected ? "bg-[var(--theme-background)]" : isBlocked ? "bg-[#050505]" : "bg-[#0a0a0a]"}
      className={`min-w-[14rem] max-w-[16rem] h-20 transition-all duration-200 ${isOverlay ? 'shadow-none rotate-3 opacity-90 z-[9999] scale-105' : ''}`}
      innerClassName={`flex items-center p-3 text-xs font-mono select-none transition-all duration-200 ${isSelected ? "text-[var(--theme-accent)] shadow-[inset_0_0_15px_var(--theme-accent)]" : isBlocked ? "text-slate-600 grayscale cursor-not-allowed" : "text-slate-300 cursor-grab active:cursor-grabbing hover:bg-[#151515]"}`}
    >
      {isBlocked && (
        <div className="absolute top-2 right-2 bg-slate-900 p-1 border border-slate-700">
          <FiLock className="text-red-400 text-xs" />
        </div>
      )}

      <div className={`flex items-center justify-center w-10 h-10 bg-black/40 border border-white/5 mr-3 ${isSelected ? 'text-[var(--theme-accent)]' : 'text-emerald-400'}`}>
        <Logo className="w-6 h-6" />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TickerText text={item.name} />
        <span className="opacity-80 mt-1 flex items-center gap-1 font-medium text-emerald-300">
          Saldo: <span className="text-white">{item.wallet?.value}</span>
        </span>
      </div>
    </HardwarePanel>
  );
}

function DraggableWallet({ item, isSelected, globalSelected, onError }: { item: Item; isSelected: boolean; globalSelected: boolean; onError: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
    disabled: !item.isCarried || isSelected || globalSelected,
  });

  if (isDragging || isSelected) {
    return (
      <HardwarePanel
        ref={setNodeRef}
        preset="top-left"
        cornerSize={12}
        borderWidth={2}
        borderColorClass="bg-slate-800"
        innerColorClass="bg-[#050505] bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]"
        className="min-w-[14rem] max-w-[16rem] h-20 shrink-0 opacity-60"
        innerClassName="flex items-center justify-center"
      >
        <span className="text-slate-500 font-mono text-[10px] tracking-widest uppercase font-bold">ESPAÇO VAGO</span>
      </HardwarePanel>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        if (globalSelected) {
          onError();
        }
        if (listeners?.onPointerDown) {
          listeners.onPointerDown(e as any);
        }
      }}
    >
      <WalletCard item={item} isSelected={isSelected} />
    </div>
  );
}

function DroppableZone({ selectedWallet, currency, isEjecting, errorPulse }: { selectedWallet: Item | undefined; currency: string; isEjecting: boolean; errorPulse?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "wallet-drop-zone",
  });

  const Logo = currency === "CC" ? CcLogo : currency === "FCC" ? FccLogo : FiDollarSign;

  const isClamped = selectedWallet && !isEjecting;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center h-36 w-full border-4 transition-all duration-300 overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)]
        ${isOver
          ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]"
          : selectedWallet
            ? "border-[var(--theme-accent)]/50 bg-[#050505]"
            : "border-[var(--theme-border)] bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,rgba(255,255,255,0.02)_5px,rgba(255,255,255,0.02)_10px)] bg-[#050505] text-slate-500"
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className={`absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#111] to-[#222] border-r-2 border-[var(--theme-accent)] shadow-[2px_0_10px_rgba(0,0,0,0.9)] z-20 transition-transform duration-300 ease-out flex items-center justify-center
        ${isClamped ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-1 h-12 bg-black/50 rounded-full border border-white/5" />
      </div>

      <div className={`absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#111] to-[#222] border-l-2 border-[var(--theme-accent)] shadow-[-2px_0_10px_rgba(0,0,0,0.9)] z-20 transition-transform duration-300 ease-out flex items-center justify-center
        ${isClamped ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-1 h-12 bg-black/50 rounded-full border border-white/5" />
      </div>

      {errorPulse && (
        <style>{`
          @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-error-shake {
            animation: error-shake 0.3s ease-in-out;
          }
        `}</style>
      )}

      {selectedWallet ? (
        <div className={`flex flex-col items-center relative z-10 w-full px-4 transition-all duration-300 ${isEjecting ? 'animate-pulse scale-95 opacity-50 translate-y-2' : 'scale-100 opacity-100'} ${errorPulse ? 'animate-error-shake' : ''}`}>
          <div className="pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
            <WalletCard item={selectedWallet} isSelected={false} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pointer-events-none relative z-10">
          <Logo className={`w-12 h-12 mb-3 transition-colors ${isOver ? 'animate-pulse text-[var(--theme-accent)]' : 'opacity-40 text-slate-500'}`} />
          <span className="font-mono text-sm tracking-widest font-semibold opacity-70">
            {isOver ? "LIGANDO CONTATOS..." : "ARRASTE A CARTEIRA AQUI"}
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
  const [isEjecting, setIsEjecting] = useState(false);
  const [errorPulse, setErrorPulse] = useState(false);

  const triggerError = () => {
    setErrorPulse(true);
    setTimeout(() => setErrorPulse(false), 400);
  };

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

  const handleEject = () => {
    setIsEjecting(true);
    setTimeout(() => {
      if (onUnselect) onUnselect();
      setIsEjecting(false);
    }, 400);
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-4 w-full mt-2">
        <div className="flex flex-col items-center">
          <DroppableZone selectedWallet={selectedWallet} currency={currency} isEjecting={isEjecting} errorPulse={errorPulse} />

          <div className="h-10 w-full flex justify-center -mt-[2px] relative z-30 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            <HardwarePanel
              preset="bottom-edges"
              cornerSize={10}
              borderWidth={2}
              borderColorClass={selectedWallet && !isEjecting ? (errorPulse ? 'bg-red-400' : 'bg-red-500/50') : 'bg-[#020202]'}
              innerColorClass="bg-transparent"
              className="transition-all duration-300 !pt-0"
              innerClassName="h-full"
            >
              <button
                disabled={!selectedWallet || isEjecting}
                onClick={handleEject}
                className={`w-full h-full flex items-center justify-center gap-2 px-8 py-2 font-black tracking-widest text-[10px] uppercase transition-all duration-300
                  ${selectedWallet && !isEjecting
                    ? `hover:bg-red-900 active:scale-95 shadow-[inset_0_5px_15px_rgba(239,68,68,0.2)] ${errorPulse ? 'bg-red-600 text-white shadow-[0_0_20px_red]' : 'bg-red-950 text-red-500'}`
                    : 'bg-[#050505] text-slate-800 cursor-not-allowed opacity-80'
                  }
                `}
              >
                ⏏ EJECT
                <div className={`w-2 h-2 rounded-full ${selectedWallet && !isEjecting ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-slate-800'} ${errorPulse ? 'bg-white' : ''}`} />
              </button>
            </HardwarePanel>
          </div>
        </div>

        <div className="flex flex-col bg-[var(--theme-background)] p-4 border border-[var(--theme-border)] relative shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] text-[var(--theme-accent)] font-bold tracking-widest uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--theme-accent)] animate-pulse" />
              CARTEIRAS COMPATÍVEIS ({currency})
            </span>
          </div>

          {compatibleWallets.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 min-h-[5.5rem]">
              {compatibleWallets.map((wallet) => (
                <DraggableWallet
                  key={wallet.id}
                  item={wallet}
                  isSelected={wallet.id === selectedWalletId}
                  globalSelected={!!selectedWalletId}
                  onError={triggerError}
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
