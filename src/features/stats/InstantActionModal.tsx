import { useState } from "react";
import type {
  InstantAction,
  InstantActionTarget,
} from "../../shared/types/veil-grey";
import { Modal } from "../../shared/ui/Overlays";
import { Button, Input } from "../../shared/ui/Form";

interface InstantActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: InstantAction) => void;
}

export function InstantActionModal({
  isOpen,
  onClose,
  onSave,
}: InstantActionModalProps) {
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState(0);
  const [target, setTarget] = useState<InstantActionTarget | "">("");
  const [error, setError] = useState("");

  const handleInject = () => {
    if (!desc || !target) {
      setError("DESCRIÇÃO E ALVO SÃO OBRIGATÓRIOS.");
      return;
    }
    const newAction: InstantAction = {
      id: Date.now() + Math.random(),
      target: target as InstantActionTarget,
      val,
      description: desc,
    };

    onSave(newAction);
    setDesc("");
    setVal(0);
    setTarget("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`SINTETIZAR AÇÃO IMEDIATA`}>
      <div className="flex flex-col gap-3 text-left">
        <div>
          <span className="text-[10px] mb-1 block text-[var(--theme-accent)] tracking-widest font-bold">
            DESCRIÇÃO (Ex: CURA MÉDIA, ADRENALINA)
          </span>
          <Input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="border border-[var(--theme-border)] p-2 bg-[var(--theme-background)]/80">
          <span className="text-[10px] mb-1 block text-[var(--theme-accent)] tracking-widest font-bold">
            ALVO DE INTERVENÇÃO
          </span>
          <select
            value={target || ""}
            onChange={(e) => setTarget(e.target.value as InstantActionTarget)}
            className="w-full bg-[var(--theme-background)] text-[var(--theme-accent)] border border-[var(--theme-border)] p-1.5 outline-none text-xs font-mono uppercase"
          >
            <option value="">-- SELECIONE O ALVO --</option>
            <option value="HP_HEAL">PONTOS DE VIDA (+ CURA)</option>
            <option value="HP_DRAIN">PONTOS DE VIDA (- DANO)</option>
            <option value="HP_TEMP">VIDA TEMPORÁRIA (+ TEMP HP)</option>
            <option value="ENERGY_RESTORE">ENERGIA (RESTAURAR NÍVEL)</option>
            <option value="ENERGY_DRAIN">ENERGIA (DRENAR NÍVEL)</option>
            <option value="SUSTENANCE_ADD">ALIMENTAÇÃO (+ SACIEDADE)</option>
            <option value="SUSTENANCE_DRAIN">ALIMENTAÇÃO (- SACIEDADE)</option>
            <option value="EVILNESS_ADD">LOUCURA (+ SUCUMBIR)</option>
            <option value="EVILNESS_SUB">LOUCURA (- RECENTRALIZAR)</option>
            <option value="EVILNESS_ADD">MALDADE (+ CORRUPÇÃO)</option>
            <option value="EVILNESS_SUB">MALDADE (- REDENÇÃO)</option>
          </select>
        </div>

        <div>
          <span className="text-[10px] mb-1 block text-[var(--theme-accent)] tracking-widest font-bold">
            VALOR APLICADO (+/-)
          </span>
          <Input
            type="number"
            value={val}
            onChange={(e) => setVal(parseInt(e.target.value) || 0)}
            className="w-full"
          />
          <span className="text-[8px] text-[var(--theme-text)]/50 italic mt-1 block">
            * Alvos de Energia ignoram o valor numérico (sobem/descem 1 nível
            por uso).
          </span>
        </div>

        {error && (
          <span className="text-[var(--theme-danger)] text-xs animate-pulse font-bold mt-1">
            {error}
          </span>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="danger" onClick={onClose}>
            CANCELAR
          </Button>
          <Button variant="primary" onClick={handleInject}>
            CONFIRMAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
