import { motion } from "framer-motion";
import { useRollStore } from "./useRollStore";
import { useCharacterStore } from "../character/store";
import { Modal } from "../../shared/ui/Overlays";
import { Button, Checkbox } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../../shared/utils/discordWebhook";

export function RollResolverModal() {
  const {
    step,
    payload,
    selectedOptionals,
    toggleOptional,
    setResult,
    result,
    close,
  } = useRollStore();
  const name = useCharacterStore((state) => state.name);

  if (step === ("STANDBY" as string) || !payload) return null;

  const handleExecute = () => {
    const allActive = [...payload.fixedEffects, ...selectedOptionals];

    const rollResult = executeRawRoll(payload.baseExpression, allActive);
    
    if (payload.onConfirm) {
      payload.onConfirm();
    }

    if (rollResult.error) {
      RetroToast.error(rollResult.error);
      return;
    }

    let toastMsg = `[${payload.title}] = ${rollResult.total}`;
    let resultColorStr = 3066993; // default success/neutral
    if (rollResult.isCriticalFail || (payload.dc !== undefined && rollResult.total < payload.dc)) {
      resultColorStr = 15158332; // failure
    } else if (rollResult.isCriticalSuccess) {
      resultColorStr = 16753920; // critical
    }

    const embed: DiscordEmbed = {
      title: `[?] RESOLUÇÃO: ${payload.title} [?]`,
      color: resultColorStr,
      description: `**UNIDADE OPERACIONAL:** ${name}\n**EXPRESSÃO:** ${payload.baseExpression}\n**TOTAL:** ${rollResult.total}\n\`\`\`\n${rollResult.log}\n\`\`\``,
      footer: { text: "SYS.MNLT // ROLL_TRACKER" },
      timestamp: new Date().toISOString(),
    };
    dispatchDiscordLog("PLAYER", name, "", [embed]);

    if (payload.resolveAsToast) {
      if (rollResult.isCriticalFail) RetroToast.error(toastMsg);
      else if (
        rollResult.isCriticalSuccess ||
        (payload.dc !== undefined && rollResult.total >= payload.dc)
      )
        RetroToast.success(toastMsg);
      else RetroToast.info(toastMsg);
      close();
    } else {
      setResult(rollResult);
    }
  };

  let resultColor = "text-[var(--theme-accent)]";
  if (result) {
    if (result.isCriticalSuccess)
      resultColor = "text-[var(--theme-success)] glow-success";
    if (result.isCriticalFail)
      resultColor = "text-[var(--theme-danger)] glow-danger animate-pulse";
  }

  return (
    <Modal
      isOpen={step !== ("STANDBY" as string)}
      onClose={close}
      title={`PROCESSAMENTO: ${payload.title}`}
    >
      <div className="flex flex-col gap-4">
        {step === "CONFIGURING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-[var(--theme-background)] border border-[var(--theme-border)] p-3 text-center">
              <span className="text-[10px] font-bold text-[var(--theme-text)]/50 tracking-widest uppercase block mb-1">
                EXPRESSÃO BASE
              </span>
              <span className="text-xl font-mono text-[var(--theme-accent)] font-bold">
                {payload.baseExpression.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase border-b border-[var(--theme-border)] pb-1">
                EFEITOS OPCIONAIS DISPONÍVEIS
              </span>
              {payload.optionalEffects.length > 0 ? (
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {payload.optionalEffects.map((eff) => (
                    <div
                      key={eff.id}
                      className="bg-[var(--theme-accent)]/5 border border-[var(--theme-border)] p-2 flex justify-between items-center hover:border-[var(--theme-accent)]/50 transition-colors"
                    >
                      <Checkbox
                        label={`${eff.description} [${eff.val > 0 ? `+${eff.val}` : eff.val}]`}
                        checked={
                          !!selectedOptionals.find((e) => e.id === eff.id)
                        }
                        onChange={() => toggleOptional(eff)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-[var(--theme-text)]/40 font-mono italic">
                  -- NENHUM MODIFICADOR OPCIONAL DETECTADO --
                </span>
              )}
            </div>

            {payload.fixedEffects.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[9px] font-bold text-[var(--theme-text)]/50 tracking-widest uppercase">
                  MODIFICADORES FIXOS APLICADOS:
                </span>
                <div className="flex flex-wrap gap-1">
                  {payload.fixedEffects.map((eff) => (
                    <span
                      key={eff.id}
                      className="text-[9px] border border-[var(--theme-border)] bg-[var(--theme-background)] px-1 py-0.5 text-[var(--theme-text)]/70 font-mono"
                    >
                      {eff.description.toUpperCase()} [
                      {eff.val > 0 ? `+${eff.val}` : eff.val}]
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="success"
              onClick={handleExecute}
              className="w-full py-3 mt-2 border-dashed"
            >
              CONFIRMAR E PROCESSAR
            </Button>
          </motion.div>
        )}

        {step === "RESOLVED" && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--theme-text)]/50 tracking-widest uppercase">
                LOG DE EXECUÇÃO:
              </span>
              <pre className="text-[10px] text-[var(--theme-text)] font-mono bg-[var(--theme-background)]/80 border border-[var(--theme-border)] p-2 whitespace-pre-wrap">
                {result.log}
              </pre>
            </div>

            <div className="bg-[var(--theme-background)] border border-[var(--theme-accent)] p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase mb-2">
                OUTPUT FINAL
              </span>
              <span
                className={`text-4xl font-bold font-mono glow-text ${resultColor}`}
              >
                {result.total}
              </span>
              {payload?.dc !== undefined && (
                <span
                  className={`mt-2 text-[10px] tracking-widest font-bold px-2 py-1 ${result.total >= payload.dc ? "bg-[var(--theme-success)]/20 text-[var(--theme-success)]" : "bg-[var(--theme-danger)]/20 text-[var(--theme-danger)]"}`}
                >
                  {result.total >= payload.dc ? "[ SUCESSO ]" : "[ FRACASSO ]"}{" "}
                  VS DC {payload.dc}
                </span>
              )}
            </div>

            <Button onClick={close} className="w-full border-dashed">
              ACEITAR
            </Button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
