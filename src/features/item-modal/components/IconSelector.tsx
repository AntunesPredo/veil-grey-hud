import type { ItemFormData } from "../ItemModal";

interface IconSelectorProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  icons: { id: string; svg: React.ReactNode }[];
}

export function IconSelector({
  formData,
  setFormData,
  icons,
}: IconSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
        REPRESENTAÇÃO VISUAL (SVG_ID)
      </span>
      <div className="flex gap-2 flex-wrap bg-[var(--theme-background)] p-2 border border-[var(--theme-border)]">
        {icons.map((icon) => (
          <button
            key={icon.id}
            onClick={() =>
              setFormData((prev: ItemFormData) => ({ ...prev, svgId: icon.id }))
            }
            className={`w-10 h-10 flex items-center justify-center border transition-colors ${formData.svgId === icon.id ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] shadow-[0_0_8px_var(--theme-accent)]" : "border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50"}`}
          >
            <svg
              className={`w-6 h-6 fill-current ${formData.svgId === icon.id ? "text-[var(--theme-accent)]" : "text-[var(--theme-text)]/50"}`}
              viewBox="0 0 24 24"
            >
              {icon.svg}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
