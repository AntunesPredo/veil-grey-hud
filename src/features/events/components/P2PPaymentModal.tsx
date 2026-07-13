import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import type { P2PTransferEvent } from "../../../shared/types/events";
import { useCharacterStore, type CharacterStore } from "../../character/store";
import { WalletSelectorDnd } from "../../../shared/ui/WalletSelectorDnd";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { P2PLiveDashboard } from "./P2PLiveDashboard";

interface P2PPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: P2PTransferEvent;
}

export function P2PPaymentModal({ isOpen, onClose, event }: P2PPaymentModalProps) {
  const inventory = useCharacterStore((state: CharacterStore) => state.inventory);
  const characterId = useCharacterStore((state: CharacterStore) => state.name);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const selectedWallet = inventory.find((i: any) => i.id === selectedWalletId);
  const myParticipantData = event.payload.participants[characterId];
  const isApproved = myParticipantData?.approved;

  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const isTargeted = event.targets.includes(characterId) || event.targets.length === 0 || event.targets.includes("ALL");
    if (event.status !== "ACTIVE" || !isTargeted) {
       RetroToast.warning("Você foi removido do evento.");
       onClose();
    }
  }, [event.status, event.targets, characterId, onClose]);

  useEffect(() => {
    if (isApproved) {
      setIsConfirming(false);
    }
  }, [isApproved]);

  const handleConfirmWallet = () => {
    if (!selectedWalletId || !selectedWallet || !selectedWallet.wallet) return;

    setIsConfirming(true);
    // Send confirmation to master
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "P2P_CONFIRM_WALLET",
      characterId,
      walletId: selectedWallet.id,
      balance: selectedWallet.wallet.value,
    });
  };

  const handleCancelWallet = () => {
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "P2P_CANCEL_WALLET",
      characterId,
    });
  };

  // If approved but Host not present, show loading
  if (isApproved && !event.payload.hostIsPresent) {
    return (
      <Modal title="SALA DE TRANSFERÊNCIA" onClose={onClose} isOpen={isOpen}>
        <div className="p-12 w-full min-w-[600px] flex flex-col items-center justify-center gap-6 bg-slate-950">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-indigo-400 tracking-widest uppercase animate-pulse text-center">Aguardando o Host iniciar a conexão...</h2>
          <p className="text-slate-500 font-mono text-sm text-center">
            Sua carteira já foi sincronizada.<br/>
            Por favor aguarde a abertura do terminal pelo Host.
          </p>
          <Button variant="danger" onClick={handleCancelWallet} className="mt-4 px-8 tracking-widest text-xs font-bold">
            CANCELAR SELEÇÃO
          </Button>
        </div>
      </Modal>
    );
  }

  // If approved AND Host is present, show the LIVE DASHBOARD
  if (isApproved && event.payload.hostIsPresent) {
    return createPortal(
      <div className="fixed inset-0 z-[9000] bg-slate-950 w-screen h-[100dvh] overflow-hidden">
        <P2PLiveDashboard event={event} isHost={false} onClose={onClose} />
      </div>,
      document.getElementById("app-root") || document.body
    );
  }

  // Step 1: Selecting wallet
  return (
    <Modal title="CONECTAR CARTEIRA" onClose={onClose} isOpen={isOpen}>
      <div className="p-4 w-full min-w-[600px] flex flex-col gap-6">
        
        {/* INFO PANEL */}
        <div className="bg-slate-900 border-2 border-indigo-500/50 p-4 relative">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg tracking-widest uppercase">{event.title}</h3>
          </div>
          <p className="text-slate-400 text-sm font-mono mb-4">{event.description}</p>
          <div className="text-xs font-mono text-indigo-400">
            Você deve conectar uma carteira para entrar na sala de transferência.
          </div>
        </div>

        {/* WALLET SELECTION */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm mb-1">
            SELECIONE A CARTEIRA
          </h4>
          <WalletSelectorDnd
            inventory={inventory}
            currency={event.payload.currency || "CC"}
            selectedWalletId={selectedWalletId}
            onSelect={setSelectedWalletId}
            onUnselect={() => setSelectedWalletId(null)}
          />
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-end mt-4">
          <Button
            variant="success"
            onClick={handleConfirmWallet}
            disabled={!selectedWalletId || isConfirming}
            className="w-full py-4 font-bold uppercase tracking-wider text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {isConfirming ? "Sincronizando..." : "CONFIRMAR CARTEIRA E ENTRAR"}
          </Button>
        </div>

      </div>
    </Modal>
  );
}
