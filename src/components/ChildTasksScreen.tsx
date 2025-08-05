import { CoinIcon } from "./CoinIcon";

interface ChildTasksScreenProps {
  coinBalance: number;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const tasks = [
  { id: 1, name: "Arrumar a cama", reward: 5, completed: true },
  { id: 2, name: "Ler por 15 minutos", reward: 10, completed: false }
];

const weekDays = [
  { name: "SEG", tasks: tasks },
  { name: "TER", tasks: [{ id: 3, name: "Arrumar a cama", reward: 5, completed: false }] },
  { name: "QUA", tasks: [] },
  { name: "QUI", tasks: [] },
  { name: "SEX", tasks: [] },
  { name: "SAB", tasks: [] },
  { name: "DOM", tasks: [] }
];

export const ChildTasksScreen = ({ coinBalance, onNavigate, onLogout }: ChildTasksScreenProps) => {
  return (
    <div>
      {/* Header da Criança */}
      <header className="pixel-border p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl text-cyan-400">Olá, Aventureiro!</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-3xl text-yellow-400">
            <CoinIcon className="w-8 h-8" />
            <span>{coinBalance}</span>
          </div>
          <button 
            onClick={() => onNavigate('child-store-screen')} 
            className="pixel-btn"
          >
            Loja
          </button>
          <button 
            onClick={onLogout} 
            className="pixel-btn text-yellow-400" 
            style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Quadro de Tarefas Semanal */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <div key={index} className="pixel-border p-4">
            <h3 className="text-2xl text-center text-yellow-400 mb-4 border-b-4 border-yellow-400 pb-2">
              {day.name}
            </h3>
            {day.tasks.length > 0 ? (
              <div className="space-y-4">
                {day.tasks.map(task => (
                  <div key={task.id} className="bg-gray-800/50 p-3 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="task-checkbox" 
                      id={`task${task.id}`} 
                      defaultChecked={task.completed}
                    />
                    <label htmlFor={`task${task.id}`} className="flex-1 text-lg">
                      {task.name}
                    </label>
                    <span className="flex items-center gap-1 text-yellow-400 text-lg">
                      <CoinIcon className="w-4 h-4" />
                      {task.reward}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-cyan-400/80 p-6 text-lg">
                Nenhuma tarefa para hoje! Hora de brincar!
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};