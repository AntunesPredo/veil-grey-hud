import { useRef, useState } from "react";
import { useCharacterStore } from "../character/store";
import { Modal, ConfirmModal } from "../../shared/ui/Overlays";
import { Button, Checkbox, Input } from "../../shared/ui/Form";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import { RetroToast } from "../../shared/ui/RetroToast";

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const settings = useCharacterStore((state) => state.settings);
  const sandboxMode = useCharacterStore((state) => state.sandboxMode);
  const name = useCharacterStore((state) => state.name);
  const updateProgression = useCharacterStore(
    (state) => state.updateProgression,
  );
  const resetCharacterData = useCharacterStore(
    (state) => state.resetCharacterData,
  );
  const importCharacterData = useCharacterStore(
    (state) => state.importCharacterData,
  );
  const addXp = useCharacterStore((state) => state.addXp);

  const [xpInput, setXpInput] = useState("");
  const wipeModal = useDisclosure();
  const errorModal = useDisclosure();
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDev = import.meta.env.DEV;

  const handleExportJSON = () => {
    const { resetCharacterData, importCharacterData, ...dataToSave } =
      useCharacterStore.getState();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const noSave = [resetCharacterData, importCharacterData];
    console.log({ noSave });
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dataToSave, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `VG_BACKUP_${name || "UNNAMED"}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        importCharacterData(jsonData);
        RetroToast.success("IMPORTADO COM SUCESSO.");
        onClose();
      } catch (error) {
        errorModal.onOpen();
        setConfirmModalMessage(
          `Erro durante o processamento do arquivo - ${(error as Error).message ?? "Desconhecido"}`,
        );
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddXp = () => {
    const val = parseInt(xpInput);
    if (!isNaN(val) && val > 0) {
      addXp(val);
      RetroToast.success(`+${val} XP.`);
      setXpInput("");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="CONFIGURAÇÕES">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-3 bg-[var(--theme-background)] group border-l-4 border-l-[var(--theme-accent)]">
            <svg
              className="w-12 h-12 fill-[var(--theme-accent)] opacity-30 group-hover:opacity-60 transition-opacity shrink-0"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 0C4.13401 0 1 3.13401 1 7V10L4 13L3 15V16H13V15L12 13L15 10V7C15 3.13401 11.866 0 8 0ZM6.5 7.5C6.5 8.32843 5.82843 9 5 9C4.17157 9 3.5 8.32843 3.5 7.5C3.5 6.67157 4.17157 6 5 6C5.82843 6 6.5 6.67157 6.5 7.5ZM11 9C11.8284 9 12.5 8.32843 12.5 7.5C12.5 6.67157 11.8284 6 11 6C10.1716 6 9.5 6.67157 9.5 7.5C9.5 8.32843 10.1716 9 11 9Z"
              />
            </svg>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-[9px] font-bold text-[var(--theme-text)]/50 tracking-widest uppercase">
                IDENTIFICADOR:
              </span>
              <Input
                value={name}
                onChange={(e) => updateProgression({ name: e.target.value })}
                className="w-full text-sm font-bold text-[var(--theme-accent)] bg-[var(--theme-background)]/50"
                placeholder="Identificador de Unidade"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3 bg-[var(--theme-background)] border-l-4 border-l-[var(--theme-accent)]">
            <div className="flex flex-col gap-2">
              <Checkbox
                label="DETALHAR LOG DE ROLAGENS"
                checked={settings.showRollDetails}
                onChange={() =>
                  updateProgression({
                    settings: {
                      ...settings,
                      showRollDetails: !settings.showRollDetails,
                    },
                  })
                }
              />
              {sandboxMode && (
                <Checkbox
                  label="FORÇAR TRAVAMENTO DE PONTOS"
                  checked={settings.lockPoints}
                  onChange={() =>
                    updateProgression({
                      settings: {
                        ...settings,
                        lockPoints: !settings.lockPoints,
                      },
                    })
                  }
                />
              )}
            </div>
          </div>

          {(sandboxMode || isDev) && (
            <div className="flex flex-col gap-2 p-2 bg-[var(--theme-warning)]/10 border-l-4 border-l-[var(--theme-warning)]">
              <span className="text-[10px] font-bold text-[var(--theme-warning)] tracking-widest">
                ADICIONAR XP
              </span>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quantidade XP..."
                  value={xpInput}
                  onChange={(e) => setXpInput(e.target.value)}
                  className="flex-1 font-mono border-[var(--theme-warning)]/50 text-[var(--theme-warning)] focus:bg-[var(--theme-warning)]/20"
                />
                <Button
                  size="sm"
                  variant="warning"
                  onClick={handleAddXp}
                  className="px-4"
                >
                  ADICIONAR
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 p-3 bg-[var(--theme-danger)]/10 border-l-4 border-l-[var(--theme-danger)]">
            <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest">
              AREA DE RISCO
            </span>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={handleExportJSON}
                className="border-dashed text-[var(--theme-accent)]"
              >
                EXPORTAR (.JSON)
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-dashed text-[var(--theme-accent)]"
              >
                IMPORTAR (.JSON)
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImportJSON}
              />
            </div>

            <Button
              size="sm"
              variant="danger"
              className="flex justify-center gap-2"
              onClick={wipeModal.onOpen}
            >
              WIPE - DELETAR INFORMAÇÕES
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={wipeModal.isOpen}
        onClose={wipeModal.onClose}
        title="WIPE"
        message="Atenção: Esta ação apagará permanentemente todos os dados da unidade atual da memória local. Deseja prosseguir?"
        isDanger
        onConfirm={() => {
          resetCharacterData();
          onClose();
        }}
      />

      <ConfirmModal
        isOpen={errorModal.isOpen}
        onClose={errorModal.onClose}
        title="XP ERROR"
        message={confirmModalMessage}
        isDanger
        onConfirm={() => {
          setConfirmModalMessage("");
          errorModal.onClose();
        }}
      />
    </>
  );
}
