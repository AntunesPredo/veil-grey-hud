import { useState, useMemo, useRef, useEffect } from "react";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { Button } from "../../shared/ui/Form";
import { ConfirmModal } from "../../shared/ui/Overlays";
import { useInventoryDndV2 } from "./hooks/useInventoryDndV2";
import { ItemModal } from "../item-modal/ItemModal";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import type { Item } from "../../shared/types/veil-grey";
import {
  dispatchDiscordLog,
  type DiscordEmbed,
} from "../../shared/utils/discordWebhook";
import { RetroToast } from "../../shared/ui/RetroToast";
import { useCustomSvgIcons } from "../../shared/hooks/useCustomSvgIcons";
import { InventoryZoneV2 } from "./components/InventoryZoneV2";

const isDev =
  import.meta.env.VITE_IN_DEVELOPMENT === "true" || import.meta.env.DEV;

const dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

function MinimalistDragOverlay({ item }: { item: Item }) {
  const { getSpecificIcon } = useCustomSvgIcons();
  const icon = getSpecificIcon(item.svgId);
  return (
    <div className="flex items-center gap-4 bg-[var(--theme-background)] border-2 border-[var(--theme-accent)] p-3 shadow-[0_0_20px_var(--theme-accent)] scale-105 rotate-2 opacity-95 w-[320px] md:w-[400px] relative overflow-hidden z-[9999]">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 10px, var(--theme-accent) 10px, var(--theme-accent) 20px)",
        }}
      />
      <svg
        className="w-12 h-12 fill-[var(--theme-accent)] relative z-10 shrink-0"
        viewBox={icon.viewBox}
      >
        {icon.svg}
      </svg>
      <div className="flex flex-col relative z-10 min-w-0">
        <span className="font-black text-[var(--theme-accent)] uppercase text-sm md:text-base tracking-widest truncate">
          {item.name}
        </span>
        <span className="text-[10px] font-mono font-bold text-[var(--theme-background)] bg-[var(--theme-accent)] px-2 py-0.5 w-fit mt-1 tracking-widest">
          MOVENDO BLOCO DE DADOS...
        </span>
      </div>
    </div>
  );
}

export function LogisticsPanelV2() {
  const name = useCharacterStore((state) => state.name);
  const { currentLoad, maxLoad, isOverweight } = useCharacterStats();
  const inventory = useCharacterStore((state) => state.inventory);
  const toggleEquipItem = useCharacterStore((state) => state.toggleEquipItem);
  const moveInventoryItem = useCharacterStore(
    (state) => state.moveInventoryItem,
  );
  const deleteInventoryItem = useCharacterStore(
    (state) => state.deleteInventoryItem,
  );
  const sandboxMode = useCharacterStore((state) => state.sandboxMode);
  const updateInventoryItem = useCharacterStore(
    (state) => state.updateInventoryItem,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const itemModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBothLists, setShowBothLists] = useState(true);
  const [activeZone, setActiveZone] = useState<"carried" | "base">("carried");
  const [invSnapshot, setInvSnapshot] = useState<Item[]>([]);

  const [pendingEjection, setPendingEjection] = useState<{
    activeId: string;
    overId: string;
    targetDrawer: string | null;
  } | null>(null);

  const {
    sensors,
    collisionDetection,
    activeDragItem,
    handleDragStart,
    handleDragEnd,
  } = useInventoryDndV2({
    inventory,
    isEditMode,
    updateInventoryItem,
    moveInventoryItem,
    reorderInventoryItem: useCharacterStore.getState().reorderInventoryItem,
    onNestedEquipWarning: (activeId, overId, targetDrawer) =>
      setPendingEjection({ activeId, overId, targetDrawer }),
  });

  const rootItems = useMemo(
    () => inventory.filter((i) => i.parentId === null),
    [inventory],
  );
  const carriedItems = useMemo(
    () => rootItems.filter((i) => i.isCarried),
    [rootItems],
  );
  const baseItems = useMemo(
    () => rootItems.filter((i) => !i.isCarried),
    [rootItems],
  );

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) setShowBothLists(window.innerWidth >= 1430);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleEditMode = () => {
    if (isEditMode) {
      const stored = inventory.filter(
        (i) =>
          !i.isCarried &&
          invSnapshot.find((snap) => snap.id === i.id && snap.isCarried),
      );
      const taken = inventory.filter(
        (i) =>
          i.isCarried &&
          invSnapshot.find((snap) => snap.id === i.id && !snap.isCarried),
      );

      if (stored.length > 0 || taken.length > 0) {
        const embed: DiscordEmbed = {
          title: "[>] ATUALIZACAO LOGISTICA DE INVENTARIO",
          color: 10181046,
          description: `**UNIDADE OPERACIONAL:** ${name}`,
          fields: [],
          footer: { text: "SYS.MNLT // LOGISTIC_TRACKER" },
          timestamp: new Date().toISOString(),
        };

        if (stored.length > 0) {
          embed.fields!.push({
            name: "ITENS ARMAZENADOS NA BASE",
            value: stored
              .map(
                (i) =>
                  `\`[${i.slots * i.quantity} SLOTS]\` **${i.name}** (Qtd: ${i.quantity})`,
              )
              .join("\n"),
            inline: false,
          });
        }
        if (taken.length > 0) {
          embed.fields!.push({
            name: "ITENS RETIRADOS PARA OPERACAO",
            value: taken
              .map(
                (i) =>
                  `\`[${i.slots * i.quantity} SLOTS]\` **${i.name}** (Qtd: ${i.quantity})`,
              )
              .join("\n"),
            inline: false,
          });
        }
        dispatchDiscordLog("INVENTORY", name, "", [embed]);
      }
    } else {
      setInvSnapshot([...inventory]);
    }
    setIsEditMode(!isEditMode);
  };

  const executeEjection = () => {
    if (!pendingEjection) return;
    const children = inventory.filter(
      (i) => i.parentId === pendingEjection.activeId,
    );
    children.forEach((child) => moveInventoryItem(child.id, null));
    moveInventoryItem(
      pendingEjection.activeId,
      pendingEjection.overId,
      pendingEjection.targetDrawer,
    );

    const targetContainer = inventory.find(
      (i) => String(i.id) === pendingEjection.overId,
    );
    if (targetContainer) {
      updateInventoryItem(
        pendingEjection.activeId,
        "isCarried",
        targetContainer.isCarried,
      );
    }
    RetroToast.success("ESTRUTURA EJETADA. ITEM INSERIDO.");
    setPendingEjection(null);
  };

  const handleWebhookAll = () => {
    const cLoad = currentLoad ?? 0;
    const mLoad = maxLoad ?? 0;

    const embed: DiscordEmbed = {
      title: "[>] MANIFESTO DE CARGA GERAL",
      color: isOverweight ? 10038562 : 3447003,
      description: `**UNIDADE OPERACIONAL:** ${name}\n**CARGA:** ${cLoad} / ${mLoad} SLOTS ${isOverweight ? "⚠️ [SOBRECARREGADO]" : ""}`,
      fields: [],
      footer: { text: "SYS.MNLT // LOGISTIC_TRACKER" },
      timestamp: new Date().toISOString(),
    };

    const rootInventory = inventory.filter((i) => !i.parentId);

    if (rootInventory.length === 0) {
      embed.fields!.push({
        name: "STATUS",
        value: "INVENTÁRIO VAZIO",
        inline: false,
      });
    } else {
      rootInventory.forEach((item) => {
        let valueStr = `**TIPO:** ${item.type} | **PESO:** ${item.slots} SLOTS`;
        if (item.quantity > 1) valueStr += ` | **QTD:** ${item.quantity}`;
        if (item.isEquipped) valueStr += ` | 🛡️ **EQUIPADO**`;

        const children = inventory.filter((i) => i.parentId === item.id);
        if (children.length > 0) {
          valueStr += `\n**CONTEÚDO INTERNO:**\n`;
          children.forEach((child) => {
            valueStr += `> 🔸 ${child.name} [${child.slots} SLOTS]\n`;
          });
        }

        embed.fields!.push({
          name: `🔹 ${item.name}`,
          value: valueStr,
          inline: false,
        });
      });
    }

    dispatchDiscordLog("INVENTORY", name, "", [embed]);
    RetroToast.info("LOGÍSTICA TOTAL TRANSMITIDA.");
  };

  return (
    <div className="flex flex-col h-full bg-[var(--theme-background)] p-2 md:p-4 gap-4">
      <div className="flex flex-col md:flex-row gap-2 shrink-0 border-b border-[var(--theme-border)] pb-2">
        <Button
          className={`flex-1 transition-colors text-xs h-10 ${isEditMode ? "bg-[var(--theme-success)] border-[var(--theme-success)] text-black shadow-[0_0_15px_var(--theme-success)] hover:bg-[var(--theme-accent)] hover:border-[var(--theme-accent)]" : "border-dashed"}`}
          onClick={toggleEditMode}
        >
          {isEditMode
            ? "MODO DE EDIÇÃO - ON"
            : "MODO DE EDIÇÃO - OFF"}
        </Button>

        <AnimatePresence mode="popLayout">
          {!isEditMode && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
            >
              <Button
                className="h-10 text-[10px] md:text-xs px-4 w-full whitespace-nowrap bg-[var(--theme-accent)]/5 hover:bg-[var(--theme-accent)] hover:text-black transition-colors"
                onClick={handleWebhookAll}
                title="Transmitir Manifesto Geral"
              >
                SEND ALL &gt;&gt;
              </Button>
            </motion.div>
          )}

          {(sandboxMode || isDev) && isEditMode && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
            >
              <Button
                variant="success"
                className="h-10 text-xs px-4 w-full whitespace-nowrap"
                onClick={() => {
                  setSelectedItem(null);
                  itemModal.onOpen();
                }}
              >
                + SINTETIZAR MATÉRIA
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex-1 flex flex-row gap-2 md:gap-4 overflow-hidden h-full w-full"
          ref={containerRef}
        >
          <InventoryZoneV2
            zoneId="zone_carried"
            title="LEVANDO CONSIGO"
            items={carriedItems}
            allInventory={inventory}
            isEditMode={isEditMode}
            onToggleEquip={toggleEquipItem}
            activeDragItem={activeDragItem}
            isCollapsedZone={!showBothLists && activeZone !== "carried"}
            onExpandZone={() => setActiveZone("carried")}
            onEdit={(i) => {
              setSelectedItem(i);
              itemModal.onOpen();
            }}
            onDelete={(i) => {
              setSelectedItem(i);
              deleteModal.onOpen();
            }}
            headerExtra={
              <div
                className={`text-[9px] md:text-xs font-bold px-2 py-0.5 border ${isOverweight ? "border-[var(--theme-danger)] text-[var(--theme-danger)] bg-[var(--theme-danger)]/10 animate-pulse" : "border-[var(--theme-success)] text-[var(--theme-success)] bg-[var(--theme-success)]/10"}`}
              >
                {currentLoad} / {maxLoad} SLOTS
              </div>
            }
          />
          <InventoryZoneV2
            zoneId="zone_base"
            title="BASE / ARMAZÉM"
            items={baseItems}
            allInventory={inventory}
            isEditMode={isEditMode}
            onToggleEquip={toggleEquipItem}
            activeDragItem={activeDragItem}
            isCollapsedZone={!showBothLists && activeZone !== "base"}
            onExpandZone={() => setActiveZone("base")}
            onEdit={(i) => {
              setSelectedItem(i);
              itemModal.onOpen();
            }}
            onDelete={(i) => {
              setSelectedItem(i);
              deleteModal.onOpen();
            }}
            headerExtra={
              <span className="text-[9px] font-mono text-[var(--theme-text)]/50 bg-[var(--theme-background)]">
                ACESSO: {isEditMode ? "LIBERADO" : "BLOQUEADO"}
              </span>
            }
          />
        </div>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeDragItem ? (
            <MinimalistDragOverlay item={activeDragItem} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ItemModal
        isOpen={itemModal.isOpen}
        onClose={itemModal.onClose}
        itemToEdit={selectedItem}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        title="CONFIRMAR DESTRUIÇÃO"
        message={
          <div className="bg-[var(--theme-background)] p-3 border border-[var(--theme-danger)]/50 mt-2 text-left">
            <span className="font-bold text-[var(--theme-danger)] block mb-1">
              [{selectedItem?.name}]
            </span>
            <p className="text-[var(--theme-text)]/60 text-xs font-mono">
              O item será apagado permanentemente. Caso possua itens internos,
              eles retornarão à raiz.
            </p>
          </div>
        }
        onConfirm={() => {
          if (selectedItem) {
            const deleteEmbed: DiscordEmbed = {
              title: `[>>>] ITEM DELETADO [<<<]`,
              color: 10038562,
              description: `**NOME:** ${selectedItem.name}\n**QUANTIDADE:** ${selectedItem.quantity}\n**TYPE.:** ${selectedItem.type}\n**DESC:** ${selectedItem.description}`,
            };
            dispatchDiscordLog("PLAYER", name, "", [deleteEmbed]);
            deleteInventoryItem(selectedItem.id);
          }
          deleteModal.onClose();
        }}
        isDanger
      />

      <ConfirmModal
        isOpen={!!pendingEjection}
        onClose={() => setPendingEjection(null)}
        title="EJEÇÃO DE SEGURANÇA"
        isDanger
        message="A inserção de um contêiner com filiações dentro de outro exige a ejeção do conteúdo interno para a raiz. Prosseguir?"
        onConfirm={executeEjection}
      />
    </div>
  );
}
