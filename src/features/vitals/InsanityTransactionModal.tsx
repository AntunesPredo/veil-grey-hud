import { useState } from "react";
import { motion } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { Modal } from "../../shared/ui/Overlays";
import { Button, Input } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";

interface InsanityTransactionModalProps {
  isOpen: boolean;
  mode: "ADD" | "SUB" | null;
  onClose: () => void;
}

export function InsanityTransactionModal({
  isOpen,
  mode,
  onClose,
}: InsanityTransactionModalProps) {
  const name = useCharacterStore((state) => state.name);
  const insanity = useCharacterStore((state) => state.insanity);
  const updateInsanity = useCharacterStore((state) => state.updateInsanity);
  const updateCrisis = useCharacterStore((state) => state.updateCrisis);
  const { maxInsanity } = useCharacterStats();

  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState<"INPUT" | "CONFIRM">("INPUT");
  const [rolledAmount, setRolledAmount] = useState(0);

  if (!isOpen || !mode) return null;

  const handleProcessInput = () => {
    if (!inputValue.trim()) return;

    const result = executeRawRoll(inputValue);
    if (result.error) return RetroToast.error(result.error);

    setRolledAmount(result.total);
    setStep("CONFIRM");
  };

  const handleConfirm = () => {
    const isAdding = mode === "ADD";

    let newTotal = isAdding
      ? insanity.current + rolledAmount
      : Math.max(0, insanity.current - rolledAmount);

    let crisisTriggered = false;

    if (isAdding && newTotal > maxInsanity) {
      newTotal = maxInsanity;
      crisisTriggered = true;
      updateCrisis({ state: "COLLAPSE", fails: 0, ignore: false });
    }

    updateInsanity(newTotal);

    let logMsg = isAdding
      ? `**CORRUPÇÃO MENTAL:** [${name}] sofreu +${rolledAmount} Ponto(s) de Loucura.`
      : `**RECENTRALIZAÇÃO:** [${name}] aliviou -${rolledAmount} Ponto(s) de Loucura.`;

    if (crisisTriggered) {
      logMsg += `\n**ALERTA: [${name}] atingiu o limite da sanidade e entrou em COLAPSO!**`;
      RetroToast.error(`COLAPSO DETECTADO! LIMITE DE LOUCURA ATINGIDO.`);
    } else {
      RetroToast[isAdding ? "error" : "success"](
        isAdding
          ? `LOUCURA AUMENTADA: +${rolledAmount}`
          : `MENTE ESTABILIZADA: -${rolledAmount}`,
      );
    }

    dispatchDiscordLog("PLAYER", name, logMsg);
    handleClose();
  };

  const handleClose = () => {
    setInputValue("");
    setStep("INPUT");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === "ADD"
          ? "REGISTRAR CORRUPÇÃO MENTAL"
          : "REGISTRAR RECENTRALIZAÇÃO"
      }
      isDanger={mode === "ADD"}
    >
      <div className="flex flex-col gap-4">
        {step === "INPUT" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                INSERIR VALOR OU EXPRESSÃO (EX: 1D4, 2)
              </span>
              <Input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProcessInput()}
                className="text-center text-xl font-bold py-3"
              />
            </div>
            <Button
              variant={mode === "ADD" ? "danger" : "success"}
              onClick={handleProcessInput}
              className="py-3"
            >
              PROCESSAR
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div
              className={`bg-[var(--theme-background)] border-2 p-3 text-center ${mode === "ADD" ? "border-[var(--theme-danger)] text-[var(--theme-danger)] glow-danger" : "border-[var(--theme-success)] text-[var(--theme-success)] glow-success"}`}
            >
              <span className="text-xl font-bold block mb-1">
                {mode === "ADD"
                  ? "LOUCURA A SER INJETADA"
                  : "LOUCURA A SER REMOVIDA"}
              </span>
              <span className="text-3xl font-mono font-bold">
                {rolledAmount}
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="primary"
                onClick={() => setStep("INPUT")}
                className="flex-1"
              >
                CANCELAR
              </Button>
              <Button
                variant={mode === "ADD" ? "danger" : "success"}
                onClick={handleConfirm}
                className="flex-1"
              >
                CONFIRMAR
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
