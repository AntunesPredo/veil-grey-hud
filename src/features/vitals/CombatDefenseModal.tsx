import { useState } from "react";
import { useVitalsStore } from "./useVitalsStore";
import { useCharacterStore } from "../character/store";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../../shared/utils/discordWebhook";
import { motion } from "framer-motion";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { useEventsStore } from "../events/store/useEventsStore";
import { useMasterEventsStore } from "../events/store/useMasterEventsStore";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { VG_CONFIG } from "../../shared/config/system.config";

export function CombatDefenseModal() {
  const { isDefenseOpen, defenseData, closeDefenseModal, openModal } =
    useVitalsStore();
  const name = useCharacterStore((state) => state.name);
  const attributes = useCharacterStore((state) => state.attributes);

  const [step, setStep] = useState<"CHOOSE" | "STANDBY" | "RESOLVED">("CHOOSE");
  const [defenseType, setDefenseType] = useState<"DODGE" | "BLOCK" | null>(
    null,
  );
  const [defenseRoll, setDefenseRoll] = useState(0);
  const [defenseLog, setDefenseLog] = useState("");
  const [finalDamage, setFinalDamage] = useState(0);
  const [defenseMsg, setDefenseMsg] = useState("");

  const activeEvents = useEventsStore((state) => state.activeEvents);
  const masterEvents = useMasterEventsStore((state) => state.masterEvents);

  const targetKey = defenseData?.targetId || name;
  let combatEv = activeEvents.find((e) => e.type === "COMBAT" && (e as any).payload?.participants?.[targetKey]);

  if (!combatEv) {
    combatEv = masterEvents.find((e) => e.type === "COMBAT" && (e as any).payload?.participants?.[targetKey]);
  }

  const reactionUsed = combatEv ? (combatEv as any).payload.participants[targetKey].reactionUsed || 0 : 0;
  const inCombat = !!combatEv;

  const { reactions: maxReactions } = useCharacterStats();

  const handleClose = () => {
    setStep("CHOOSE");
    setDefenseType(null);
    setFinalDamage(0);
    closeDefenseModal();
  };

  if (!isDefenseOpen || !defenseData) return null;

  const attrKey = defenseType === "DODGE" ? "dexterity" : "constitution";
  const attrVal = attributes[attrKey as keyof typeof attributes] || 0;
  const mod = Math.floor(attrVal / 2);

  const handleRollDefense = () => {
    const defRoll = executeRawRoll(`${VG_CONFIG.rules.mainDice}+${mod}`);
    if (defRoll.error) return RetroToast.error(defRoll.error);

    setDefenseRoll(defRoll.total);
    setDefenseLog(defRoll.log);
    let dmg = defenseData.damage;
    let msg = "";

    // Consume Reaction
    const targetKey = defenseData.targetId || name;

    const activeEvents = useEventsStore.getState().activeEvents;
    const masterEvents = useMasterEventsStore.getState().masterEvents;

    let combatEv = activeEvents.find(e => e.type === "COMBAT" && (e as any).payload?.participants?.[targetKey]);
    if (!combatEv) {
      combatEv = masterEvents.find(e => e.type === "COMBAT" && (e as any).payload?.participants?.[targetKey]);
    }

    if (combatEv) {
      const newEvent = structuredClone(combatEv) as any;
      if (newEvent.payload.participants[targetKey]) {
        newEvent.payload.participants[targetKey].reactionUsed = (newEvent.payload.participants[targetKey].reactionUsed || 0) + 1;

        // Atualiza a rede P2P
        useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });

        // Atualiza localmente
        useEventsStore.getState().updateEvent(newEvent.id, newEvent); useMasterEventsStore.getState().updateEvent(newEvent.id, newEvent);
      }
    }

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

    const embed: DiscordEmbed = {
      title: `[~] REAÇÃO DE COMBATE: ${defenseType === "DODGE" ? "ESQUIVA" : "BLOQUEIO"} [~]`,
      color: dmg === 0 ? 3066993 : (dmg < defenseData.damage ? 16753920 : 15158332),
      description: `**UNIDADE OPERACIONAL:** ${name}\n**AGRESSOR:** ${defenseData.attackerName}\n**ROLAGEM:** ${defRoll.total} vs Ataque ${defenseData.attackRoll}\n**RESULTADO:** ${msg}\n**DANO RESIDUAL:** ${dmg}`,
      footer: { text: "SYS.MNLT // COMBAT_LOG" },
      timestamp: new Date().toISOString(),
    };

    dispatchDiscordLog("PLAYER", name, "", [embed]);
  };

  const handleTakeDirectDamage = () => {
    const embed: DiscordEmbed = {
      title: "[!] DEFESA IGNORADA [!]",
      color: 15158332,
      description: `**UNIDADE OPERACIONAL:** ${name}\n**AGRESSOR:** ${defenseData.attackerName}\n**RESULTADO:** Recebeu ataque diretamente.\n**DANO RESIDUAL:** ${defenseData.damage}`,
      footer: { text: "SYS.MNLT // COMBAT_LOG" },
      timestamp: new Date().toISOString(),
    };
    dispatchDiscordLog("PLAYER", name, "", [embed]);
    handleClose();
    openModal("DAMAGE", defenseData.damage.toString(), true);
  };

  const handleContinue = () => {
    handleClose();
    if (finalDamage > 0) {
      openModal("DAMAGE", finalDamage.toString(), true);
    }
  };

  return (
    <Modal
      isOpen={isDefenseOpen}
      onClose={handleClose}
      title={`ALERTA DE COMBATE`}
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

        {step === "CHOOSE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3 mt-2"
          >
            {(!inCombat || reactionUsed < maxReactions) ? (
              <>
                <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                  SELECIONE UMA REAÇÃO TÁTICA ({reactionUsed}/{maxReactions}):
                </span>
                <Button
                  onClick={() => {
                    setDefenseType("DODGE");
                    setStep("STANDBY");
                  }}
                  className="py-3 border-dashed"
                >
                  TENTAR ESQUIVAR (USA DESTREZA)
                </Button>
                <Button
                  onClick={() => {
                    setDefenseType("BLOCK");
                    setStep("STANDBY");
                  }}
                  className="py-3 border-dashed"
                >
                  TENTAR BLOQUEAR (USA CONSTITUIÇÃO)
                </Button>
                <div className="border-t border-dashed border-[var(--theme-danger)]/30 my-1" />
              </>
            ) : (
              <span className="text-[10px] font-bold text-[var(--theme-danger)] tracking-widest uppercase mb-2 block border border-[var(--theme-danger)] bg-[var(--theme-danger)]/10 p-2">
                MÁXIMO DE REAÇÕES POR ROUND ATINGIDO.<br />
                IMPOSSÍVEL DEFENDER. VOCÊ DEVE RECEBER O DANO DIRETAMENTE.
              </span>
            )}

            <Button
              variant="danger"
              onClick={handleTakeDirectDamage}
              className="py-3 border-dashed"
            >
              IGNORAR DEFESA E RECEBER O DANO
            </Button>
          </motion.div>
        )}

        {step === "STANDBY" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between">
              <span className="text-md font-mono text-[var(--theme-accent)] font-bold block mt-1">
                MODIFICADOR:{" "}
                {defenseType === "DODGE" ? "DESTREZA" : "CONSTITUIÇÃO"}(
                {attrVal})/2
              </span>
              <span className="text-md font-mono text-[var(--theme-accent)] font-bold block mt-1">
                ROLAGEM: 1D20{mod >= 0 ? `+${mod}` : `${mod}`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                className="py-4 border-dashed"
                onClick={() => setStep("CHOOSE")}
              >
                VOLTAR
              </Button>
              <Button
                variant="primary"
                className="py-4 text-lg border-dashed flex-[2] animate-pulse"
                onClick={handleRollDefense}
              >
                [ ROLAR {defenseType === "DODGE" ? "ESQUIVA" : "BLOQUEIO"} ]
              </Button>
            </div>
          </motion.div>
        )}

        {step === "RESOLVED" && (
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--theme-background)] border border-[var(--theme-accent)] p-3">
              <span className="text-[10px] tracking-widest text-[var(--theme-accent)] font-bold block uppercase">
                RESULTADO DA SUA DEFESA
              </span>
              <span className="text-3xl font-mono text-[var(--theme-accent)] font-bold block glow-text">
                {defenseRoll}
              </span>
              <span
                className={`text-[10px] tracking-widest font-bold mt-2 block ${finalDamage === 0
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
