import { useState, useEffect } from "react";

interface WeekViewProps {
  onDateSelect: (date: Date, isToday: boolean) => void;
}

export const WeekView = ({ onDateSelect }: WeekViewProps) => {
  const [selectedIndex, setSelectedIndex] = useState(3); // Meio da semana é hoje

  const dayTitleNames = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
  
  // Simula a data de hoje como Terça, 5 de Agosto de 2025
  const today = new Date(2025, 7, 5);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const dayOffset = i - 3; // O botão do meio está em i=3
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    return currentDate;
  });

  useEffect(() => {
    // Inicializa com hoje selecionado
    onDateSelect(weekDates[3], true);
  }, []);

  const handleDayClick = (index: number) => {
    setSelectedIndex(index);
    const selectedDate = weekDates[index];
    const isToday = index === 3;
    onDateSelect(selectedDate, isToday);
  };

  return (
    <div className="grid grid-cols-7 gap-1 mb-6 text-xs sm:text-sm md:text-base">
      {weekDates.map((date, index) => {
        const dayIndex = date.getDay();
        const isToday = index === 3;
        const isSelected = index === selectedIndex;
        
        return (
          <div 
            key={index}
            className={`day-btn ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => handleDayClick(index)}
          >
            <span className="day-name">{dayTitleNames[dayIndex]}</span>
          </div>
        );
      })}
    </div>
  );
};