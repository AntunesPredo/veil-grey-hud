import { useMasterStore } from "../masterStore";
import { Button } from "../../../shared/ui/Form";
import { useCharacterStore, extractCharacterData } from "../../character/store";
import { RetroToast } from "../../../shared/ui/RetroToast";

export function MasterQuickActionHeader() {
  const activeNpcId = useMasterStore((state) => state.activeQuickActionNpcId);
  const setActiveNpcId = useMasterStore((state) => state.setActiveQuickActionNpcId);
  const npcs = useMasterStore((state) => state.npcs);
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const masterBackup = useMasterStore((state) => state.masterBackup);
  const setMasterBackup = useMasterStore((state) => state.setMasterBackup);

  const npc = npcs.find((n) => n.id === activeNpcId);

  const currentHp = useCharacterStore((state) => state.hp.current);
  const maxHp = useCharacterStore((state) => state.hp.baseMax);

  if (!npc) return null;

  const handleDisconnect = () => {
    const charStore = useCharacterStore.getState();

    if (npc.type === "NON_HUMAN") {
      updateNpcData(npc.id, extractCharacterData(charStore) as any);
      RetroToast.success("EDIÇÕES DO NPC (NÃO-HUMANO) SALVAS.");
    }

    if (masterBackup) {
      charStore.importCharacterData(masterBackup);
      setMasterBackup(null);
    }

    setActiveNpcId(null);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[400px]">
      <div className="bg-[var(--theme-background)] border-2 border-[var(--theme-accent)] shadow-[0_0_20px_var(--theme-accent)] p-3 w-full flex flex-col gap-2 relative">
        <div className="flex justify-between items-center border-b border-[var(--theme-accent)]/30 pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[var(--theme-accent)]/70 uppercase">
              OVERRIDE DE CONTROLE ATIVO
            </span>
            <span className="text-xl font-bold text-[var(--theme-accent)] uppercase">
              {npc.name}
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={handleDisconnect}>
            DESCONECTAR
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-[var(--theme-text)]">
            HP: {currentHp || 0} / {maxHp || 0}
          </span>
          <div className="flex-1 h-3 bg-black border border-[var(--theme-border)]">
            <div
              className="h-full bg-[var(--theme-accent)] transition-all"
              style={{ width: `${Math.min(((currentHp || 0) / Math.max(1, maxHp || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
