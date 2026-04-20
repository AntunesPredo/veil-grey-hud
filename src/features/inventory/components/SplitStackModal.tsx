import { useState } from "react";
import type { Item } from "../../../shared/types/veil-grey";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import { useCharacterStore } from "../../character/store";

interface SplitStackModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SplitStackModal({
  item,
  isOpen,
  onClose,
}: SplitStackModalProps) {
  const { splitInventoryItem } = useCharacterStore();
  const [mode, setMode] = useState<"SINGLE" | "TOTAL">("SINGLE");
  const [divisor, setDivisor] = useState(1);

  if (!item || item.quantity <= 1) return null;

  const total = item.quantity;
  let preview = [];

  if (mode === "SINGLE") {
    const val = Math.min(Math.max(1, divisor), total - 1);
    preview = [total - val, val];
  } else {
    const parts = Math.min(Math.max(2, divisor), total);
    const size = Math.floor(total / parts);
    const remainder = total % parts;
    preview = Array(parts).fill(size);
    preview[0] += remainder; // O original fica com o resto para não perder matéria
  }

  const handleConfirm = () => {
    if (mode === "SINGLE") {
      splitInventoryItem(
        item.id,
        mode,
        Math.min(Math.max(1, divisor), total - 1),
      );
    } else {
      splitInventoryItem(item.id, mode, Math.min(Math.max(2, divisor), total));
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DIVIDIR STACK (MATÉRIA)">
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--theme-background)]/50 p-2 border border-[var(--theme-border)] text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-accent)]">
            QUANTIDADE TOTAL
          </span>
          <div className="text-2xl font-mono text-[var(--theme-accent)] glow-text">
            {total}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "SINGLE" ? "success" : "primary"}
            onClick={() => {
              setMode("SINGLE");
              setDivisor(1);
            }}
            className="flex-1 border-dashed"
          >
            DIVISÃO ÚNICA
          </Button>
          <Button
            size="sm"
            variant={mode === "TOTAL" ? "success" : "primary"}
            onClick={() => {
              setMode("TOTAL");
              setDivisor(2);
            }}
            className="flex-1 border-dashed"
          >
            DIVISÃO TOTAL
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-text)]/60">
            {mode === "SINGLE"
              ? "QTD. DA NOVA STACK:"
              : "DIVIDIR EM QUANTAS PARTES:"}
          </span>
          <Input
            type="number"
            min={mode === "SINGLE" ? 1 : 2}
            max={mode === "SINGLE" ? total - 1 : total}
            value={divisor}
            onChange={(e) => setDivisor(parseInt(e.target.value) || 1)}
            className="text-center text-lg font-mono"
          />
        </div>

        <div className="border-t border-dashed border-[var(--theme-border)] pt-2 mt-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-accent)] mb-2 block">
            PREVISÃO DE RESULTADO:
          </span>
          <div className="flex flex-wrap gap-2">
            {preview.map((p, idx) => (
              <div
                key={idx}
                className="bg-[var(--theme-background)] border border-[var(--theme-success)]/50 text-[var(--theme-success)] px-3 py-1 font-mono text-xs font-bold"
              >
                [{p}]
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="danger" onClick={onClose}>
            CANCELAR
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            className="animate-pulse"
          >
            CONFIRMAR DIVISÃO
          </Button>
        </div>
      </div>
    </Modal>
  );
}
