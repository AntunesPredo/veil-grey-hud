import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import type { JobEvent } from "../../../shared/types/events";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";

interface JobRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: JobEvent;
  characterId: string;
}

export function JobRejectModal({
  isOpen,
  onClose,
  event,
  characterId,
}: JobRejectModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "REJECT_JOB",
      characterId,
    });
    RetroToast.warning("EMPREGO RECUSADO.");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="RECUSAR PROPOSTA" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="bg-red-950/30 border-l-4 border-red-500 p-4">
          <p className="text-sm font-mono text-slate-300">
            Você está prestes a recusar a proposta de trabalho de <span className="text-white font-bold">{event.payload.employerName}</span>.
          </p>
          <p className="text-xs font-mono text-slate-400 mt-2">
            Esta ação removerá você da lista de participantes e você não poderá visualizar este evento novamente a menos que o mestre o convide novamente.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t-2 border-slate-800">
          <Button variant="warning" onClick={onClose} className="px-6">
            CANCELAR
          </Button>
          <Button variant="danger" onClick={handleConfirm} className="px-8 font-black tracking-widest text-xs uppercase animate-pulse shadow-[2px_2px_0px_rgba(239,68,68,0.3)]">
            CONFIRMAR RECUSA
          </Button>
        </div>
      </div>
    </Modal>
  );
}
