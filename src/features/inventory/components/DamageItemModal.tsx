import { useState } from "react";
import type { Item, EquipableItem } from "../../../shared/types/veil-grey";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import { useCharacterStore } from "../../character/store";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../../../shared/utils/discordWebhook";

interface DamageItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DamageItemModal({
  item,
  isOpen,
  onClose,
}: DamageItemModalProps) {
  const name = useCharacterStore((state) => state.name);
  const damageItem = useCharacterStore((state) => state.damageItem);
  const [damageAmount, setDamageAmount] = useState(1);

  if (!item || (item.type !== "ACTIVE" && item.type !== "EQUIPABLE"))
    return null;

  const isArmor =
    item.type === "EQUIPABLE" && !!(item as EquipableItem).armorProps;
  const isTool = item.type === "ACTIVE";

  if (!isArmor && !isTool) return null;

  const handleApplyDamage = () => {
    if (damageAmount <= 0) return;

    const res = damageItem(item.id as string, damageAmount);
    if (res.success) {
      const embed: DiscordEmbed = {
        title: "[!] DANO ESTRUTURAL [!]",
        color: 15158332,
        description: `**UNIDADE OPERACIONAL:** ${name}\n**EQUIPAMENTO:** ${item.name}\n**DANO:** -${damageAmount} Integridade`,
        footer: { text: "SYS.MNLT // LOGISTIC_TRACKER" },
        timestamp: new Date().toISOString(),
      };
      dispatchDiscordLog("INVENTORY", name, "", [embed]);
      RetroToast.error(`DANO APLICADO: -${damageAmount} INTEGRIDADE.`);
      onClose();
    } else {
      RetroToast.warning(res.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DEGRADAR EQUIPAMENTO"
      isDanger
    >
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--theme-danger)]/10 p-2 border border-[var(--theme-danger)]/50 text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-danger)] block mb-1">
            ALVO DA DEGRADAÇÃO
          </span>
          <div className="text-sm font-bold text-[var(--theme-accent)] uppercase">
            {item.name}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-text)]/70">
            INSERIR VALOR DO DANO (PERDA DE USOS / PE):
          </span>
          <Input
            type="number"
            min="1"
            value={damageAmount}
            onChange={(e) => setDamageAmount(parseInt(e.target.value) || 1)}
            className="w-full text-center text-xl font-bold py-3 text-[var(--theme-danger)] border-[var(--theme-danger)]/50"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="primary"
            onClick={onClose}
            className="border-dashed flex-1"
          >
            CANCELAR
          </Button>
          <Button
            variant="danger"
            onClick={handleApplyDamage}
            className="flex-[2] animate-pulse"
          >
            CONFIRMAR DANO
          </Button>
        </div>
      </div>
    </Modal>
  );
}
