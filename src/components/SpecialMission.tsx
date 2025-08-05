import { useState } from "react";
import { PixelButton } from "./PixelButton";
import { ProgressBar } from "./ProgressBar";

interface SpecialMissionProps {
  onComplete: (prizeAmount: number) => void;
  onProgress: (message: string) => void;
}

export const SpecialMission = ({ onComplete, onProgress }: SpecialMissionProps) => {
  const [progress, setProgress] = useState(2);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prizeClaimed, setPrizeClaimed] = useState(false);
  
  const total = 5;
  const prizeAmount = 25;

  const handleProgressClick = () => {
    if (progress < total && !isCompleted) {
      const newProgress = progress + 1;
      setProgress(newProgress);
      onProgress('+1 Progresso!');
      
      if (newProgress >= total) {
        setIsCompleted(true);
        if (!prizeClaimed) {
          setPrizeClaimed(true);
          onComplete(prizeAmount);
        }
      }
    }
  };

  return (
    <div className="pixel-border p-4 mb-6 text-center">
      <h3 className="text-2xl text-purple-400">✨ MISSÃO ESPECIAL ✨</h3>
      <p className="text-xl mt-2">Beba 5 copos de água hoje!</p>
      
      <div className="my-4 max-w-md mx-auto flex items-center gap-4">
        {!isCompleted && (
          <PixelButton 
            onClick={handleProgressClick}
            className="text-xl p-2 h-12 w-24"
          >
            +1 Copo
          </PixelButton>
        )}
        
        <div className="flex-grow">
          <ProgressBar 
            current={progress}
            total={total}
            bgColor="bg-blue-500"
          />
        </div>
      </div>

      {/* Prêmio */}
      <div className="mt-2">
        <p className="text-lg">Prêmio por completar:</p>
        {!isCompleted ? (
          <div className="text-gray-500 inline-block">
            <svg 
              className="w-12 h-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z"/>
            </svg>
            <p className="text-sm">Trancado</p>
          </div>
        ) : (
          <div className="text-yellow-400 inline-block animate-pop">
            <svg 
              className="w-12 h-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v1H9V7c0-1.654 1.346-3 3-3z"/>
            </svg>
            <p className="text-sm">+{prizeAmount} Moedas!</p>
          </div>
        )}
      </div>
    </div>
  );
};