import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const handleTaskSubmit = (data: any) => {
    console.log('Nova tarefa:', data);
    // Aqui implementaria a lógica para salvar a tarefa
  };

  const handleStoreItemSubmit = (data: any) => {
    console.log('Novo item da loja:', data);
    // Aqui implementaria a lógica para salvar o item da loja
  };

  return (
    <div>
      <header className="pixel-border p-4 mb-8 flex justify-between items-center">
        <h1 className="text-3xl text-cyan-400">Painel dos Pais</h1>
        <button 
          onClick={onLogout} 
          className="pixel-btn text-yellow-400" 
          style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
        >
          Sair
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Criar Tarefa */}
        <TaskCreationForm onSubmit={handleTaskSubmit} />

        {/* Formulário de Criar Item da Loja */}
        <StoreItemCreationForm onSubmit={handleStoreItemSubmit} />
      </main>
    </div>
  );
};