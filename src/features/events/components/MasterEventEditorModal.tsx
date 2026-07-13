import { useState, useEffect } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import type { GameEvent, EventType, EventStatus } from "../../../shared/types/events";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { useMasterEventsStore } from "../store/useMasterEventsStore";
import type { CroppedImage } from "../../../shared/types/veil-grey";
import { ImageCropperEditor } from "../../../shared/ui/ImageCropperEditor";

import { TestEventForm } from "./forms/TestEventForm";
import { MarketEventForm } from "./forms/MarketEventForm";
import { MerchantEventForm } from "./forms/MerchantEventForm";
import { JobEventForm } from "./forms/JobEventForm";
import { DebtEventForm } from "./forms/DebtEventForm";
import { P2PTransferForm } from "./forms/P2PTransferForm";

interface MasterEventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: GameEvent;
}

export function MasterEventEditorModal({
  isOpen,
  onClose,
  eventToEdit,
}: MasterEventEditorModalProps) {
  const telemetryData = useNetworkStore((state) => state.telemetryData);
  const availablePlayers = Object.keys(telemetryData);

  const addEvent = useMasterEventsStore((state) => state.addEvent);
  const updateEvent = useMasterEventsStore((state) => state.updateEvent);

  const [step, setStep] = useState(1);

  // Base State
  const [type, setType] = useState<EventType>(eventToEdit?.type || "TEST");
  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [coverImage, setCoverImage] = useState<CroppedImage | undefined>(eventToEdit?.coverImage);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(eventToEdit?.coverImage?.url || "");
  const [targets, setTargets] = useState<string[]>(eventToEdit?.targets || []);
  const [status, setStatus] = useState<EventStatus>(eventToEdit?.status || "PENDING"); // Defaults to PENDING now

  // Specific Payload State
  const [payload, setPayload] = useState<any>(eventToEdit?.payload || {});

  // Reset state when opening/closing or changing event
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setType(eventToEdit?.type || "TEST");
      setTitle(eventToEdit?.title || "");
      setDescription(eventToEdit?.description || "");
      setCoverImage(eventToEdit?.coverImage);
      setTempImageUrl(eventToEdit?.coverImage?.url || "");
      setTargets(eventToEdit?.targets || []);
      setStatus(eventToEdit?.status || "PENDING");
      setPayload(eventToEdit?.payload || (eventToEdit?.type === "P2P_TRANSFER" ? { currency: "CC", participants: {}, pool: 0, initialPool: 0, hostIsPresent: false, transactions: [] } : {}));
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleCropComplete = (cropData: any) => {
    setCoverImage({ url: tempImageUrl, cropData });
    setIsCropping(false);
  };

  const handleNext = () => {
    if (!title.trim()) return alert("Título é obrigatório!");
    setStep(2);
  };

  const handleSave = () => {
    let finalPayload = { ...payload };
    if (type === "P2P_TRANSFER" && status === "ACTIVE" && (!eventToEdit || eventToEdit.status !== "ACTIVE")) {
       finalPayload = {
         ...finalPayload,
         participants: {},
         hostIsPresent: false,
         hostConfirmed: false,
         isAllConfirmed: false,
         transactions: []
       };
    }

    const newEvent: GameEvent = {
      id: eventToEdit?.id || crypto.randomUUID(),
      roomId: "session",
      type,
      title,
      description,
      coverImage,
      status,
      createdAt: eventToEdit?.createdAt || Date.now(),
      targets,
      payload: finalPayload
    } as GameEvent;

    if (eventToEdit) {
      updateEvent(newEvent.id, newEvent);
    } else {
      addEvent(newEvent);
    }

    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
    onClose();
  };

  const toggleTarget = (player: string) => {
    if (targets.includes(player)) {
      setTargets(targets.filter(t => t !== player));
    } else {
      setTargets([...targets, player]);
    }
  };

  const toggleAllTargets = () => {
    if (targets.length === availablePlayers.length) {
      setTargets([]);
    } else {
      setTargets([...availablePlayers]);
    }
  };

  return (
    <Modal title={eventToEdit ? "EDITAR EVENTO" : "NOVO EVENTO"} onClose={onClose} isOpen={isOpen}>
      <div className="p-4 text-slate-300 w-full min-w-[400px]">

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h3 className="text-[var(--theme-accent)] border-b border-[var(--theme-accent)]/30 pb-1 mb-2 font-bold tracking-widest text-xs uppercase">
              1. INFORMAÇÕES BASE
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400">Tipo de Evento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "MARKET", label: "COMPRA" },
                  { id: "MERCHANT", label: "VENDA" },
                  { id: "JOB", label: "TRABALHO" },
                  { id: "DEBT", label: "DÍVIDA" },
                  { id: "TEST", label: "TESTE" },
                  { id: "P2P_TRANSFER", label: "TRANFERÊNCIA" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!!eventToEdit}
                    onClick={() => {
                      setType(opt.id as EventType);
                      if (opt.id === "P2P_TRANSFER") {
                         setPayload({ currency: "CC", participants: {}, pool: 0, initialPool: 0, hostIsPresent: false, transactions: [] });
                      } else {
                         setPayload({});
                      }
                    }}
                    className={`p-2 border-2 text-xs font-bold font-mono transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${type === opt.id
                      ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400">Título do Evento</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Imposto Colonial"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400">Descrição</label>
              <textarea
                className="bg-[var(--theme-background)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none focus:border-[var(--theme-accent)] focus:bg-[var(--theme-accent)]/10 transition-colors font-mono tracking-wider resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: A federação exige sua taxa mensal..."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400">URL da Imagem de Capa (Opcional)</label>
              <div className="flex gap-2">
                <Input
                  value={tempImageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempImageUrl(val);
                    if (!val) setCoverImage(undefined);
                  }}
                  placeholder="https://..."
                />
                <Button 
                  type="button" 
                  variant="primary" 
                  disabled={!tempImageUrl}
                  onClick={() => setIsCropping(true)}
                >
                  CORTAR
                </Button>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Insira um link e clique em Cortar para enquadrar.</span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-slate-400">ALVOS DO EVENTO</label>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="warning" onClick={toggleAllTargets} className="text-[10px] py-1">
                  SELECIONAR TODOS
                </Button>
                <span className="text-xs text-slate-500">
                  {targets.length} selecionados
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-900 border border-slate-800 rounded-none">
                {availablePlayers.length === 0 ? (
                  <span className="text-xs text-slate-600 font-mono italic">Nenhum jogador na rede.</span>
                ) : (
                  availablePlayers.map(player => (
                    <div
                      key={player}
                      onClick={() => toggleTarget(player)}
                      className={`px-3 py-1 text-xs font-mono rounded-none cursor-pointer border transition-colors
                        ${targets.includes(player)
                          ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)]"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}
                      `}
                    >
                      {player}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="danger" onClick={onClose}>CANCELAR</Button>
              <Button variant="primary" onClick={handleNext}>PRÓXIMO PASSO</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in min-h-[300px]">
            <h3 className="text-[var(--theme-accent)] border-b border-[var(--theme-accent)]/30 pb-1 mb-2 font-bold tracking-widest text-xs uppercase">
              2. CONFIGURAR DADOS: {type}
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 max-h-[50vh]">
              {type === "TEST" && <TestEventForm payload={payload} onChange={setPayload} />}
              {type === "MARKET" && <MarketEventForm payload={payload} onChange={setPayload} />}
              {type === "MERCHANT" && <MerchantEventForm payload={payload} onChange={setPayload} />}
              {type === "JOB" && <JobEventForm payload={payload} onChange={setPayload} />}
              {type === "DEBT" && <DebtEventForm payload={payload} onChange={setPayload} />}
              {type === "P2P_TRANSFER" && <P2PTransferForm payload={payload} onChange={setPayload} />}
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant="warning" onClick={() => setStep(1)}>VOLTAR</Button>
              <Button variant="primary" onClick={handleSave}>SALVAR EVENTO</Button>
            </div>
          </div>
        )}

      </div>

      {isCropping && (
        <ImageCropperEditor
          url={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropping(false);
            if (!coverImage) setTempImageUrl("");
            else setTempImageUrl(coverImage.url);
          }}
        />
      )}
    </Modal>
  );
}

