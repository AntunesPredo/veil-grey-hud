import type { CroppedImage } from "../types/veil-grey";

interface SmartImageProps {
  image?: CroppedImage;
  className?: string;
}

export function SmartImage({ image, className = "" }: SmartImageProps) {
  if (!image || !image.url) return null;

  const { cropData } = image;

  if (!cropData) {
    return (
      <div
        className={`bg-cover bg-center aspect-[4/3] w-full ${className}`}
        style={{ backgroundImage: `url(${image.url})` }}
      />
    );
  }

  // Utilizando porcentagens do crop para recriar o frame exato via position absolute e overflow hidden
  return (
    <div className={`relative overflow-hidden aspect-[4/3] w-full ${className}`}>
      <img
        src={image.url}
        className="absolute max-w-none"
        style={{
          width: `${10000 / cropData.width}%`,
          height: `${10000 / cropData.height}%`,
          left: `-${(cropData.x / cropData.width) * 100}%`,
          top: `-${(cropData.y / cropData.height) * 100}%`,
        }}
        alt="Cover"
      />
    </div>
  );
}
