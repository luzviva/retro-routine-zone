import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [coinBalance, setCoinBalance] = useState(125);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  // Fetch tasks and coin balance when user changes or date changes
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch tasks for the selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          reward_coins,
          completed,
          task_date
        `)
        .eq('assigned_to', userId)
        .eq('task_date', dateStr)
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Erro ao buscar tarefas:', tasksError);
      } else {
        const formattedTasks = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: task.reward_coins,
          completed: task.completed
        }));
        setTasks(formattedTasks);
      }

      // Fetch user coin balance
      const { data: coinsData, error: coinsError } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (coinsError && coinsError.code !== 'PGRST116') {
        console.error('Erro ao buscar moedas:', coinsError);
      } else if (coinsData) {
        setCoinBalance(coinsData.balance);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If no user, redirect to auth
        if (!session?.user) {
          navigate('/auth');
        } else {
          // Fetch user data when authenticated
          fetchUserData(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If no user, redirect to auth
      if (!session?.user) {
        navigate('/auth');
      } else {
        // Fetch user data if already authenticated
        fetchUserData(session.user.id);
      }
    });

    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);

    return () => subscription.unsubscribe();
  }, [navigate, selectedDate]);

  // Refetch tasks when date changes
  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [selectedDate, user]);

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      if (completed) {
        // Update task completion in database
        const { error: taskError } = await supabase
          .from('tasks')
          .update({ 
            completed: true, 
            completed_at: new Date().toISOString() 
          })
          .eq('id', taskId);

        if (taskError) {
          console.error('Erro ao atualizar tarefa:', taskError);
          showFeedbackMessage('Erro ao completar tarefa!');
          return;
        }

        // Update coin balance in database
        const { error: coinsError } = await supabase
          .from('user_coins')
          .upsert({
            user_id: user.id,
            family_id: (await supabase
              .from('family_members')
              .select('family_id')
              .eq('user_id', user.id)
              .single()).data?.family_id,
            balance: coinBalance + task.reward
          }, {
            onConflict: 'user_id,family_id'
          });

        if (coinsError) {
          console.error('Erro ao atualizar moedas:', coinsError);
          showFeedbackMessage('Erro ao adicionar moedas!');
          return;
        }

        // Update local state
        setCoinBalance(prev => prev + task.reward);
        showFeedbackMessage(`+${task.reward} Moedas!`);
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, completed: true } : t
          )
        );

      } else {
        // Check if can unmark
        if (coinBalance >= task.reward) {
          // Update task completion in database
          const { error: taskError } = await supabase
            .from('tasks')
            .update({ 
              completed: false, 
              completed_at: null 
            })
            .eq('id', taskId);

          if (taskError) {
            console.error('Erro ao atualizar tarefa:', taskError);
            showFeedbackMessage('Erro ao desmarcar tarefa!');
            return;
          }

          // Update coin balance in database
          const { error: coinsError } = await supabase
            .from('user_coins')
            .upsert({
              user_id: user.id,
              family_id: (await supabase
                .from('family_members')
                .select('family_id')
                .eq('user_id', user.id)
                .single()).data?.family_id,
              balance: coinBalance - task.reward
            }, {
              onConflict: 'user_id,family_id'
            });

          if (coinsError) {
            console.error('Erro ao atualizar moedas:', coinsError);
            showFeedbackMessage('Erro ao remover moedas!');
            return;
          }

          // Update local state
          setCoinBalance(prev => prev - task.reward);
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === taskId ? { ...t, completed: false } : t
            )
          );
        } else {
          showFeedbackMessage('Moedas já gastas!');
        }
      }
    } catch (error) {
      console.error('Erro ao processar tarefa:', error);
      showFeedbackMessage('Erro inesperado!');
    }
  };

  const handleDateSelect = (date: Date, todaySelected: boolean) => {
    setSelectedDate(date);
    setIsToday(todaySelected);
  };

  const handleSpecialMissionComplete = (prizeAmount: number) => {
    setCoinBalance(prev => prev + prizeAmount);
    showFeedbackMessage(`PRÊMIO! +${prizeAmount} Moedas!`);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleStoreClick = () => {
    navigate('/loja');
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
              onClick={handleStoreClick}
            >
              <ShoppingCart className="w-6 h-6" />
            </PixelButton>
            
            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Configurações"
              onClick={handleSettingsClick}
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