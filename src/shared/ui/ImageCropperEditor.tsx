import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "./Form";

interface ImageCropperEditorProps {
  url: string;
  onCropComplete: (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  }) => void;
  onCancel: () => void;
}

export function ImageCropperEditor({
  url,
  onCropComplete,
  onCancel,
}: ImageCropperEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onCropCompleteInternal = useCallback(
    (_croppedArea: any) => {
      // react-easy-crop has two callbacks arguments:
      // 1. croppedArea (percentages)
      // 2. croppedAreaPixels (pixels)
      // We want to store percentages to recreate it anywhere via CSS easily.
      setCroppedAreaPercentages(_croppedArea);
    },
    []
  );

  const handleSave = () => {
    if (croppedAreaPercentages) {
      onCropComplete({
        ...croppedAreaPercentages,
        zoom,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border-2 border-[var(--theme-accent)] w-full max-w-3xl flex flex-col h-[80vh]">
        <div className="p-4 border-b border-[var(--theme-accent)]/30">
          <h3 className="text-[var(--theme-accent)] font-bold tracking-widest uppercase">
            Ajustar Imagem (4:3)
          </h3>
        </div>

        <div className="flex-1 relative bg-black">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 border-t border-[var(--theme-accent)]/30 flex justify-between items-center bg-slate-900">
          <div className="flex-1 flex gap-2 items-center mr-4">
            <span className="text-xs font-bold text-slate-400">ZOOM</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onCancel}>
              CANCELAR
            </Button>
            <Button variant="success" onClick={handleSave}>
              APLICAR CORTE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
