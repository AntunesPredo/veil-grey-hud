import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import { useMasterStore } from "../masterStore";

interface NpcHpModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcId: string | null;
  mode: "HEAL" | "DAMAGE";
}

export function NpcHpModal({ isOpen, onClose, npcId, mode }: NpcHpModalProps) {
  const [amount, setAmount] = useState<number | "">("");
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const npcs = useMasterStore((state) => state.npcs);
  const npc = npcs.find((n) => n.id === npcId);

  const handleSubmit = () => {
    if (!npc || !npcId || typeof amount !== "number") return;

    const currentHp = npc.hp?.current || 0;
    const maxHp = npc.hp?.baseMax || 0;

    let newHp = currentHp;
    if (mode === "HEAL") {
      newHp = Math.min(maxHp, currentHp + amount);
    } else {
      newHp = Math.max(0, currentHp - amount);
    }

    updateNpcData(npcId, {
      hp: {
        ...npc.hp!,
        current: newHp,
      },
    });

    setAmount("");
    onClose();
  };

  if (!npc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "HEAL" ? "INJETAR CURA" : "REGISTRAR TRAUMA"}
    >
      <div className="flex flex-col gap-4">
        <span className="text-sm font-mono text-[var(--theme-text)]/70">
          ALVO: <span className="font-bold text-[var(--theme-accent)]">{npc.name}</span>
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">QUANTIDADE</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-4 border-t border-[var(--theme-border)] pt-4">
          <Button variant="primary" onClick={onClose}>
            CANCELAR
          </Button>
          <Button
            variant={mode === "HEAL" ? "success" : "danger"}
            onClick={handleSubmit}
            disabled={typeof amount !== "number" || amount <= 0}
          >
            CONFIRMAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
