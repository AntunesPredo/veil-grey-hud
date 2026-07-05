import { Input } from "../../../../shared/ui/Form";
import type { TestEvent } from "../../../../shared/types/events";
import { VG_CONFIG } from "../../../../shared/config/system.config";

interface TestEventFormProps {
  payload: Partial<TestEvent["payload"]>;
  onChange: (payload: Partial<TestEvent["payload"]>) => void;
}

export function TestEventForm({ payload, onChange }: TestEventFormProps) {
  const allAttributes = [
    ...Object.keys(VG_CONFIG.att_groups.physical.atributes),
    ...Object.keys(VG_CONFIG.att_groups.mental.atributes),
    ...Object.keys(VG_CONFIG.att_groups.social.atributes),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Atributo Alvo (Opcional)</label>
        <select
          className="bg-[var(--theme-background)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors font-mono tracking-wider"
          value={payload.targetAttribute || ""}
          onChange={(e) => onChange({ ...payload, targetAttribute: e.target.value as any, targetSkill: undefined })}
        >
          <option value="">Livre (Qualquer teste)</option>
          {allAttributes.map((att) => (
            <option key={att} value={att}>{att}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Dificuldade (Opcional)</label>
        <Input
          type="number"
          value={payload.difficulty || ""}
          onChange={(e) => onChange({ ...payload, difficulty: e.target.value ? parseInt(e.target.value) : null })}
          placeholder="Ex: 12"
        />
      </div>
    </div>
  );
}

