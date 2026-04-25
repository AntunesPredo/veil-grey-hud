import type { Item } from "../../../shared/types/veil-grey";
import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import { useCharacterStore } from "../../character/store";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { dispatchDiscordLog } from "../../../shared/utils/discordWebhook";

interface RepairActiveModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RepairActiveModal({
  item,
  isOpen,
  onClose,
}: RepairActiveModalProps) {
  const name = useCharacterStore((state) => state.name);
  const repairActiveItem = useCharacterStore((state) => state.repairActiveItem);

  if (!item || item.type !== "ACTIVE") return null;

  const handleRepair = (multiplier: number, label: string) => {
    const res = repairActiveItem(item.id, multiplier);
    if (res.recovered > 0) {
      dispatchDiscordLog(
        "INVENTORY",
        name,
        ` **MANUTENÇÃO:** [${name}] realizou manutenção em **${item.name}**.\n**MODO:** ${label} (x${multiplier})\n**RECUPERADO:** +${res.recovered} Integridade.`,
      );
      RetroToast.success(`CONSERTO: +${res.recovered} INTEGRIDADE.`);
    } else {
      RetroToast.warning("O ITEM JÁ ESTÁ EM PERFEITO ESTADO.");
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="MANUTENÇÃO DE EQUIPAMENTO">
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--theme-background)]/50 p-2 border border-[var(--theme-border)] text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-accent)]">
            ALVO DE REPARO
          </span>
          <div className="text-sm font-bold text-[var(--theme-accent)] uppercase mt-1">
            {item.name}
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <Button
            variant="warning"
            onClick={() => handleRepair(1.5, "REPARO RÁPIDO")}
            className="w-full border-dashed py-3 text-xs"
          >
            REPARO RÁPIDO
          </Button>
          <Button
            variant="primary"
            onClick={() => handleRepair(3.0, "MANUTENÇÃO PADRÃO")}
            className="w-full border-dashed py-3 text-xs"
          >
            MANUTENÇÃO PADRÃO
          </Button>
          <Button
            variant="primary"
            onClick={() => handleRepair(4.5, "REVISÃO COMPLETA")}
            className="w-full py-3 text-xs"
          >
            REVISÃO COMPLETA
          </Button>
        </div>
      </div>
    </Modal>
  );
}
