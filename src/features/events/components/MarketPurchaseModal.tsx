import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import type { MarketEvent, MarketItem } from "../../../shared/types/events";
import { useCharacterStore, type CharacterStore } from "../../character/store";
import { WalletSelectorDnd } from "../../../shared/ui/WalletSelectorDnd";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { FiShoppingCart } from "../../../shared/ui/Icons";

interface MarketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MarketEvent;
}

export function MarketPurchaseModal({ isOpen, onClose, event }: MarketPurchaseModalProps) {
  const inventory = useCharacterStore((state: CharacterStore) => state.inventory);
  const characterId = useCharacterStore((state: CharacterStore) => state.name);
  const overwriteInventoryItem = useCharacterStore((state: CharacterStore) => state.overwriteInventoryItem);
  
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const selectedWallet = inventory.find((i: any) => i.id === selectedWalletId);
  const maxAvailable = selectedWallet?.wallet?.value || 0;

  const handleBuy = () => {
    if (!selectedItem || !selectedWalletId || !selectedWallet || !selectedWallet.wallet) return;
    
    const price = selectedItem.finalPrice;
    if (price > maxAvailable) {
      RetroToast.error("Saldo insuficiente nesta carteira.");
      return;
    }

    // Deduct from local inventory
    overwriteInventoryItem({
      ...selectedWallet,
      wallet: {
        ...selectedWallet.wallet,
        value: selectedWallet.wallet.value - price,
      },
    });

    // Send purchase action to master
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "BUY_ITEM",
      characterId,
      itemId: selectedItem.itemId,
      price: price,
      walletName: selectedWallet.name,
    });

    RetroToast.success(`COMPRA SOLICITADA: ${selectedItem.itemId}`);
    setSelectedItem(null);
    setSelectedWalletId(null);
  };

  return (
    <Modal title={`MERCADO: ${event.title}`} onClose={onClose} isOpen={isOpen} maxWidth="max-w-4xl">
      <div className="p-4 w-full flex flex-col md:flex-row gap-6 h-[600px]">
        
        {/* LEFT PANEL: ITEM LIST */}
        <div className="w-full md:w-1/2 flex flex-col gap-4 border-r border-slate-700 pr-4 overflow-y-auto custom-scrollbar">
          <p className="text-slate-400 text-sm font-mono mb-2">{event.description}</p>
          
          <h4 className="font-bold text-white tracking-widest text-xs uppercase border-b border-slate-700 pb-1">
            ITENS DISPONÍVEIS
          </h4>
          
          <div className="flex flex-col gap-2">
            {event.payload.items.map((item, idx) => {
              const isSelected = selectedItem?.itemId === item.itemId;
              const outOfStock = item.stockLimit !== null && item.stockLimit <= 0;
              
              return (
                <div 
                  key={idx}
                  onClick={() => !outOfStock && setSelectedItem(item)}
                  className={`p-3 border-2 transition-all cursor-pointer ${
                    outOfStock 
                      ? "bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed"
                      : isSelected 
                        ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                        : "bg-slate-800 border-slate-700 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-sm truncate pr-2">{item.itemId}</span>
                    <span className="text-emerald-400 font-mono font-bold whitespace-nowrap">
                      ${item.finalPrice} {event.payload.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Preço Base: ${item.basePrice}</span>
                    <span>
                      Estoque: {item.stockLimit === null ? "Ilimitado" : item.stockLimit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: PAYMENT */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {!selectedItem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-sm border-2 border-dashed border-slate-700">
              <FiShoppingCart className="text-4xl mb-4 opacity-50" />
              <span>SELECIONE UM ITEM PARA COMPRAR</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <div className="bg-emerald-900/20 border border-emerald-500 p-4">
                <h3 className="font-bold text-emerald-400 text-lg mb-2">PAGAMENTO</h3>
                <p className="text-slate-300 font-mono text-sm mb-1">
                  Item: <strong className="text-white">{selectedItem.itemId}</strong>
                </p>
                <p className="text-slate-300 font-mono text-sm">
                  Total: <strong className="text-emerald-400 text-lg">${selectedItem.finalPrice} {event.payload.currency}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm">
                  ARRASTE SUA CARTEIRA
                </h4>
                <WalletSelectorDnd
                  inventory={inventory}
                  currency={event.payload.currency}
                  selectedWalletId={selectedWalletId}
                  onSelect={setSelectedWalletId}
                  onUnselect={() => setSelectedWalletId(null)}
                />
              </div>

              {selectedWalletId && (
                <div className="mt-auto">
                  <Button
                    variant="success"
                    onClick={handleBuy}
                    disabled={maxAvailable < selectedItem.finalPrice}
                    className="w-full font-bold uppercase tracking-wider py-4 text-lg"
                  >
                    CONFIRMAR COMPRA
                  </Button>
                  {maxAvailable < selectedItem.finalPrice && (
                    <p className="text-red-400 text-xs font-mono text-center mt-2">
                      Saldo insuficiente.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
