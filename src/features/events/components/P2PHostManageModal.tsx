import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import type { P2PTransferEvent } from "../../../shared/types/events";
import { useCharacterStore, type CharacterStore } from "../../character/store";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { nanoid } from "nanoid";
import type { Item } from "../../../shared/types/veil-grey";

interface P2PHostManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: P2PTransferEvent;
  isMaster?: boolean;
}

export function P2PHostManageModal({ isOpen, onClose, event, isMaster }: P2PHostManageModalProps) {
  const characterId = useCharacterStore((state: CharacterStore) => state.name);
  const addInventoryItem = useCharacterStore((state: CharacterStore) => state.addInventoryItem);

  const handleWithdraw = () => {
    if (event.payload.pool <= 0) {
      RetroToast.warning("O fundo está vazio.");
      return;
    }

    if (isMaster) {
      // Master absorbing funds
      RetroToast.success(`FUNDO DE ${event.payload.pool} ${event.payload.currency} ABSORVIDO PELO MESTRE.`);
    } else {
      // Player withdrawing funds
      const newWallet: Item = {
        id: nanoid(),
        name: `Fundo Coletivo: ${event.title}`,
        type: "EQUIPABLE",
        quantity: 1,
        slots: 0,
        isCarried: true,
        isEquipped: false,
        parentId: null,
        drawer: null,
        effects: [],
        description: "",
        svgId: "wallet",
        price: 0,
        wallet: {
          type: event.payload.currency as "CC" | "FCC",
          value: event.payload.pool,
          max: null,
        },
      };
      addInventoryItem(newWallet);
      RetroToast.success(`FUNDO DE ${event.payload.pool} ${event.payload.currency} RESGATADO! Verifique seu inventário.`);
    }

    // Send close telemetry to master
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "CLOSE_P2P",
      characterId: isMaster ? "MASTER" : characterId,
    });

    onClose();
  };

  return (
    <Modal title="GERENCIAR FUNDO P2P" onClose={onClose} isOpen={isOpen}>
      <div className="p-4 w-full min-w-[500px] flex flex-col gap-4">
        <div className="bg-slate-900 border-2 border-amber-500/50 p-4 relative">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg tracking-widest uppercase">{event.title}</h3>
            <span className="text-amber-400 font-mono font-bold bg-amber-900/30 px-2 py-1">
              TOTAL: {event.payload.pool} {event.payload.currency}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono mb-4">
            Participantes: {Object.keys(event.payload.participants || {}).length}
          </p>
        </div>

        <p className="text-sm text-slate-300 font-mono">
          Como Host desta transferência, você pode sacar o valor integral do fundo. Ao fazer isso, o evento será encerrado para todos os participantes.
        </p>

        <Button
          variant="warning"
          onClick={handleWithdraw}
          className="w-full font-bold uppercase tracking-wider mt-4"
        >
          {isMaster ? "ABSORVER FUNDOS & ENCERRAR" : "SACAR FUNDOS & ENCERRAR"}
        </Button>
      </div>
    </Modal>
  );
}
