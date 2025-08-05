import { TaskCheckbox } from "./TaskCheckbox";
import { CoinIcon } from "./CoinIcon";

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  onToggle: (completed: boolean) => void;
}

export const QuestCard = ({ 
  id, 
  title, 
  description, 
  reward, 
  completed, 
  onToggle 
}: QuestCardProps) => {
  return (
    <div 
      id={`quest-card-${id}`} 
      className={`quest-card ${completed ? 'completed' : ''}`}
    >
      <TaskCheckbox 
        id={`task${id}`}
        checked={completed}
        onChange={onToggle}
      />
      <div className="flex-grow">
        <label htmlFor={`task${id}`} className="text-2xl cursor-pointer">
          {title}
        </label>
        <p className="text-base text-cyan-300">
          {description}
        </p>
      </div>
      <div className="text-2xl text-yellow-400 flex items-center gap-2">
        +{reward}
        <CoinIcon className="w-6 h-6" />
      </div>
    </div>
  );
};