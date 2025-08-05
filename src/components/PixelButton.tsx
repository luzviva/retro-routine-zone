import { ReactNode } from "react";

interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const PixelButton = ({ 
  children, 
  onClick, 
  className = "",
  'aria-label': ariaLabel 
}: PixelButtonProps) => {
  return (
    <button 
      className={`pixel-btn ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};