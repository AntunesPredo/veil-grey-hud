import { createPortal } from "react-dom";
import { useCharacterStore } from "../character/store";
import { VG_CONFIG } from "../../shared/config/system.config";
import { RetroToast } from "../../shared/ui/RetroToast";
import { Button } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";

export function CrisisOverlay() {
  const name = useCharacterStore((state) => state.name);
  const crisis = useCharacterStore((state) => state.crisis);
  const applyHealing = useCharacterStore((state) => state.applyHealing);
  const updateCrisis = useCharacterStore((state) => state.updateCrisis);
  const updateInsanity = useCharacterStore((state) => state.updateInsanity);

  const { secondaryAttributes, maxHp } = useCharacterStats();

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

  const handleRollCrisis = () => {
    const mhMod = !isDeath
      ? secondaryAttributes.mental_health >= 0
        ? `+${secondaryAttributes.mental_health}`
        : `${secondaryAttributes.mental_health}`
      : "";
    const notation = `1d20${mhMod}`;

    const result = executeRawRoll(notation);
    if (result.error) {
      RetroToast.error("ERRO NO MOTOR DE DADOS");
      return;
    }

    const isSuccess = result.total >= currentDC;

    if (isSuccess) {
      RetroToast.success(`SUCESSO! Rolou ${result.total} vs DC ${currentDC}`);
      if (isDeath) {
        applyHealing(1, maxHp);
        RetroToast.info("O sujeito se agarrou à vida e despertou.");
      } else {
        updateInsanity(2);
        RetroToast.info("A mente suportou. Retornando ao estado Instável.");
      }
    } else {
      RetroToast.error(`FALHA! Rolou ${result.total} vs DC ${currentDC}`);
      updateCrisis({ fails: crisis.fails + 1 });
      const typeStr = isDeath ? "RESISTÊNCIA À MORTE" : "COLAPSO MENTAL";
      const boxes = [1, 2, 3]
        .map((i) => (i <= crisis.fails + 1 ? "[X]" : "[ ]"))
        .join(" ");
      dispatchDiscordLog(
        "PLAYER",
        name,
        `⚠️ **[ ${name || "SUJEITO"} ] FALHOU NO TESTE DE ${typeStr}!**\nFalhas acumuladas: ${boxes}`,
      );
    }
  };

  const handleConfirmFatal = () => {
    const msg = isDeath
      ? `💀 **[ ${name || "SUJEITO"} ] FALECEU.**\nOs sinais vitais cessaram definitivamente.`
      : `🧠 **[ ${name || "SUJEITO"} ] SOFREU UM COLAPSO PSICOLÓGICO TOTAL!**\nA mente falhou em todas as resistências e colapsou permanentemente.`;
    dispatchDiscordLog("PLAYER", name, msg);
    updateCrisis({ ignore: true, state: null, fails: 0 });
    if (!isDeath) updateInsanity(2);
  };

  const overlayContent = (
    <div className="fixed inset-0 z-[999999] bg-[var(--theme-background)]/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {!isFatal ? (
        <Button
          className={`w-full py-4 text-lg font-bold uppercase tracking-widest transition-colors ${isDeath ? "bg-[var(--theme-danger)]/20 hover:bg-[var(--theme-danger)] text-[var(--theme-accent)] border-[var(--theme-danger)]" : "bg-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)] text-[var(--theme-accent)] hover:text-[var(--theme-background)] border-[var(--theme-accent)]"}`}
          onClick={handleRollCrisis}
        >
          {isDeath ? "RESISTIR À MORTE" : "RESISTIR (S. MENTAL)"}
        </Button>
      ) : (
        <Button
          variant="danger"
          className="w-full py-4 font-bold tracking-widest"
          onClick={handleConfirmFatal}
        >
          CONFIRMAR E SINCRONIZAR TERMINAL
        </Button>
      )}
    </div>
  );

  return createPortal(
    overlayContent,
    document.getElementById("app-root") || document.body,
  );
}
