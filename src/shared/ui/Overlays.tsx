import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Form";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  isDanger = false,
  maxWidth = "max-w-2xl",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  isDanger?: boolean;
  maxWidth?: string;
}) {
  if (!isOpen) return null;
  const borderClass = isDanger
    ? "border-[var(--theme-danger)] shadow-[0_0_15px_var(--theme-danger)]"
    : "border-[var(--theme-accent)] shadow-[0_0_15px_var(--theme-accent)]";
  const headerClass = isDanger
    ? "bg-[var(--theme-danger)]/10 border-[var(--theme-danger)]/50"
    : "bg-[var(--theme-accent)]/10 border-[var(--theme-accent)]/50";

  return createPortal(
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-[var(--theme-background)]/90 backdrop-blur-sm p-4">
      <div
        className={`bg-[var(--theme-background)] border-2 ${borderClass} ${maxWidth} w-full flex flex-col max-h-[90vh]`}
      >
        <div
          className={`flex justify-between items-center border-b p-2 text-[var(--theme-accent)] ${headerClass}`}
        >
          <h2 className="font-bold tracking-widest uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="hover:text-[var(--theme-background)] hover:bg-[var(--theme-accent)] font-bold px-2 transition-colors"
          >
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 text-[var(--theme-accent)] font-mono text-sm overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("app-root") || document.body,
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "CONFIRMAR",
  cancelText = "CANCELAR",
  isDanger = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} isDanger={isDanger}>
      <div className="flex flex-col gap-4 text-center">
        <div className="text-[var(--theme-accent)] text-sm">{message}</div>
        <div className="flex justify-center gap-2 mt-2">
          <Button variant="primary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function FocusOverlay({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-40 bg-[var(--theme-background)]/60 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
