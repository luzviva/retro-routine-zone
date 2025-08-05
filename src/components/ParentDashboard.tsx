import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { SpecialMissionCreationForm } from "./SpecialMissionCreationForm";
import { useNavigate } from "react-router-dom";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const navigate = useNavigate();
  const handleTaskSubmit = (data: any) => {
    console.log('Nova tarefa:', data);
    // Aqui implementaria a lógica para salvar a tarefa
  };

  const handleStoreItemSubmit = (data: any) => {
    console.log('Novo item da loja:', data);
    // Aqui implementaria a lógica para salvar o item da loja
  };

  const handleSpecialMissionSubmit = (data: any) => {
    console.log('Nova missão especial:', data);
    // Aqui implementaria a lógica para salvar a missão especial
  };

  return (
    <div>
      <header className="pixel-border p-4 mb-8 flex justify-between items-center">
        <h1 className="text-3xl text-cyan-400">Painel dos Pais</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/novoperfil')} 
            className="pixel-btn text-green-400" 
            style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
          >
            Criar Perfil
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

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Criar Tarefa */}
          <TaskCreationForm onSubmit={handleTaskSubmit} />

          {/* Formulário de Criar Item da Loja */}
          <StoreItemCreationForm onSubmit={handleStoreItemSubmit} />
        </div>

        {/* Formulário de Criar Missão Especial */}
        <SpecialMissionCreationForm onSubmit={handleSpecialMissionSubmit} />
      </main>
    </div>
  );
};