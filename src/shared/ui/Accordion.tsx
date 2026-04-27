import { motion, AnimatePresence } from "framer-motion";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function Accordion({
  title,
  children,
  isOpen,
  onToggle,
}: AccordionProps) {
  return (
    <div className="flex flex-col bg-[var(--theme-background)] border border-[var(--theme-border)]">
      <button
        onClick={() => onToggle()}
        className={`flex justify-between items-center p-2 font-bold tracking-widest text-[12px] uppercase transition-colors hover:bg-[var(--theme-accent)]/40 hover:text-[var(--theme-accent)] ${isOpen ? "bg-[var(--theme-accent)] text-[var(--theme-background)]" : "bg-[var(--theme-background)] text-[var(--theme-accent)]"}`}
      >
        {title}
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }}>▶</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 flex flex-col gap-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
