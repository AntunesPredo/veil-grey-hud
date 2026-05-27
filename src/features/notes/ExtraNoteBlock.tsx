import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { CustomEffect, Note } from "../../shared/types/veil-grey";
import { Button, Input } from "../../shared/ui/Form";
import { Markdown } from "../../shared/ui/Markdown";
import { EffectsList } from "../../shared/ui/EffectsList";
import { GlitchImage } from "../../shared/ui/GlitchImage";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

const isDev =
  import.meta.env.VITE_IN_DEVELOPMENT === "true" || import.meta.env.DEV;

type ExtraNoteBlockProps = {
  note: Note;
  onDelete: () => void;
  onEditToggle: () => void;
  onUpdate: (field: "title" | "content" | "imageUrl", val: string) => void;
  onAddEffect: () => void;
  effects: CustomEffect[];
  onRemoveEffect: (id: number) => void;
  updateHeight: (id: string | "MAIN", height: number) => void;
  onSendNote: (note: Note) => void;
};

const crtVariants: Variants = {
  hidden: { opacity: 0, clipPath: "inset(50% 0 50% 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(0% 0 0% 0)",
    transition: { duration: 0.15, ease: [0.45, 0.05, 0.55, 0.95] },
  },
  exit: {
    opacity: 0,
    clipPath: "inset(50% 0 50% 0)",
    transition: { duration: 0.1 },
  },
};

export function ExtraNoteBlock({
  note,
  onDelete,
  onEditToggle,
  onUpdate,
  onAddEffect,
  effects,
  onRemoveEffect,
  updateHeight,
  onSendNote,
}: ExtraNoteBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: note.id,
    data: {
      type: "NOTE",
    },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `note_${note.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    updateHeight(note.id, e.currentTarget.offsetHeight);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`relative mt-2 transition-all ${
        isDragging ? "opacity-40 z-50" : "opacity-100"
      }`}
    >
      <div
        ref={setDropRef}
        className={`relative border-2 transition-colors ${
          isOver
            ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10"
            : "border-transparent"
        }`}
      >
        <motion.div
          layout={!isDragging}
          variants={crtVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)] flex flex-col"
        >
          <div className="flex justify-between items-center p-2 bg-[var(--theme-border)] border-b border-[var(--theme-border)]">
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              <div
                {...listeners}
                {...attributes}
                className="cursor-grab active:cursor-grabbing p-1 text-[var(--theme-text)]/40 hover:text-[var(--theme-accent)] touch-none shrink-0"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
              </div>

              {note.isEditing ? (
                <Input
                  value={note.title}
                  onChange={(e) => onUpdate("title", e.target.value)}
                  className="flex-1 font-bold text-[var(--theme-accent)] h-6 py-0 border-none bg-[var(--theme-background)] w-full"
                />
              ) : (
                <span className="font-bold text-[var(--theme-accent)] uppercase truncate">
                  {note.title}
                </span>
              )}
            </div>

            <div className="flex gap-1 shrink-0">
              <Button size="sm" onClick={onEditToggle}>
                {note.isEditing ? "[ SALVAR ]" : "[ EDITAR ]"}
              </Button>
              {note.isEditing && (
                <Button size="sm" variant="danger" onClick={onDelete}>
                  X
                </Button>
              )}
            </div>
          </div>

          <div className="p-2">
            <AnimatePresence mode="wait">
              {note.isEditing ? (
                <motion.div
                  key="edit-note"
                  variants={crtVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-2"
                >
                  <Input
                    placeholder="URL da Imagem..."
                    value={note.imageUrl || ""}
                    onChange={(e) => onUpdate("imageUrl", e.target.value)}
                    className="text-xs"
                  />
                  <textarea
                    value={note.content}
                    onChange={(e) => onUpdate("content", e.target.value)}
                    onMouseUp={handleMouseUp}
                    style={{ height: note.height || 80, minHeight: 60 }}
                    className="w-full bg-[var(--theme-background)]/80 border border-[var(--theme-accent)]/10 p-2 text-sm text-[var(--theme-accent)] font-mono outline-none resize-y custom-scrollbar"
                  />
                  {isDev && (
                    <div className="flex gap-1 mt-2 border-t border-[var(--theme-accent)]/20 pt-2">
                      <Button
                        size="sm"
                        variant="warning"
                        className="border-dashed"
                        onClick={() => onSendNote(note)}
                      >
                        [ TRANSMITIR NOTA ]
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="border-dashed"
                        onClick={onAddEffect}
                      >
                        + ATRELAR EFEITO
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="view-note"
                  variants={crtVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseUp={handleMouseUp}
                  style={{ height: note.height || 180, minHeight: 160 }}
                  className="w-full overflow-y-auto resize-y bg-transparent hover:bg-[var(--theme-accent)]/5 transition-colors p-2 custom-scrollbar"
                >
                  <div className="prose prose-invert prose-sm max-w-none text-[var(--theme-accent)] prose-p:my-1 prose-headings:my-2 [&_p]:leading-relaxed [&_p]:text-[12px] [&_img]:m-0">
                    {note.imageUrl && (
                      <div className="float-left mr-4 mb-2 w-[180px] max-w-[42%] border border-[var(--theme-border)] bg-black/40 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[var(--theme-accent)]/70 z-10" />
                        <div className="aspect-[4/3]">
                          <GlitchImage
                            src={note.imageUrl}
                            alt={note.title}
                            noLoad
                            canZoom
                            className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {note.content ? (
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--theme-accent)]/20" />
                        <div className="pl-3">
                          <Markdown content={note.content} />
                        </div>
                      </div>
                    ) : (
                      <em className="text-[var(--theme-accent)]/50">
                        Vazio...
                      </em>
                    )}

                    <div className="clear-both" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <EffectsList effects={effects} onRemove={onRemoveEffect} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
