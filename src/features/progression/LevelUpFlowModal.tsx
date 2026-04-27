import { useState } from "react";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { useCharacterStore } from "../character/store";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";
import { RetroToast } from "../../shared/ui/RetroToast";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";

interface LevelUpFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasFreePoints: boolean;
}

export function LevelUpFlowModal({
  isOpen,
  onClose,
  hasFreePoints,
}: LevelUpFlowModalProps) {
  const confirmDistribution = useCharacterStore(
    (state) => state.confirmDistribution,
  );
  const attributes = useCharacterStore((state) => state.attributes);
  const addMaxHpBonus = useCharacterStore((state) => state.addMaxHpBonus);
  const name = useCharacterStore((state) => state.name);
  const { maxHp } = useCharacterStats();

  const [step, setStep] = useState<"CONFIRM" | "HP_ROLL" | "DONE">("CONFIRM");
  const [rollResult, setRollResult] = useState(0);
  const [rollLog, setRollLog] = useState("");

  if (!isOpen) return null;

  const handleConfirmPoints = () => {
    setStep("HP_ROLL");
  };

  const handleRollHp = () => {
    const con = attributes.constitution || 0;
    const result = executeRawRoll(`1d10+10+${con}`);

    if (result.error) return RetroToast.error(result.error);

    setRollResult(result.total);
    setRollLog(result.log);
    addMaxHpBonus(result.total);

    const msg = `**LEVEL UP - EXPANSÃO DE VIDA:**\n[${name}] rolou os dados de evolução.\n**Fórmula:** 1d10 + 10 + CON(${con})\n**Resultado:** +${result.total} PV máximos!`;
    dispatchDiscordLog("PLAYER", name, msg);
    RetroToast.success(`+${result.total} PV MÁXIMOS!`);

    setStep("DONE");
  };

  const handleFinish = () => {
    confirmDistribution();
    setStep("CONFIRM");
    setRollResult(0);
    setRollLog("");
    addMaxHpBonus(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="PROTOCOLO DE EVOLUÇÃO">
      {step === "CONFIRM" && (
        <div className="flex flex-col gap-4 text-center">
          <span className="text-[var(--theme-accent)] text-sm">
            {hasFreePoints
              ? "Existem pontos livres não distribuídos. Eles serão acumulados e poderão ser gastos no próximo Nível. Deseja prosseguir para a evolução celular?"
              : "Você gastou todos os pontos disponíveis. Deseja confirmar as alocações e prosseguir para a evolução celular?"}
          </span>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="danger"
              onClick={onClose}
              className="border-dashed flex-1"
            >
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmPoints}
              className="flex-1"
            >
              CONFIRMAR ALOCAÇÕES
            </Button>
          </div>
        </div>
      )}

      {step === "HP_ROLL" && (
        <div className="flex flex-col gap-4 text-center bg-[var(--theme-background)]">
          <div className="bg-[var(--theme-background)] p-4 border border-[var(--theme-accent)]/30">
            <span className="text-[10px] tracking-widest uppercase text-[var(--theme-accent)] font-bold block mb-2">
              SAÚDE MÁXIMA ATUAL
            </span>
            <span className="text-4xl font-mono text-[var(--theme-accent)] glow-text font-black">
              {maxHp}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[var(--theme-accent)] font-bold block mt-2">
              FÓRMULA PARA EVOLUÇÃO
            </span>
            <span className="text-2xl font-mono text-[var(--theme-accent)] glow-text font-black">
              1D10 + 10 + CON({attributes.constitution})
            </span>
          </div>
          <span className="text-[var(--theme-text)]/70 text-xs">
            Processo de expansão vital autorizado. A estrutura celular será
            reconfigurada baseada na sua Constituição atual.
          </span>
          <Button
            variant="success"
            className="py-4 animate-pulse border-dashed w-full text-base"
            onClick={handleRollHp}
          >
            [ ROLAR DADOS DE SAÚDE ]
          </Button>
        </div>
      )}

      {step === "DONE" && (
        <div className="flex flex-col gap-4 text-center">
          <div className="bg-[var(--theme-success)]/10 p-4 border border-[var(--theme-success)]/50">
            <span className="text-[10px] tracking-widest uppercase text-[var(--theme-success)] font-bold block mb-2">
              AUMENTO VITAL REGISTRADO
            </span>
            <span className="text-5xl font-mono text-[var(--theme-accent)] glow-text font-black">
              +{rollResult}
            </span>
            <span className="block mt-2 text-xs font-mono text-[var(--theme-success)]/70">
              NOVO MÁXIMO: {maxHp}
            </span>
          </div>
          <pre className="text-[10px] text-[var(--theme-text)] font-mono bg-[var(--theme-background)]/80 border border-[var(--theme-border)] p-2 whitespace-pre-wrap text-left">
            {rollLog}
          </pre>
          <Button
            variant="primary"
            className="py-4 border-dashed w-full"
            onClick={handleFinish}
          >
            [ ENCERRAR EVOLUÇÃO ]
          </Button>
        </div>
      )}
    </Modal>
  );
}
