import { useState } from "react";
import { useCharacterStore } from "../character/store";
import { RetroToast } from "../../shared/ui/RetroToast";
import { ConfirmModal, Modal } from "../../shared/ui/Overlays";
import { Button, Input } from "../../shared/ui/Form";
import CryptoJS from "crypto-js";
import { useDisclosure } from "../../shared/hooks/useDisclosure";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const isDev = import.meta.env.VITE_IN_DEVELOPMENT;

export function XpInjectionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addXp } = useCharacterStore();
  const { xp } = useCharacterStore();
  const confirmModal = useDisclosure();
  const usedXpLogs = xp.usedXpLogs || [];

  const [hashInput, setHashInput] = useState("");
  const [devXpAmount, setDevXpAmount] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");

  const handleClose = () => {
    setHashInput("");
    setDevXpAmount("");
    setGeneratedHash("");
    setConfirmModalMessage("");
    onClose();
  };

  const handleInjectHash = () => {
    if (!hashInput.trim()) return;

    try {
      const bytes = CryptoJS.AES.decrypt(hashInput.trim(), SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error("xp-code corrompido ou incorreto.");
      }

      const payload: {
        action: "add";
        logId: string;
        amount: number;
      } = JSON.parse(decryptedString);

      if (
        payload.action !== "add" ||
        typeof payload.amount !== "number" ||
        !payload.logId
      ) {
        throw new Error("formato de xp-code incompatível.");
      }

      if (usedXpLogs.includes(payload.logId)) {
        RetroToast.error("XP-CODE JÁ PROCESSADO ANTERIORMENTE.");
        return;
      }

      addXp(payload.amount, payload.logId);

      RetroToast.success(`XP-CODE: +${payload.amount} XP.`);
      setHashInput("");
      handleClose();
    } catch (error) {
      confirmModal.onOpen();
      setConfirmModalMessage(
        `Erro durante o processamento do xp-code - ${(error as Error).message ?? "Desconhecido"}`,
      );
    }
  };

  const handleGenerateHash = () => {
    const xp = parseInt(devXpAmount, 10);
    if (isNaN(xp) || xp <= 0) return;

    const payload = {
      action: "add",
      logId: crypto.randomUUID(),
      amount: xp,
    };

    const hash = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      SECRET_KEY,
    ).toString();

    setGeneratedHash(hash);
  };

  const copyToClipboard = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    RetroToast.info("XP-CODE ENVIADO PARA A ÁREA DE TRANSFERÊNCIA.");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="XP-CODE INJECTION">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 p-3 bg-[var(--theme-background)] border border-[var(--theme-border)] relative">
            <svg
              className="w-10 h-10 fill-[var(--theme-accent)] shrink-0"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4.70711 12.7071L8 16L11.2929 12.7071L8 9.41421L4.70711 12.7071Z"
                fill="currentColor"
              />
              <path
                d="M3.29289 11.2929L6.58579 8L3.29289 4.70711L0 8L3.29289 11.2929Z"
                fill="currentColor"
              />
              <path
                d="M4.70711 3.29289L8 0L11.2929 3.29289L8 6.58579L4.70711 3.29289Z"
                fill="currentColot"
              />
              <path
                d="M12.7071 4.70711L9.41421 8L12.7071 11.2929L16 8L12.7071 4.70711Z"
                fill="currentColor"
              />
            </svg>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-[12px] font-bold text-[var(--theme-text)] tracking-widest uppercase">
                INSERIR XP-CODE
              </span>
              <div className="flex flex-row gap-4">
                <Input
                  type="text"
                  placeholder="..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="w-full font-mono text-xs p-2 tracking-wider"
                />
                <Button variant="primary" onClick={handleInjectHash}>
                  INJETAR
                </Button>
              </div>
            </div>
          </div>

          {isDev && (
            <div className="flex flex-col gap-3 p-3 bg-yellow-900/10 border border-yellow-700/30">
              <div className="flex items-center gap-2 border-b border-yellow-700/30 pb-2">
                <svg
                  className="w-4 h-4 text-[var(--theme-warning)]"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 5.5C16 8.53757 13.5376 11 10.5 11H7V13H5V15L4 16H0V12L5.16351 6.83649C5.0567 6.40863 5 5.96094 5 5.5C5 2.46243 7.46243 0 10.5 0C13.5376 0 16 2.46243 16 5.5ZM13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-[12px] font-bold text-[var(--theme-warning)] tracking-widest uppercase">
                  [DEV] XP-CODE GENERATOR
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="..."
                  value={devXpAmount}
                  onChange={(e) => setDevXpAmount(e.target.value)}
                  className="flex-1 font-mono border-[var(--theme-warning)]/50 text-[var(--theme-warning)] focus:bg-[var(--theme-warning)]/20"
                />
                <Button
                  size="sm"
                  variant="warning"
                  onClick={handleGenerateHash}
                  className="px-4"
                >
                  GERAR
                </Button>
              </div>

              {generatedHash && (
                <div
                  className="mt-2 bg-[var(--theme-background)] border border-[var(--theme-warning)]/50 p-2 flex items-center justify-between cursor-pointer hover:bg-[var(--theme-warning)]/20 transition-colors"
                  onClick={copyToClipboard}
                >
                  <span className="text-[var(--theme-warning)] text-xs font-mono truncate max-w-[200px]">
                    {generatedHash}
                  </span>
                  <span className="text-[12px] font-bold text-[var(--theme-warning)] uppercase tracking-widest">
                    [COPIAR]
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.onClose}
          title="XP ERROR"
          message={confirmModalMessage}
          isDanger
          onConfirm={() => {
            setConfirmModalMessage("");
            confirmModal.onClose();
          }}
        />
      </Modal>
    </>
  );
}
