import React from "react";
import { useMasterStore } from "../masterStore";
import { Button } from "../../../shared/ui/Form";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { useCharacterStore } from "../../character/store";

export const NpcTrackerCard = React.memo(({ playerName }: { playerName: string }) => {
  const npc = useMasterStore((state) => state.npcs.find((n) => n.name === playerName));

  if (!npc) return null;

  const handlePossess = () => {
    const masterStore = useMasterStore.getState();
    const charStore = useCharacterStore.getState();

    if (!masterStore.masterBackup) {
      masterStore.setMasterBackup({ ...charStore });
    }

    charStore.importCharacterData({
      ...npc,
      isPossessing: playerName,
      isMasterMode: false,
      npcType: npc.type,
    });
    RetroToast.warning(`ASSUMINDO CONTROLE DO NPC: ${playerName}`);
  };

  const borderColor = "var(--theme-warning)";
  const bgHeader = "bg-[var(--theme-warning)]";
  const textHeader = "text-black font-black";

  const isHumanoid = npc.type === "HUMAN";

  const agility = Math.floor(((npc.attributes?.dexterity || 0) + (npc.attributes?.instinct || 0)) / 2);
  const actionPoints = Math.max(1, 1 + Math.floor(agility / 3));
  const reactions = Math.max(0, 1 + Math.floor(agility / 4));
  const movement = Math.max(1, Math.floor(agility / 2));

  const mentalHealth = Math.floor(((npc.attributes?.intelligence || 0) + (npc.attributes?.wisdom || 0)) / 2);
  const mass = (npc.attributes?.strength || 0) + (npc.attributes?.constitution || 0);

  const maxInsanity = 3 + mentalHealth;
  const maxSustenance = 4 + mass;

  const currentInsanity = npc.insanity?.current ?? 0;
  const currentSustenance = npc.sustenance?.current ?? 0;

  return (
    <div
      className={`border-2 flex flex-col relative group transition-all duration-300 rounded-none shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-black/20 backdrop-blur`}
      style={{ borderColor }}
    >
      {/* Card Header */}
      <div className={`border-b-2 px-3 py-1.5 uppercase text-xs flex justify-between items-center ${bgHeader} ${textHeader}`} style={{ borderColor }}>
        <div className="flex flex-col">
          <span className="truncate max-w-[150px] sm:max-w-[200px] text-sm leading-tight">{playerName}</span>
          <span className="text-[9px] opacity-70 tracking-widest font-mono mt-0.5">
            {isHumanoid ? "HUMANOIDE" : "NON-PLAYER ENTITY"} | LVL {npc.level || 0}
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          <Button
            size="sm"
            className={`h-5 py-0 px-2 text-[9px] rounded-none font-black bg-black/20 hover:bg-black/40 text-white border-black/20 border`}
            onClick={handlePossess}
          >
            POSSUIR
          </Button>
        </div>
      </div>

      <div className="flex flex-col relative z-0">
        {/* Vitals Grid */}
        <div className={`p-3 grid ${isHumanoid ? 'grid-cols-3' : 'grid-cols-1'} gap-3 text-[10px] font-mono border-b border-[var(--theme-border)] bg-black/40 backdrop-blur`}>
          <div className="flex flex-col border border-[var(--theme-accent)]/30 p-2 bg-[var(--theme-background)]/50">
            <span className="text-[var(--theme-text)]/60 font-bold mb-1 tracking-widest">
              HP_CAPACITY
            </span>
            <span className="text-lg font-black text-[var(--theme-accent)] leading-none">
              {npc.hp?.current ?? 0} <span className="text-xs text-[var(--theme-text)]/50 font-normal">/ {npc.hp?.baseMax ?? 0}</span>
              {npc.hp?.temp ? (
                <span className="text-[var(--theme-success)] text-xs ml-1 font-bold">
                  (+{npc.hp.temp})
                </span>
              ) : null}
            </span>
          </div>

          {isHumanoid && (
            <>
              <div className="flex flex-col border border-[var(--theme-warning)]/30 p-2 bg-[var(--theme-background)]/50">
                <span className="text-[var(--theme-warning)]/60 font-bold mb-1 tracking-widest">
                  PSY_INSANITY
                </span>
                <span className="text-lg font-black text-[var(--theme-warning)] leading-none">
                  {currentInsanity} <span className="text-xs text-[var(--theme-warning)]/50 font-normal">/ {maxInsanity}</span>
                </span>
              </div>

              <div className="flex flex-col border border-[var(--theme-accent)]/30 p-2 bg-[var(--theme-background)]/50">
                <span className="text-[var(--theme-text)]/60 font-bold mb-1 tracking-widest">
                  METABOLISM
                </span>
                <span className="text-lg font-black text-[var(--theme-accent)] leading-none">
                  {currentSustenance} <span className="text-xs text-[var(--theme-accent)]/50 font-normal">/ {maxSustenance}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Stats */}
        <div className="p-2 grid grid-cols-3 gap-2 text-[10px] font-mono border-b border-[var(--theme-border)] bg-black/60 backdrop-blur">
          <div className="flex flex-col items-center border border-[var(--theme-accent)]/30 p-1.5 bg-[var(--theme-background)]/50">
            <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">AÇÕES</span>
            <span className="text-xl font-black text-[var(--theme-accent)]">{actionPoints}</span>
          </div>
          <div className="flex flex-col items-center border border-[var(--theme-warning)]/30 p-1.5 bg-[var(--theme-background)]/50">
            <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">REAÇÕES</span>
            <span className="text-xl font-black text-[var(--theme-warning)]">{reactions}</span>
          </div>
          <div className="flex flex-col items-center border border-[var(--theme-success)]/30 p-1.5 bg-[var(--theme-background)]/50">
            <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">MOVIMENTAÇÃO</span>
            <span className="text-xl font-black text-[var(--theme-success)]">{movement}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
