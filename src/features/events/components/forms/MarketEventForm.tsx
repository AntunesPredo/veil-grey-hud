import { Input, Button } from "../../../../shared/ui/Form";
import type { MarketEvent, MarketItem } from "../../../../shared/types/events";

interface MarketEventFormProps {
  payload: Partial<MarketEvent["payload"]>;
  onChange: (payload: Partial<MarketEvent["payload"]>) => void;
}

export function MarketEventForm({ payload, onChange }: MarketEventFormProps) {
  const items = payload.items || [];

  const handleAddItem = () => {
    const newItem: MarketItem = {
      itemId: "",
      basePrice: 0,
      finalPrice: 0,
      stockLimit: null,
      playerLimit: null,
    };
    onChange({ ...payload, items: [...items, newItem] });
  };

  const handleUpdateItem = (index: number, field: keyof MarketItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...payload, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...payload, items: newItems });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Moeda PadrÃ£o</label>
        <div className="grid grid-cols-2 gap-2">
          {["CC", "FCC"].map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => onChange({ ...payload, currency: curr as any })}
              className={`p-2 border-2 text-xs font-bold font-mono transition-colors rounded-none ${
                (payload.currency || "CC") === curr 
                  ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]" 
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {curr === "CC" ? "Credit Chips (CC)" : "Fed Credit Chips (FCC)"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400">Itens Ã  Venda</label>
          <Button type="button" variant="success" size="sm" onClick={handleAddItem}>
            + ADICIONAR ITEM
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono p-4 border border-dashed border-slate-700 bg-slate-900/50 text-center">
            Nenhum item adicionado ao mercado.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex flex-col gap-2 p-3 bg-slate-900 border border-slate-700 rounded-none mb-2 relative">
              <button 
                className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                onClick={() => handleRemoveItem(index)}
                type="button"
              >
                X
              </button>
              
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-[10px] text-slate-400 font-bold">ID do Item (Database)</label>
                <Input 
                  value={item.itemId} 
                  onChange={(e) => handleUpdateItem(index, "itemId", e.target.value)} 
                  placeholder="Ex: item_pistola_9mm" 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold">PreÃ§o Base</label>
                  <Input 
                    type="number"
                    value={item.basePrice} 
                    onChange={(e) => handleUpdateItem(index, "basePrice", parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold">PreÃ§o Final (Venda)</label>
                  <Input 
                    type="number"
                    value={item.finalPrice} 
                    onChange={(e) => handleUpdateItem(index, "finalPrice", parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold">Estoque Max (Geral)</label>
                  <Input 
                    type="number"
                    value={item.stockLimit === null ? "" : item.stockLimit} 
                    onChange={(e) => handleUpdateItem(index, "stockLimit", e.target.value ? parseInt(e.target.value) : null)} 
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold">Limite por Jogador</label>
                  <Input 
                    type="number"
                    value={item.playerLimit === null ? "" : item.playerLimit} 
                    onChange={(e) => handleUpdateItem(index, "playerLimit", e.target.value ? parseInt(e.target.value) : null)} 
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



