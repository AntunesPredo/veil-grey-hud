import { useEffect, useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input, Checkbox } from "../../../shared/ui/Form";
import { useMasterStore } from "../masterStore";
import { useCharacterStore, extractCharacterData } from "../../character/store";
import { HealthWidget } from "../../vitals/HealthWidget";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { SystemModifiersWidget } from "../../vitals/SystemModifiersWidget";
import { LogisticsPanelV2 } from "../../inventory/LogisticsPanelV2";

interface NpcNonHumanConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcId: string | null;
}

export function NpcNonHumanConfigModal({ isOpen, onClose, npcId }: NpcNonHumanConfigModalProps) {
  const npcs = useMasterStore((state) => state.npcs);
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const masterBackup = useMasterStore((state) => state.masterBackup);
  const setMasterBackup = useMasterStore((state) => state.setMasterBackup);

  const npc = npcs.find((n) => n.id === npcId);

  // Read reactive data from the live store
  const name = useCharacterStore((state) => state.name);
  const updateProgression = useCharacterStore((state) => state.updateProgression);
  const hpStore = useCharacterStore((state) => state.hp);

  const [localIsEnemy, setLocalIsEnemy] = useState(npc?.isEnemy || false);

  const [activeTab, setActiveTab] = useState<"VITALS" | "INVENTORY" | "EFFECTS">("VITALS");

  useEffect(() => {
    if (npc && isOpen) {
      const charStore = useCharacterStore.getState();
      if (!masterBackup) {
        setMasterBackup(charStore);
      }
      charStore.importCharacterData({
        ...npc,
        isMasterMode: true,
        sandboxMode: true,
      });
      setLocalIsEnemy(npc.isEnemy || false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId, isOpen]);

  if (!npc || !isOpen) return null;

  const handleClose = () => {
    const charStore = useCharacterStore.getState();
    if (npcId) {
      updateNpcData(npcId, { ...extractCharacterData(charStore), isEnemy: localIsEnemy } as any);
      RetroToast.success("EDIÇÕES DO NÃO-HUMANO SALVAS.");
    }
    const backup = useMasterStore.getState().masterBackup;
    if (backup) {
      charStore.importCharacterData(backup);
      setMasterBackup(null);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`SISTEMA AUTÔNOMO: ${npc.name}`}>
      <div className="flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">NOME DA ENTIDADE</span>
            <Input
              value={name || ""}
              onChange={(e) => updateProgression({ name: e.target.value })}
            />
          </div>
          <Checkbox
            label="É INIMIGO?"
            checked={localIsEnemy}
            onChange={(e) => setLocalIsEnemy(e.target.checked)}
          />
        </div>

        <div className="flex gap-2 shrink-0 border-b border-[var(--theme-border)] pb-2">
          <Button
            size="sm"
            variant={activeTab === "VITALS" ? "danger" : "primary"}
            className="flex-1"
            onClick={() => setActiveTab("VITALS")}
          >
            SISTEMAS VITAIS
          </Button>
          <Button
            size="sm"
            variant={activeTab === "INVENTORY" ? "warning" : "primary"}
            className="flex-1"
            onClick={() => setActiveTab("INVENTORY")}
          >
            INVENTÁRIO (DROP)
          </Button>
          <Button
            size="sm"
            variant={activeTab === "EFFECTS" ? "success" : "primary"}
            className="flex-1"
            onClick={() => setActiveTab("EFFECTS")}
          >
            EFEITOS ATIVOS
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
          {activeTab === "VITALS" && (
            <div className="flex flex-col gap-4">
              <div className="border border-[var(--theme-border)] bg-black p-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[var(--theme-accent)] uppercase tracking-widest border-b border-[var(--theme-border)] pb-1 mb-1">
                  HP DO MONSTRO (BASE)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">HP ATUAL</span>
                    <Input
                      type="number"
                      value={hpStore.current}
                      onChange={(e) => useCharacterStore.setState(s => ({ hp: { ...s.hp, current: Number(e.target.value) } }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">HP MÁXIMO</span>
                    <Input
                      type="number"
                      value={hpStore.baseMax}
                      onChange={(e) => useCharacterStore.setState(s => ({ hp: { ...s.hp, baseMax: Number(e.target.value) } }))}
                    />
                  </div>
                </div>
              </div>
              <HealthWidget />
            </div>
          )}

          {activeTab === "INVENTORY" && (
            <div className="flex flex-col gap-4 min-h-[400px]">
              <LogisticsPanelV2 />
            </div>
          )}

          {activeTab === "EFFECTS" && (
            <div className="flex flex-col gap-4 min-h-[400px]">
              <SystemModifiersWidget />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[var(--theme-border)] shrink-0">
          <Button variant="success" onClick={handleClose} className="w-full">
            SALVAR NO MAINFRAME
          </Button>
        </div>
      </div>
    </Modal>
  );
}
