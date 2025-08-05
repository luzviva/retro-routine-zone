import { useEffect, useRef } from "react";

interface TaskCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const TaskCheckbox = ({ id, checked, onChange }: TaskCheckboxProps) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const createSparkles = (element: HTMLElement) => {
    const container = document.createElement('div');
    container.className = 'sparkle-container';
    element.appendChild(container);

    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      const angle = Math.random() * 360;
      const distance = Math.random() * 40 + 20;
      sparkle.style.setProperty('--x', `${Math.cos(angle * Math.PI / 180) * distance}px`);
      sparkle.style.setProperty('--y', `${Math.sin(angle * Math.PI / 180) * distance}px`);
      container.appendChild(sparkle);
    }

    setTimeout(() => {
      if (element.contains(container)) {
        element.removeChild(container);
      }
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onChange(isChecked);
    
    if (isChecked && checkboxRef.current) {
      createSparkles(checkboxRef.current);
    }
  };

  return (
    <input 
      ref={checkboxRef}
      type="checkbox" 
      className="task-checkbox" 
      id={id}
      checked={checked}
      onChange={handleChange}
    />
  );
};