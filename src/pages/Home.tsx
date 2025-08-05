import { useState, useEffect } from "react";
import { PixelAvatar } from "../components/PixelAvatar";
import { CoinIcon } from "../components/CoinIcon";
import { ProgressBar } from "../components/ProgressBar";
import { PixelButton } from "../components/PixelButton";
import { QuestCard } from "../components/QuestCard";
import { WeekView } from "../components/WeekView";
import { FeedbackModal } from "../components/FeedbackModal";
import { SpecialMission } from "../components/SpecialMission";
import { Settings, ShoppingCart } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
}

const Home = () => {
  const [coinBalance, setCoinBalance] = useState(125);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Arrumar a cama",
      description: "Deixar o quarto pronto para a aventura do dia!",
      reward: 5,
      completed: true
    },
    {
      id: "2", 
      title: "Ler por 15 minutos",
      description: "Explorar um novo mundo nos livros.",
      reward: 10,
      completed: false
    }
  ]);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 7, 5));
  const [isToday, setIsToday] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const dayTitleNames = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          if (completed) {
            // Marca como completa e adiciona moedas
            setCoinBalance(prev => prev + task.reward);
            showFeedbackMessage(`+${task.reward} Moedas!`);
            return { ...task, completed: true };
          } else {
            // Verifica se pode desmarcar
            if (coinBalance >= task.reward) {
              setCoinBalance(prev => prev - task.reward);
              return { ...task, completed: false };
            } else {
              showFeedbackMessage('Moedas já gastas!');
              return task; // Não altera o estado
            }
          }
        }
        return task;
      });
    });
  };

  const handleDateSelect = (date: Date, todaySelected: boolean) => {
    setSelectedDate(date);
    setIsToday(todaySelected);
  };

  const handleSpecialMissionComplete = (prizeAmount: number) => {
    setCoinBalance(prev => prev + prizeAmount);
    showFeedbackMessage(`PRÊMIO! +${prizeAmount} Moedas!`);
  };

  const formatDate = () => {
    const dayIndex = selectedDate.getDay();
    return `${dayNames[dayIndex]}, ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`;
  };

  const getMissionTitle = () => {
    if (isToday) {
      return "MISSÕES DE HOJE";
    } else {
      const dayIndex = selectedDate.getDay();
      return `MISSÕES DE ${dayTitleNames[dayIndex]}`;
    }
  };

  return (
    <div className={`p-4 md:p-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="max-w-4xl mx-auto">
        {/* CABEÇALHO DO AVENTUREIRO */}
        <header className="pixel-border p-2 md:p-3 mb-8 flex items-center gap-2 md:gap-4">
          <PixelAvatar />
          
          {/* Informações Centrais */}
          <div className="flex-grow">
            <div className="flex justify-between items-baseline mb-1">
              <h1 className="text-xl md:text-2xl text-cyan-400">Aventureiro</h1>
              <div className="flex items-center gap-1 text-xl md:text-2xl text-yellow-400">
                <CoinIcon />
                <span>{coinBalance}</span>
              </div>
            </div>
            <ProgressBar 
              current={completedTasks}
              total={totalTasks}
              className="h-3 md:h-4"
            />
          </div>
        
          {/* Botões Direita */}
          <div className="flex items-center gap-2">
            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Loja"
            >
              <ShoppingCart className="w-6 h-6" />
            </PixelButton>
            
            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Configurações"
            >
              <Settings className="w-6 h-6" />
            </PixelButton>
          </div>
        </header>

        {/* PAINEL DE MISSÕES */}
        <main>
          {/* MISSÃO ESPECIAL DO DIA */}
          <SpecialMission 
            onComplete={handleSpecialMissionComplete}
            onProgress={showFeedbackMessage}
          />

          {/* Seletor de Dias da Semana */}
          <WeekView onDateSelect={handleDateSelect} />

          <div className="text-center mb-6">
            <h2 className="text-4xl text-yellow-400">{getMissionTitle()}</h2>
            <p className="text-xl text-cyan-400">{formatDate()}</p>
          </div>

          <div className="space-y-6">
            {tasks.map(task => (
              <QuestCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                reward={task.reward}
                completed={task.completed}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal 
        message={feedbackMessage}
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
};

export default Home;