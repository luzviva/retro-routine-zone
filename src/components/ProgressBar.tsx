interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  bgColor?: string;
}

export const ProgressBar = ({ 
  current, 
  total, 
  className = "",
  bgColor = "bg-green-500" 
}: ProgressBarProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className={`progress-bar-container ${className}`}>
      <div 
        className={`progress-bar ${bgColor}`}
        style={{ width: `${percentage}%` }}
      >
        {current}/{total}
      </div>
    </div>
  );
};