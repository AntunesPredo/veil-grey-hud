// src/features/master/MasterNpcTab.tsx
import { useRef, useState } from "react";
import {
  DndContext,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMasterStore, type MasterNpc } from "./masterStore";
import { Button, Input } from "../../shared/ui/Form";
import { RetroToast } from "../../shared/ui/RetroToast";
import CryptoJS from "crypto-js";
import { useCharacterStore, extractCharacterData } from "../character/store";
import { NpcRegistrationModal } from "./components/NpcRegistrationModal";
import { NpcNonHumanConfigModal } from "./components/NpcNonHumanConfigModal";
import { NpcHpModal } from "./components/NpcHpModal";
import { NpcFolder } from "./components/NpcFolder";
import { NpcRow } from "./components/NpcRow";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import { ConfirmModal } from "../../shared/ui/Overlays";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key";

export function MasterNpcTab() {
  const store = useMasterStore();

  const { setNodeRef: rootNpcRef } = useDroppable({ id: "root_NPC" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [sandboxNpcId, setSandboxNpcId] = useState<string | null>(null);
  
  const [hpModalConfig, setHpModalConfig] = useState<{
    isOpen: boolean;
    npcId: string | null;
    mode: "HEAL" | "DAMAGE";
  }>({ isOpen: false, npcId: null, mode: "DAMAGE" });

  const [newFolderName, setNewFolderName] = useState("");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const deleteNpcModal = useDisclosure();
  const deleteFolderModal = useDisclosure();
  
  const [npcToDelete, setNpcToDelete] = useState<MasterNpc | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);

  const [activeDragItem, setActiveDragItem] = useState<{ type: string; payload: MasterNpc } | null>(null);

  // Telemetry removed for local NPCs to prevent network congestion

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
          type: parsed.data.type || "HUMAN",
          folderId: null,
        };

        store.saveNpc(newNpc);
        RetroToast.success(`NPC [${newNpc.name}] IMPORTADO.`);
      } catch (error) {
        RetroToast.error("Falha ao importar NPC." + (error as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    store.addNpcFolder({ id: crypto.randomUUID(), name: newFolderName.toUpperCase(), type: "ITEM" }); // Type isn't strictly used for NPCs but keeping the folder structure
    setNewFolderName("");
  };

  const toggleAcc = (id: string) => setOpenAccordions((p) => ({ ...p, [id]: !p[id] }));

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (!data || data.type === "NPC_FOLDER") return;
    setActiveDragItem({
      type: data.type,
      payload: data.payload,
    });
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeType = active.data.current?.type;

    if (activeType === "NPC") {
      let folderId: string | null | undefined = undefined;

      if (overId.startsWith("npcFolder_")) {
        folderId = overId.replace("npcFolder_", "");
      } else if (overId === "root_NPC") {
        folderId = null;
      } else if (over.data.current?.type === "NPC") {
        folderId = over.data.current?.payload?.folderId || null;
      }

      if (folderId !== undefined) {
        const npc = store.npcs.find((n) => n.id === activeId);
        if (npc && npc.folderId !== folderId) {
          store.moveNpcToFolder(activeId, folderId);
        }
      }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = e;
    if (!over) return;

    if (String(active.id).startsWith("npcFolder_") && String(over.id).startsWith("npcFolder_")) {
      const oldIndex = store.npcFolders.findIndex((f) => f.id === String(active.id).replace("npcFolder_", ""));
      const newIndex = store.npcFolders.findIndex((f) => f.id === String(over.id).replace("npcFolder_", ""));
      if (oldIndex !== -1 && newIndex !== -1) {
        store.reorderNpcFolders(oldIndex, newIndex);
      }
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "NPC" && overType === "NPC" && active.id !== over.id) {
      store.reorderNpcs(active.id as string, over.id as string);
    }
  };

  const handleAdvancedCreation = (npc: MasterNpc) => {
    if (npc.type === "NON_HUMAN") {
      setSandboxNpcId(npc.id);
    } else {
      const charStore = useCharacterStore.getState();
      if (!store.masterBackup) {
        store.setMasterBackup({ ...charStore });
      }

      charStore.importCharacterData({
        ...npc,
        isPossessing: npc.id,
        isMasterMode: false,
      });
      RetroToast.warning(`POSSUINDO HUMANOIDE: ${npc.name}`);
    }
  };

  const handleQuickActions = (npc: MasterNpc) => {
    const charStore = useCharacterStore.getState();
    const activeId = store.activeQuickActionNpcId;

    if (activeId === npc.id) return;

    if (activeId) {
      const prevNpc = store.npcs.find(n => n.id === activeId);
      if (prevNpc && prevNpc.type === "NON_HUMAN") {
        store.updateNpcData(prevNpc.id, extractCharacterData(charStore) as any);
      }
    }

    if (!store.masterBackup) {
      store.setMasterBackup({ ...charStore });
    }
    charStore.importCharacterData({
      ...npc,
      isMasterMode: true,
      sandboxMode: npc.type === "NON_HUMAN",
    });
    store.setActiveQuickActionNpcId(npc.id);
  };

  const renderNpcList = (folderId: string | null) => {
    const npcs = store.npcs.filter((n) => n.folderId === folderId);

    return (
      <SortableContext
        items={npcs.map((n) => String(n.id))}
        strategy={verticalListSortingStrategy}
      >
        {npcs.map((npc) => (
          <NpcRow
            key={npc.id}
            npc={npc}
            onToggleActive={() => store.toggleNpcActive(npc.id)}
            onToggleEnemy={() => store.updateNpcData(npc.id, { isEnemy: !npc.isEnemy })}
            onAdvancedCreation={() => handleAdvancedCreation(npc)}
            onQuickActions={() => handleQuickActions(npc)}
            isQuickActionActive={store.activeQuickActionNpcId === npc.id}
            onDelete={() => {
              setNpcToDelete(npc);
              deleteNpcModal.onOpen();
            }}
            onHpChange={(amount) => {
              const currentHp = npc.hp?.current || 0;
              const maxHp = npc.hp?.baseMax || 0;
              let newHp = currentHp + amount;
              if (newHp > maxHp) newHp = maxHp;
              if (newHp < 0) newHp = 0;
              store.updateNpcData(npc.id, { 
                hp: { ...npc.hp!, current: newHp } 
              });
            }}
          />
        ))}
      </SortableContext>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full border-2 border-[var(--theme-border)] bg-[var(--theme-background)]">
      <div className="flex justify-between items-center border-b-2 border-[var(--theme-border)] px-4 py-3 bg-black/40 shrink-0">
        <span className="text-sm font-black tracking-[0.2em] uppercase text-[var(--theme-accent)] drop-shadow-[0_0_8px_var(--theme-accent)]">
          SYS.DB // REGISTRO_DE_PERSONAS
        </span>
        <span className="opacity-70 font-mono tracking-widest text-[10px] text-[var(--theme-text)]">
          DIR_ROOT
        </span>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-4 overflow-hidden h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[var(--theme-border)] pb-4 shrink-0 gap-4">
          <div className="flex gap-1 flex-1 w-full sm:w-auto">
            <Input
              placeholder="SYS.DIR.NAME..."
              className="h-9 text-[10px] flex-1 uppercase"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button
              size="sm"
              variant="primary"
              className="h-9 px-4 text-[10px]"
              onClick={handleCreateFolder}
            >
              [ MKDIR ]
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setIsRegistrationModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              [ CRIAR ]
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none"
            >
              [ IMPORTAR ]
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

      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-accent)] bg-[var(--theme-accent)]/10 p-2 border-2 border-[var(--theme-accent)] inline-block w-fit">
              SYS.DIR // ROOT
            </span>
            <div ref={rootNpcRef} className="border-dashed border-2 border-[var(--theme-border)] p-1 min-h-[50px] flex flex-col gap-1 bg-black/20">
              {renderNpcList(null)}
            </div>
          </div>

          <SortableContext
            items={store.npcFolders.map((f) => `npcFolder_${f.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {store.npcFolders.map((folder) => (
              <NpcFolder
                key={folder.id}
                id={folder.id}
                name={folder.name}
                isOpen={!!openAccordions[folder.id]}
                onToggle={() => toggleAcc(folder.id)}
                onToggleAllActive={(isActive) => store.toggleFolderNpcsActive(folder.id, isActive)}
                onDelete={() => {
                  setFolderToDelete(folder);
                  deleteFolderModal.onOpen();
                }}
              >
                {renderNpcList(folder.id)}
              </NpcFolder>
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragItem ? (
            <div className="flex items-center gap-2 border-2 border-[var(--theme-accent)] bg-black/80 backdrop-blur-sm p-2 shadow-[0_0_15px_var(--theme-accent)] max-w-[300px]">
              <span className="text-xs font-black uppercase truncate flex-1 leading-tight text-[var(--theme-accent)] tracking-widest">
                {activeDragItem.payload.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NpcRegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setIsRegistrationModalOpen(false)} 
      />

      <NpcNonHumanConfigModal
        isOpen={!!sandboxNpcId}
        onClose={() => setSandboxNpcId(null)}
        npcId={sandboxNpcId}
      />

      <NpcHpModal
        isOpen={hpModalConfig.isOpen}
        onClose={() => setHpModalConfig({ ...hpModalConfig, isOpen: false })}
        npcId={hpModalConfig.npcId}
        mode={hpModalConfig.mode}
      />

      <ConfirmModal
        isOpen={deleteNpcModal.isOpen}
        onClose={deleteNpcModal.onClose}
        title="EXCLUIR NPC"
        isDanger
        message={
          <div className="text-left bg-[var(--theme-background)] p-3 border border-[var(--theme-border)] mt-2">
            <span className="font-bold text-[var(--theme-danger)] block mb-1">
              [{npcToDelete?.name}]
            </span>
            <p className="text-[var(--theme-accent)] text-xs font-mono">
              Os dados deste NPC serão perdidos para sempre. Deseja prosseguir?
            </p>
          </div>
        }
        onConfirm={() => {
          if (npcToDelete) store.deleteNpc(npcToDelete.id);
          deleteNpcModal.onClose();
        }}
      />

      <ConfirmModal
        isOpen={deleteFolderModal.isOpen}
        onClose={deleteFolderModal.onClose}
        title="DESESTRUTURAR DIRETÓRIO"
        isDanger
        message={
          <div className="text-left bg-[var(--theme-background)] p-3 border border-[var(--theme-border)] mt-2 flex flex-col gap-2">
            <span className="font-bold text-[var(--theme-danger)] block">
              DIR: {folderToDelete?.name}
            </span>
            <span className="text-[var(--theme-accent)] text-xs font-mono">
              A exclusão desta pasta retornará todos os NPCs contidos nela para o diretório /ROOT.
            </span>
          </div>
        }
        onConfirm={() => {
          if (folderToDelete) store.removeNpcFolder(folderToDelete.id);
          deleteFolderModal.onClose();
        }}
      />
      </div>
    </div>
  );
}
