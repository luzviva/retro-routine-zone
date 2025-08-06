import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { SpecialMissionCreationForm } from "./SpecialMissionCreationForm";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const navigate = useNavigate();
  const [openDialogs, setOpenDialogs] = useState({
    task: false,
    store: false,
    mission: false
  });

  const handleTaskSubmit = (data: any) => {
    console.log('Nova tarefa:', data);
    // Aqui implementaria a lógica para salvar a tarefa
    setOpenDialogs(prev => ({ ...prev, task: false }));
  };

  const handleStoreItemSubmit = (data: any) => {
    console.log('Novo item da loja:', data);
    // Aqui implementaria a lógica para salvar o item da loja
    setOpenDialogs(prev => ({ ...prev, store: false }));
  };

  const handleSpecialMissionSubmit = (data: any) => {
    console.log('Nova missão especial:', data);
    // Aqui implementaria a lógica para salvar a missão especial
    setOpenDialogs(prev => ({ ...prev, mission: false }));
  };

  return (
    <div>
      <header className="pixel-border p-4 mb-8 text-center">
        <h1 className="text-3xl text-cyan-400">Painel dos Pais</h1>
      </header>

      <main className="flex flex-col items-center space-y-6">
        {/* Botão Criar Tarefa */}
        <Dialog open={openDialogs.task} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, task: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Tarefa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskCreationForm onSubmit={handleTaskSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Item da Loja */}
        <Dialog open={openDialogs.store} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, store: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Item da Loja
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Item da Loja</DialogTitle>
            </DialogHeader>
            <StoreItemCreationForm onSubmit={handleStoreItemSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Missão Especial */}
        <Dialog open={openDialogs.mission} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, mission: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Missão Especial
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Missão Especial</DialogTitle>
            </DialogHeader>
            <SpecialMissionCreationForm onSubmit={handleSpecialMissionSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Perfil */}
        <button 
          onClick={() => navigate('/novoperfil')} 
          className="pixel-btn text-red-400 w-64 text-xl py-4" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          Criar Perfil
        </button>

        {/* Botão Sair */}
        <button 
          onClick={onLogout} 
          className="pixel-btn text-red-400 w-64 text-xl py-4" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          Sair
        </button>
      </main>
    </div>
  );
};