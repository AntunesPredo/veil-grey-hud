import { useState } from "react";
import { motion } from "framer-motion";
import { useCharacterStore } from "../character/store";
import type { Item } from "../../shared/types/veil-grey";
import { RetroToast } from "../../shared/ui/RetroToast";
import { Button, Input } from "../../shared/ui/Form";

interface Step1MethodProps {
  onNext: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

export function Step1Method({ onNext, onClose, onError }: Step1MethodProps) {
  const [hash, setHash] = useState("");
  const addInventoryItem = useCharacterStore((state) => state.addInventoryItem);

  const handleImport = () => {
    if (!hash.trim()) return;
    try {
      const decodedString = decodeURIComponent(atob(hash.trim()));
      const decoded = JSON.parse(decodedString) as Item;

      const newItem: Item = {
        ...decoded,
        id: Date.now(),
        isCarried: true,
        parentId: null,
      };

      addInventoryItem(newItem);
      RetroToast.success(`[${newItem.name}] SINTETIZADO COM SUCESSO.`);
      onClose();
    } catch (error) {
      onError(
        `Erro durante a decodificação da matéria - ${(error as Error).message ?? "Desconhecido"}`,
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 pt-4"
    >
      <div className="flex flex-col gap-2 p-4 border border-[var(--theme-accent)] bg-[var(--theme-accent)]/5">
        <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
          RECONSTRUÇÃO VIA HASH (BASE64)
        </span>
        <Input
          placeholder="Insira o código encriptado..."
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="w-full font-mono text-xs"
        />
        <Button
          variant="primary"
          onClick={handleImport}
          className="w-full mt-2"
        >
          EXECUTAR DECODIFICAÇÃO
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#333]" />
        <span className="text-xs text-gray-500 font-bold">OU</span>
        <div className="flex-1 h-px bg-[#333]" />
      </div>

      <Button
        variant="primary"
        onClick={onNext}
        className="w-full py-4 border-dashed"
      >
        + INICIAR CRIAÇÃO MANUAL
      </Button>
    </motion.div>
  );
}
