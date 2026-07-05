import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import { useMasterStore } from "../masterStore";
import { getBlankCharacterData } from "../../character/store";

interface NpcRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NpcRegistrationModal({
  isOpen,
  onClose,
}: NpcRegistrationModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"HUMAN" | "NON_HUMAN">("HUMAN");
  const saveNpc = useMasterStore((state) => state.saveNpc);

  const handleCreate = () => {
    if (!name.trim()) return;

    const blankNpc = getBlankCharacterData() as any;
    const isHuman = type === "HUMAN";

    saveNpc({
      ...blankNpc,
      id: crypto.randomUUID(),
      name: name.trim().toUpperCase(),
      isEnemy: !isHuman,
      isActive: false,
      type: type,
      folderId: null,
      creationStatus: isHuman ? "NOT_STARTED" : "CLOSED",
      hp: {
        ...blankNpc.hp,
        current: isHuman ? blankNpc.hp.current : 0,
        baseMax: isHuman ? blankNpc.hp.baseMax : 0,
      },
    });

    setName("");
    setType("HUMAN");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="REGISTRO DE NOVA AMEAÇA / NPC"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">
            NOME DA ENTIDADE
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="EX: BANDIDO 1"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">
            TIPO DE ENTIDADE
          </span>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant={type === "HUMAN" ? "danger" : "primary"}
              onClick={() => setType("HUMAN")}
            >
              HUMANO / HUMANOIDE
            </Button>
            <Button
              className="flex-1"
              variant={type === "NON_HUMAN" ? "danger" : "primary"}
              onClick={() => setType("NON_HUMAN")}
            >
              NÃO-HUMANO / MONSTRO
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 border-t border-[var(--theme-border)] pt-4">
          <Button variant="primary" onClick={onClose}>
            CANCELAR
          </Button>
          <Button
            variant="success"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            CRIAR REGISTRO
          </Button>
        </div>
      </div>
    </Modal>
  );
}
