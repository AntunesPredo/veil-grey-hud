import { useState } from "react";
import { useVitalsStore } from "./useVitalsStore";
import { useCharacterStore } from "../character/store";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";

export function CombatDefenseModal() {
  const { isDefenseOpen, defenseData, closeDefenseModal, openModal } =
    useVitalsStore();
  const name = useCharacterStore((state) => state.name);
  const attributes = useCharacterStore((state) => state.attributes);

  const [step, setStep] = useState<"STANDBY" | "RESOLVED">("STANDBY");
  const [defenseRoll, setDefenseRoll] = useState(0);
  const [defenseLog, setDefenseLog] = useState("");
  const [finalDamage, setFinalDamage] = useState(0);
  const [defenseMsg, setDefenseMsg] = useState("");

  if (!isDefenseOpen || !defenseData) return null;
  const attrKey =
    defenseData.defenseType === "DODGE" ? "dexterity" : "constitution";
  const attrVal = attributes[attrKey] || 0;
  const mod = Math.floor(attrVal / 2);

  const handleRollDefense = () => {
    const defRoll = executeRawRoll(`1d20+${mod}`);
    if (defRoll.error) return RetroToast.error(defRoll.error);

    setDefenseRoll(defRoll.total);
    setDefenseLog(defRoll.log);
    let dmg = defenseData.damage;
    let msg = "";

    if (defRoll.total <= defenseData.attackRoll) {
      msg = "DEFESA FALHOU.";
    } else if (
      defRoll.total === defenseData.attackRoll + 1 ||
      defRoll.total === defenseData.attackRoll + 2
    ) {
      dmg = Math.floor(dmg / 2);
      msg = "DEFESA PARCIAL. DANO REDUZIDO PELA METADE.";
    } else {
      dmg = 0;
      msg = "DEFESA PERFEITA. DANO MITIGADO TOTALMENTE.";
    }

    setFinalDamage(dmg);
    setDefenseMsg(msg);
    setStep("RESOLVED");

    dispatchDiscordLog(
      "PLAYER",
      name,
      `**TENTATIVA DE DEFESA (${defenseData.defenseType === "DODGE" ? "ESQUIVA" : "BLOQUEIO"})**\n**Rolagem:** ${defRoll.total} vs Ataque ${defenseData.attackRoll}\n**Resultado:** ${msg} (${dmg} Dano residual)`,
    );
  };

  const handleContinue = () => {
    closeDefenseModal();
    setStep("STANDBY");
    if (finalDamage > 0) {
      openModal("DAMAGE", finalDamage.toString(), true);
    }
  };

  return (
    <Modal
      isOpen={isDefenseOpen}
      onClose={() => {}}
      title={`DEFESA EM COMBATE: ${defenseData.defenseType === "DODGE" ? "ESQUIVA" : "BLOQUEIO"}`}
    >
      <div className="flex flex-col gap-4 text-center">
        <div className="bg-[var(--theme-danger)]/10 border border-[var(--theme-danger)] p-3">
          <span className="text-[10px] tracking-widest text-[var(--theme-danger)] font-bold block uppercase">
            ATAQUE DE: {defenseData.attackerName}
          </span>
          <span className="text-xl font-mono text-[var(--theme-danger)] font-bold block mt-1">
            ROLAGEM DO ATAQUE: {defenseData.attackRoll} | DANO BRUTO:{" "}
            {defenseData.damage}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-md font-mono text-[var(--theme-accent)] font-bold block mt-1">
            MODIFICADOR:{" "}
            {defenseData.defenseType === "DODGE" ? "DESTREZA" : "CONSTITUIÇÃO"}(
            {attrVal})/2
          </span>
          <span className="text-md font-mono text-[var(--theme-accent)] font-bold block mt-1">
            ROLAGEM: 1D20{mod >= 0 ? `+${mod}` : `${mod}`}
          </span>
        </div>
        {step === "STANDBY" ? (
          <Button
            variant="primary"
            className="py-4 text-lg border-dashed"
            onClick={handleRollDefense}
          >
            [ ROLAR{" "}
            {defenseData.defenseType === "DODGE" ? "ESQUIVA" : "BLOQUEIO"} ]
          </Button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--theme-background)] border border-[var(--theme-accent)] p-3">
              <span className="text-[10px] tracking-widest text-[var(--theme-accent)] font-bold block uppercase">
                RESULTADO DA SUA DEFESA
              </span>
              <span className="text-3xl font-mono text-[var(--theme-accent)] font-bold block glow-text">
                {defenseRoll}
              </span>
              <span
                className={`text-[10px] tracking-widest font-bold mt-2 block ${
                  finalDamage === 0
                    ? "text-[var(--theme-success)]"
                    : finalDamage < defenseData.damage
                      ? "text-[var(--theme-warning)]"
                      : "text-[var(--theme-danger)]"
                }`}
              >
                {defenseMsg}
              </span>
            </div>
            <pre className="text-[10px] text-left text-[var(--theme-text)] font-mono bg-[var(--theme-background)]/80 border border-[var(--theme-border)] p-2 whitespace-pre-wrap">
              {defenseLog ? defenseLog : "Aguardando resultado da defesa"}
            </pre>
            <Button
              variant="danger"
              className="py-4 text-lg border-dashed"
              onClick={handleContinue}
            >
              {finalDamage > 0
                ? `PROSSEGUIR PARA MITIGAÇÃO (${finalDamage} DANO)`
                : "SAIR ILESO"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
