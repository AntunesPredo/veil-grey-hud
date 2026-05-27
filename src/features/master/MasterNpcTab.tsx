// src/features/master/MasterNpcTab.tsx
import { useRef, useState, useEffect } from "react";
import { useMasterStore, type MasterNpc } from "./masterStore";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { Button, Checkbox } from "../../shared/ui/Form";
import { RetroToast } from "../../shared/ui/RetroToast";
import CryptoJS from "crypto-js";
import { useCharacterStore } from "../character/store";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key";

export function MasterNpcTab() {
  const npcs = useMasterStore((state) => state.npcs);
  const saveNpc = useMasterStore((state) => state.saveNpc);
  const deleteNpc = useMasterStore((state) => state.deleteNpc);
  const toggleNpcActive = useMasterStore((state) => state.toggleNpcActive);
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const broadcastPartial = useNetworkStore(
    (state) => state.broadcastPartialTelemetry,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingNpc, setEditingNpc] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeNpcs = useMasterStore
        .getState()
        .npcs.filter((n) => n.isActive);
      activeNpcs.forEach((npc) => {
        broadcastPartial(npc.name, "core", {
          attributes: npc.attributes,
          secondaryAttributes: {
            agility: 0,
            mass: 0,
            mental_health: 0,
            perception: 0,
          },
          skills: npc.skills,
          xp: npc.xp,
          level: npc.level,
          name: npc.name,
          creationStatus: "CLOSED",
          freePoints: { attributes: 0, skills: 0, specializations: 0 },
          disadvantages: [],
        });
        broadcastPartial(npc.name, "vitals", {
          hp: npc.hp,
          energy: npc.energy,
          insanity: npc.insanity,
          sustenance: npc.sustenance,
          crisis: { state: null, fails: 0, ignore: false },
        });
        broadcastPartial(npc.name, "inventory", npc.inventory || []);
        broadcastPartial(npc.name, "effects", npc.customEffects || []);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [broadcastPartial]);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const bytes = CryptoJS.AES.decrypt(rawContent, SECRET_KEY);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        const parsed = JSON.parse(decryptedStr);

        const newNpc: MasterNpc = {
          ...parsed.data,
          id: crypto.randomUUID(),
          name: parsed.data.name || "NPC Desconhecido",
          isEnemy: true,
          isActive: false,
        };

        saveNpc(newNpc);
        RetroToast.success(`NPC [${newNpc.name}] IMPORTADO.`);
      } catch (error) {
        RetroToast.error("Falha ao importar NPC." + (error as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createEmptyNpc = () => {
    const blankNpc = useCharacterStore.getState();
    saveNpc({
      ...blankNpc,
      id: crypto.randomUUID(),
      name: "ENTIDADE DESCONHECIDA",
      isEnemy: false,
      isActive: false,
    });
  };

  const toggleEnemy = (id: string, current: boolean) => {
    updateNpcData(id, { isEnemy: !current });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between border-b border-[var(--theme-danger)]/50 pb-2">
        <span className="text-[var(--theme-danger)] font-bold tracking-widest uppercase">
          ARQUIVOS DE AMEAÇAS / NPCS
        </span>
        <div className="flex gap-2">
          <Button size="sm" onClick={createEmptyNpc}>
            + NOVO NPC
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() => fileInputRef.current?.click()}
          >
            IMPORTAR FICHA (.JSON)
          </Button>
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportJson}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {npcs.map((npc) => (
          <div
            key={npc.id}
            className={`border border-[var(--theme-border)] p-3 flex flex-col gap-2 ${npc.isActive ? "bg-[var(--theme-danger)]/10 border-[var(--theme-danger)]" : "bg-black"}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-lg ${npc.isEnemy ? "text-[var(--theme-danger)]" : "text-[var(--theme-accent)]"}`}
                >
                  {npc.name}
                </span>
                <span className="text-[10px] bg-[var(--theme-background)] border px-1">
                  HP: {npc.hp?.current}/{npc.hp?.baseMax}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <Checkbox
                  label="INIMIGO"
                  checked={npc.isEnemy}
                  onChange={() => toggleEnemy(npc.id, npc.isEnemy)}
                />
                <Button
                  size="sm"
                  variant={npc.isActive ? "success" : "primary"}
                  onClick={() => toggleNpcActive(npc.id)}
                  className={npc.isActive ? "animate-pulse border-dashed" : ""}
                >
                  {npc.isActive ? "[ ONLINE ]" : "[ OFFLINE ]"}
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => setEditingNpc(npc.id)}
                >
                  EDITAR
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteNpc(npc.id)}
                >
                  DEL
                </Button>
              </div>
            </div>

            {npc.isActive && (
              <div className="flex gap-2 items-center bg-black p-2 border border-dashed border-[var(--theme-danger)]/30 mt-2">
                <span className="text-[10px] text-[var(--theme-text)]">
                  QUICK DAMAGE:
                </span>
                {[5, 10, 15, 20, 25, 30].map((dmg) => (
                  <Button
                    key={dmg}
                    size="sm"
                    variant="danger"
                    className="h-6 text-[10px] px-2 py-0"
                    onClick={() =>
                      updateNpcData(npc.id, {
                        hp: {
                          ...npc.hp!,
                          current: Math.max(0, npc.hp!.current - dmg),
                        },
                      })
                    }
                  >
                    -{dmg}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}

        {npcs.length === 0 && (
          <span className="text-center text-[var(--theme-text)]/40 text-xs italic mt-10">
            Nenhum registro de NPC no banco de dados local.
          </span>
        )}
      </div>

      {editingNpc && (
        <div className="absolute inset-0 bg-black/90 z-50 p-6 flex flex-col gap-4">
          <span className="text-[var(--theme-warning)] font-bold text-xl">
            EDITOR DE DADOS DO NPC (EM BREVE)
          </span>
          <p className="text-sm">
            Para alterar HP rápido, use os botões na lista. Um editor completo
            de ficha para NPCs pode ser injetado aqui reutilizando os
            componentes do SystemHud, mapeando os inputs para o `updateNpcData`
            em vez do `useCharacterStore`.
          </p>
          <Button onClick={() => setEditingNpc(null)}>FECHAR EDITOR</Button>
        </div>
      )}
    </div>
  );
}
