import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { VG_CONFIG } from "../../shared/config/system.config";
import { Button } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { RetroToast } from "../../shared/ui/RetroToast";

export function CrisisOverlay() {
  const name = useCharacterStore((state) => state.name);
  const crisis = useCharacterStore((state) => state.crisis);
  const applyHealing = useCharacterStore((state) => state.applyHealing);
  const updateCrisis = useCharacterStore((state) => state.updateCrisis);
  const updateInsanity = useCharacterStore((state) => state.updateInsanity);

  const { secondaryAttributes, insStages } = useCharacterStats();

  const [lastRoll, setLastRoll] = useState<{
    total: number;
    log: string;
    success: boolean;
  } | null>(null);

  const [prevCrisisState, setPrevCrisisState] = useState(crisis.state);
  if (crisis.state !== prevCrisisState) {
    setPrevCrisisState(crisis.state);
    setLastRoll(null);
  }

  if (!crisis.state || crisis.ignore) return null;

  const isDeath = crisis.state === "DEATH";
  const baseDC = isDeath
    ? VG_CONFIG.rules.deathBaseDC
    : VG_CONFIG.rules.collapseBaseDC;
  const penalty = isDeath
    ? VG_CONFIG.rules.deathFailPenalty
    : VG_CONFIG.rules.collapseFailPenalty;

  const currentDC = baseDC + crisis.fails * penalty;
  const isFatal = crisis.fails >= 3;

  const title = isDeath
    ? "SYS.ERR // MORTE IMINENTE"
    : "SYS.ERR // COLAPSO PSICOLÓGICO";
  const subtitle = isDeath
    ? "SINAIS VITAIS CRÍTICOS."
    : "INTEGRIDADE MENTAL COMPROMETIDA.";

  const handleRollCrisis = () => {
    const mhMod = !isDeath
      ? secondaryAttributes.mental_health >= 0
        ? `+${secondaryAttributes.mental_health}`
        : `${secondaryAttributes.mental_health}`
      : "";
    const notation = `1d20${mhMod}`;

    const result = executeRawRoll(notation);
    if (result.error) return;

    const isSuccess = result.total >= currentDC;

    setLastRoll({
      total: result.total,
      log: result.log,
      success: isSuccess,
    });

    if (!isSuccess) {
      updateCrisis({ fails: crisis.fails + 1 });
      const typeStr = isDeath ? "RESISTÊNCIA À MORTE" : "COLAPSO MENTAL";
      const boxes = [1, 2, 3]
        .map((i) => (i <= crisis.fails + 1 ? "[X]" : "[ ]"))
        .join(" ");

      dispatchDiscordLog(
        "PLAYER",
        name,
        `**[ ${name || "SUJEITO"} ] FALHOU NO TESTE DE ${typeStr}!**\n**Rolou:** ${result.total} vs DC ${currentDC}\nFalhas acumuladas: ${boxes}`,
      );
    }
  };

  const handleSuccessClose = () => {
    const typeStr = isDeath ? "RESISTÊNCIA À MORTE" : "COLAPSO MENTAL";
    dispatchDiscordLog(
      "PLAYER",
      name,
      `**[ ${name || "SUJEITO"} ] SUPEROU A CRISE: ${typeStr}!**\n**Rolou:** ${lastRoll?.total} vs DC ${currentDC}`,
    );

    updateCrisis({ ignore: true, state: null, fails: 0 });
    setLastRoll(null);

    if (isDeath) {
      applyHealing(1);
      RetroToast.info("SINAIS VITAIS RESTABELECIDOS.");
    } else {
      updateInsanity(insStages[0] + insStages[1] - 1);
      RetroToast.info("COLAPSO MENTAL EVITADO.");
    }
  };

  const handleConfirmFatal = () => {
    const msg = isDeath
      ? ` **[ ${name || "SUJEITO"} ] FALECEU.**\nOs sinais vitais cessaram definitivamente.`
      : ` **[ ${name || "SUJEITO"} ] SOFREU UM COLAPSO PSICOLÓGICO TOTAL!**\nA mente falhou em todas as resistências e colapsou permanentemente.`;

    dispatchDiscordLog("PLAYER", name, msg);
    updateCrisis({ ignore: true, state: null, fails: 0 });
  };

  if (isFatal) {
    return createPortal(
      <div className="fixed inset-0 z-[3000] bg-[var(--theme-background)]/60 backdrop-blur-sm flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          className="w-full bg-[var(--theme-danger)]/10 border-y-4 border-[var(--theme-danger)] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_var(--theme-danger)]"
        >
          <span className="text-3xl md:text-5xl font-black text-[var(--theme-danger)] tracking-[0.2em] uppercase text-center glow-danger">
            {isDeath ? "SINAIS VITAIS CESSADOS" : "PERDA TOTAL DE SANIDADE"}
          </span>
          <span className="text-[var(--theme-accent)] font-mono text-center max-w-2xl opacity-80 text-sm md:text-base">
            {isDeath
              ? `A falha sistêmica é irreversível. O protocolo de reanimação não obteve resposta. ${name} foi a óbito.`
              : `As barreiras psicológicas foram completamente destruídas. ${name} sucumbiu à loucura.`}
          </span>
          <Button
            variant="danger"
            className="mt-6 px-10 py-4 text-lg border-dashed animate-pulse tracking-widest"
            onClick={handleConfirmFatal}
          >
            [ ACEITAR DESTINO ]
          </Button>
        </motion.div>
      </div>,
      document.getElementById("app-root") || document.body,
    );
  }

  const overlayContent = (
    <div className="fixed inset-0 z-[3000] bg-[var(--theme-background)]/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-3xl border-4 bg-[var(--theme-background)] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] ${
          isDeath
            ? "border-[var(--theme-danger)]"
            : "border-[var(--theme-warning)]"
        }`}
      >
        <div
          className={`p-5 border-b-4 flex flex-col gap-1 relative overflow-hidden ${
            isDeath
              ? "bg-[var(--theme-danger)] border-[var(--theme-danger)]"
              : "bg-[var(--theme-warning)] border-[var(--theme-warning)]"
          }`}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)",
            }}
          />
          <h2 className="text-3xl font-black tracking-widest uppercase text-white relative z-10">
            {title}
          </h2>
          <span className="text-xs font-mono font-bold text-white uppercase relative z-10">
            &gt; {subtitle}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div
              className={`border-2 p-4 flex flex-col items-center justify-center bg-[var(--theme-background)] relative ${
                isDeath
                  ? "border-[var(--theme-danger)] shadow-[inset_0_0_20px_var(--theme-danger)]"
                  : "border-[var(--theme-warning)] shadow-[inset_0_0_20px_var(--theme-warning)]"
              }`}
            >
              <span
                className={`absolute top-0 left-0 ${
                  isDeath
                    ? "bg-[var(--theme-danger)]"
                    : "bg-[var(--theme-warning)]"
                } text-white text-[12px] px-1 font-bold tracking-widest uppercase ${
                  isDeath
                    ? "shadow-[0_0_20px_var(--theme-danger)]"
                    : "shadow-[0_0_20px_var(--theme-warning)]"
                }`}
              >
                DIFICULDADE
              </span>
              <span
                className={`text-6xl font-mono font-black mt-2 ${
                  isDeath
                    ? "text-[var(--theme-danger)] glow-danger"
                    : "text-[var(--theme-warning)] glow-warning"
                } ${crisis.fails === 2 ? "madness-burst" : crisis.fails === 1 ? "madness-unstable-2x" : "madness-unstable"}`}
              >
                {currentDC}
              </span>
            </div>

            <div
              className={`border-2 p-4 flex flex-col items-center justify-center bg-[var(--theme-background)] relative ${
                isDeath
                  ? "border-[var(--theme-danger)] shadow-[inset_0_0_20px_var(--theme-danger)]"
                  : "border-[var(--theme-warning)] shadow-[inset_0_0_20px_var(--theme-warning)]"
              }`}
            >
              <span
                className={`absolute top-0 left-0 ${
                  isDeath
                    ? "bg-[var(--theme-danger)]"
                    : "bg-[var(--theme-warning)]"
                } text-white text-[12px] px-1 font-bold tracking-widest uppercase ${
                  isDeath
                    ? "shadow-[0_0_20px_var(--theme-danger)]"
                    : "shadow-[0_0_20px_var(--theme-warning)]"
                }`}
              >
                TENTATIVAS RESTANTES
              </span>
              <span
                className={`text-6xl font-mono font-black mt-2 ${
                  crisis.fails === 2
                    ? "text-[var(--theme-danger)] animate-pulse glow-danger"
                    : "text-[var(--theme-accent)]"
                }`}
              >
                {3 - crisis.fails}
              </span>
            </div>
          </div>

          <div className="flex flex-col border-2 border-[var(--theme-accent)]">
            <div className="bg-[var(--theme-accent)] text-black px-2 py-1 text-[12px] font-bold tracking-widest uppercase flex justify-between">
              <span>OUTPUT</span>
            </div>
            <div className="bg-[var(--theme-background)] p-4 font-mono text-xs overflow-y-auto flex flex-col justify-between">
              {lastRoll ? (
                <>
                  <pre className="text-[var(--theme-text)]/70 whitespace-pre-wrap">
                    {lastRoll.log}
                  </pre>
                </>
              ) : (
                <div className="h-full flex items-center justify-center opacity-30 animate-pulse uppercase tracking-widest text-[var(--theme-text)]">
                  Aguardando input manual de dados...
                </div>
              )}
            </div>
          </div>

          {lastRoll ? (
            <div
              className={`p-2 border-2 flex justify-between items-center font-bold text-lg uppercase tracking-widest ${
                lastRoll.success
                  ? "border-[var(--theme-success)] bg-[var(--theme-success)]/10 text-[var(--theme-success)]"
                  : "border-[var(--theme-danger)] bg-[var(--theme-danger)]/10 text-[var(--theme-danger)] madness-unstable"
              }`}
            >
              <span>RESULTADO: {lastRoll.total}</span>
              <span>
                {lastRoll.success
                  ? "[ OVERRIDE: SUCESSO ]"
                  : "[ OVERRIDE: FALHA ]"}
              </span>
            </div>
          ) : null}

          {lastRoll?.success ? (
            <Button
              variant="success"
              className="w-full py-5 text-xl border-4 border-dashed animate-pulse tracking-widest font-black"
              onClick={handleSuccessClose}
            >
              [ RESTAURAR_SISTEMA ]
            </Button>
          ) : (
            <Button
              variant={isDeath ? "danger" : "warning"}
              className={`w-full py-5 text-xl border-2 font-black text-white tracking-widest ${
                lastRoll ? "border-dashed" : ""
              }`}
              onClick={handleRollCrisis}
            >
              {lastRoll ? "NOVA TENTATIVA" : "EXECUTAR ROLAGEM"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(
    overlayContent,
    document.getElementById("app-root") || document.body,
  );
}
