interface PixelAvatarProps {
  className?: string;
  alt?: string;
}

export const PixelAvatar = ({ className = "w-12 h-12 md:w-16 md:h-16", alt = "Avatar da Criança" }: PixelAvatarProps) => {
  return (
    <img 
      src="https://placehold.co/48x48/16213E/E94560?text=AV" 
      alt={alt}
      className={`pixel-border flex-shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};