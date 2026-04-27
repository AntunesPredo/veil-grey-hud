import { useCharacterStore } from "../../features/character/store";
import { RetroToast } from "../ui/RetroToast";

export const useImportData = ({
  onError,
  onClose,
  fileInputRef,
}: {
  onError: (error: Error) => void;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement> | null;
}) => {
  const importCharacterData = useCharacterStore(
    (state) => state.importCharacterData,
  );
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
        onError(error as Error);
        // errorModal.onOpen();
        // setConfirmModalMessage(
        //   `Erro durante o processamento do arquivo - ${(error as Error).message ?? "Desconhecido"}`,
        // );
      }
    };
    reader.readAsText(file);
    if (fileInputRef?.current) fileInputRef.current.value = "";
  };

  return { handleImportJSON };
};
