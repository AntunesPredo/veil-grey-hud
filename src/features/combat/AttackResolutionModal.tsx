import { useEffect, useState } from "react";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { useCombatModalsStore } from "./useCombatModalsStore";
import { useCharacterStore } from "../character/store";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../../shared/utils/discordWebhook";

interface RangeOption {
  id: "A" | "B" | "C";
  title: string;
  description: string;
  range: [number, number];
}

export function AttackResolutionModal() {
  const { attackResult, closeAttackResult } = useCombatModalsStore();
  const updateInventoryItem = useCharacterStore((state) => state.updateInventoryItem);
  const inventory = useCharacterStore((state) => state.inventory);

  const [options, setOptions] = useState<RangeOption[]>([]);
  const [rolledLuck, setRolledLuck] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (attackResult?.isFail) {
      const isRupture = attackResult.weaponCondition <= 20;

      const optionA = {
        id: "A" as const,
        title: "OPÇÃO A - FALHA",
        description: "O golpe é executado sem resultado. A arma cai das mãos do usuário e é desequipada.",
      };
      const optionB = {
        id: "B" as const,
        title: "OPÇÃO B - O ERRO",
        description: "Por um erro de cálculo, o alvo não é acertado, mas o golpe é desferido em um aliado próximo.",
      };
      const optionC = isRupture ? {
        id: "C" as const,
        title: "OPÇÃO C - A RUPTURA",
        description: "O desgaste chega ao limite, a arma quebra nas mãos do usuário (impossibilitada de usar até consertar).",
      } : {
        id: "C" as const,
        title: "OPÇÃO C - O DESGASTE",
        description: "A arma atinge o cenário com violência, reduzindo drasticamente seu Limiar de Uso Seguro.",
      };

      const ranges: [number, number][] = [[1, 6], [7, 13], [14, 20]];
      const shuffledOptions = [optionA, optionB, optionC].sort(() => Math.random() - 0.5);

      setOptions(shuffledOptions.map((opt, i) => ({
        ...opt,
        range: ranges[i],
      })));
      setRolledLuck(null);
      setRolling(false);
    }
  }, [attackResult]);

  if (!attackResult) return null;

  const {
    weaponId,
    weaponName,
    weaponType,
    attackRoll,
    isCrit,
    isFail,
    finalDamage,
    isSuccess,
    rollLog,
  } = attackResult;

  const handleRollLuck = () => {
    setRolling(true);
    setTimeout(() => {
      const res = Math.floor(Math.random() * 20) + 1;
      setRolledLuck(res);
      setRolling(false);
    }, 800);
  };

  const handleApplyConsequence = () => {
    if (!rolledLuck) return;

    const triggeredOpt = options.find(o => rolledLuck >= o.range[0] && rolledLuck <= o.range[1]);
    if (!triggeredOpt) return;

    if (triggeredOpt.id === "A") {
      updateInventoryItem(weaponId, "isEquipped", false);
      RetroToast.warning(`[${weaponName}] CAIU E FOI DESEQUIPADA.`);
    } else if (triggeredOpt.id === "B") {
      RetroToast.error("ERRO GRAVE: DANO DESFERIDO EM ALIADO.");
    } else if (triggeredOpt.id === "C") {
      const item = inventory.find(i => i.id === weaponId);
      if (item && item.type === "ACTIVE") {
        if (attackResult.weaponCondition <= 20) {
          updateInventoryItem(weaponId, "uses" as any, 0);
          updateInventoryItem(weaponId, "isEquipped", false);
          RetroToast.error(`[${weaponName}] FOI QUEBRADA (RUPTURA).`);
        } else {
          const loss = (Math.floor(Math.random() * (85 - 15 + 1)) + 15) * 2;
          const newUses = Math.max(0, (item as any).uses - loss);
          updateInventoryItem(weaponId, "uses" as any, newUses);
          RetroToast.warning(`[${weaponName}] SOFREU DESGASTE MASSIVO.`);
        }
      }
    }

    const embed: DiscordEmbed = {
      title: "[X] CONSEQUÊNCIA CRÍTICA [X]",
      color: 15158332,
      description: `**UNIDADE OPERACIONAL:** ${attackResult.attackerName}\n**RESULTADO DA SORTE:** ${rolledLuck}\n**CONSEQUÊNCIA APLICADA:** ${triggeredOpt.title}`,
      footer: { text: "SYS.MNLT // COMBAT_RESOLVER" },
      timestamp: new Date().toISOString(),
    };
    dispatchDiscordLog("PLAYER", attackResult.attackerName, "", [embed]);

    closeAttackResult();
  };

  return (
    <Modal isOpen={true} onClose={isFail ? () => { } : closeAttackResult} title="RESOLUÇÃO DE ATAQUE">
      <div className="flex flex-col gap-4">
        {/* INFO GERAL */}
        <div className="p-3 bg-[var(--theme-background)] border-l-4 border-l-[var(--theme-accent)]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
              ARMA UTILIZADA
            </span>
            <span className="text-xs font-mono text-[var(--theme-text)]">
              {weaponName}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
              ROLAGEM
            </span>
            <span className={`text-sm font-bold font-mono ${isCrit ? "text-[var(--theme-success)]" : isFail ? "text-[var(--theme-danger)]" : "text-[var(--theme-text)]"}`}>
              {attackRoll} {isCrit && "(CRÍTICO)"} {isFail && "(FALHA CRÍTICA)"}
            </span>
          </div>
          {!isFail && (
            <>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                  STATUS
                </span>
                <span className={`text-sm font-bold font-mono ${isSuccess ? "text-[var(--theme-success)]" : "text-[var(--theme-warning)]"}`}>
                  {isSuccess ? "SUCESSO" : (weaponType === "FIREARM" ? "BALA PERDIDA" : "FALHA NO ATAQUE")}
                </span>
              </div>
              {isSuccess && (
                <div className="flex justify-between items-center mt-2 border-t border-dashed border-[var(--theme-border)] pt-2">
                  <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                    DANO CALCULADO
                  </span>
                  <span className="text-sm font-bold font-mono text-[var(--theme-text)]">
                    {finalDamage} PV
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* LOG */}
        <div className="p-2 bg-black border border-[var(--theme-border)] max-h-32 overflow-y-auto custom-scrollbar">
          <pre className="text-[10px] font-mono text-[var(--theme-text)] whitespace-pre-wrap">
            {rollLog}
          </pre>
        </div>

        {/* CONSEQUENCIA CRITICA */}
        {isFail && (
          <div className="flex flex-col gap-3 p-3 bg-[var(--theme-danger)]/10 border-l-4 border-l-[var(--theme-danger)]">
            <span className="text-[12px] font-bold text-[var(--theme-danger)] tracking-widest">
              DADO DE SORTE REQUERIDO
            </span>
            <span className="text-xs text-[var(--theme-text)]">
              Você teve um erro crítico! Rode um d20 para definir o seu destino. As opções abaixo foram sorteadas em ranges de dificuldade.
            </span>

            <div className="flex flex-col gap-2 mt-2">
              {options.map((opt) => (
                <div key={opt.id} className="flex flex-col bg-black/50 p-2 border border-[var(--theme-danger)]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[var(--theme-danger)]">
                      {opt.title}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--theme-accent)]">
                      {opt.range[0]} à {opt.range[1]}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--theme-text)]/70 mt-1">
                    {opt.description}
                  </span>
                </div>
              ))}
            </div>

            {!rolledLuck ? (
              <Button variant="danger" className="w-full mt-2" onClick={handleRollLuck} disabled={rolling}>
                {rolling ? "ROLANDO..." : "RODAR DADO DE SORTE (1D20)"}
              </Button>
            ) : (
              <div className="flex flex-col items-center mt-2 gap-3">
                <span className="text-2xl font-mono text-[var(--theme-accent)] bg-black px-6 py-2 border border-[var(--theme-accent)] rounded">
                  {rolledLuck}
                </span>
                <span className="text-xs font-bold text-[var(--theme-danger)] uppercase">
                  Consequência Aplicada: {options.find(o => rolledLuck >= o.range[0] && rolledLuck <= o.range[1])?.title}
                </span>
                <Button variant="warning" className="w-full" onClick={handleApplyConsequence}>
                  ACEITAR CONSEQUÊNCIA
                </Button>
              </div>
            )}
          </div>
        )}

        {!isFail && (
          <div className="flex justify-end mt-2">
            <Button variant="primary" onClick={closeAttackResult}>
              FECHAR
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
