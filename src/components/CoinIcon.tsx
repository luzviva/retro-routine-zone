interface CoinIconProps {
  className?: string;
}

export const CoinIcon = ({ className = "w-5 h-5 md:w-6 md:h-6" }: CoinIconProps) => {
  return (
    <img 
      src="https://placehold.co/24x24/1a1a2e/eab308?text=%24" 
      alt="Ícone de Moeda"
      className={className}
    />
  );
};