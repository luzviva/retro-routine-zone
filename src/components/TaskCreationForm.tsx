import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskFormData {
  title: string;
  description: string;
  reward: number;
  child: string;
  frequency: 'DIARIA' | 'SEMANAL' | 'UNICA' | 'DATAS_ESPECIFICAS';
  dateStart?: string;
  dateEnd?: string;
  weekdays?: string[];
  specificDate?: string;
  timeStart?: string;
  timeEnd?: string;
  timeMode: 'start-end' | 'start-duration';
  duration?: number; // em minutos
}

interface TaskCreationFormProps {
  onSubmit: (data: TaskFormData) => void;
}

export const TaskCreationForm = ({ onSubmit }: TaskCreationFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    reward: 5,
    child: '',
    frequency: 'DIARIA',
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: '',
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    timeStart: '08:00',
    timeEnd: '08:10',
    timeMode: 'start-end',
    duration: 10,
  });
  
  const [children, setChildren] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFamilyChildren();
  }, []);

  const fetchFamilyChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all children profiles directly
      const { data: childrenData, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('is_child', true);

      if (error) {
        console.error('Erro ao buscar crianças:', error);
        return;
      }

      const childrenList = (childrenData || []).map(child => ({
        id: child.user_id,
        name: child.display_name || 'Sem nome'
      }));

      setChildren(childrenList);
      
      // Set first child as default
      if (childrenList.length > 0) {
        setFormData(prev => ({ ...prev, child: childrenList[0].id }));
      }

    } catch (error) {
      console.error('Erro ao buscar dados da família:', error);
    }
  };

  const generateTaskDates = (formData: TaskFormData): string[] => {
    const dates: string[] = [];
    
    if (formData.frequency === 'UNICA') {
      if (formData.specificDate) {
        dates.push(formData.specificDate);
      }
    } else if (formData.frequency === 'DIARIA') {
      const start = new Date(formData.dateStart || '');
      const end = new Date(formData.dateEnd || formData.dateStart || '');
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
    } else if (formData.frequency === 'SEMANAL') {
      const start = new Date(formData.dateStart || '');
      const end = new Date(formData.dateEnd || formData.dateStart || '');
      const weekdayNumbers = formData.weekdays?.map(day => {
        const map: { [key: string]: number } = {
          'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
        };
        return map[day];
      }) || [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (weekdayNumbers.includes(d.getDay())) {
          dates.push(d.toISOString().split('T')[0]);
        }
      }
    }
    
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Título da tarefa é obrigatório",
      });
      setLoading(false);
      return;
    }

    if (!formData.child) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma criança para a tarefa",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get family ID
      const { data: memberData } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!memberData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Família não encontrada",
        });
        setLoading(false);
        return;
      }

      // Generate all task dates
      const taskDates = generateTaskDates(formData);

      if (taskDates.length === 0) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nenhuma data válida foi gerada para a tarefa",
        });
        setLoading(false);
        return;
      }

      // Create tasks for each date
      const tasksToInsert = taskDates.map(date => ({
        family_id: memberData.family_id,
        assigned_to: formData.child,
        created_by: user.id,
        title: formData.title,
        description: formData.description || null,
        reward_coins: formData.reward,
        task_date: date,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (error) {
        console.error('Erro ao criar tarefas:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar tarefa",
          description: error.message,
        });
      } else {
        toast({
          title: "Sucesso!",
          description: `${taskDates.length} tarefa(s) criada(s) com sucesso`,
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          reward: 5,
          child: children[0]?.id || '',
          frequency: 'DIARIA',
          dateStart: new Date().toISOString().split('T')[0],
          dateEnd: '',
          weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          timeStart: '08:00',
          timeEnd: '08:10',
          timeMode: 'start-end',
          duration: 10,
        });
        
        onSubmit(formData);
      }

    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFrequencyFields = (frequency: string) => {
    setFormData(prev => ({ ...prev, frequency: frequency as any }));
  };

  const toggleWeekday = (day: string) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays?.includes(day) 
        ? prev.weekdays.filter(d => d !== day)
        : [...(prev.weekdays || []), day]
    }));
  };

  return (
    <div className="pixel-border p-6">
      <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Criar Nova Tarefa</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="task-title" className="text-lg block mb-1">Título da Tarefa</label>
          <input 
            type="text" 
            id="task-title" 
            className="nes-input" 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="task-desc" className="text-lg block mb-1">Descrição (Opcional)</label>
          <textarea 
            id="task-desc" 
            className="nes-input h-24"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-reward" className="text-lg block mb-1">Recompensa</label>
            <input 
              type="number" 
              id="task-reward" 
              className="nes-input" 
              value={formData.reward}
              onChange={(e) => setFormData(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <label htmlFor="task-child" className="text-lg block mb-1">Associar à Criança</label>
            <select 
              id="task-child" 
              className="nes-select"
              value={formData.child}
              onChange={(e) => setFormData(prev => ({ ...prev, child: e.target.value }))}
              disabled={children.length === 0}
            >
              {children.length === 0 ? (
                <option value="">Nenhuma criança encontrada</option>
              ) : (
                children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        
        {/* Configuração de Horários */}
        <div className="space-y-4 border-t border-gray-600 pt-4">
          <h3 className="text-xl text-cyan-400">Horário da Tarefa</h3>
          <div>
            <label className="text-lg block mb-2">Configuração de Tempo</label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-lg cursor-pointer">
                <input 
                  type="radio" 
                  name="time-mode" 
                  value="start-end" 
                  className="nes-radio"
                  checked={formData.timeMode === 'start-end'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeMode: e.target.value as any }))}
                />
                Início e Fim
              </label>
              <label className="flex items-center gap-2 text-lg cursor-pointer">
                <input 
                  type="radio" 
                  name="time-mode" 
                  value="start-duration" 
                  className="nes-radio"
                  checked={formData.timeMode === 'start-duration'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeMode: e.target.value as any }))}
                />
                Início e Duração
              </label>
            </div>
          </div>
          
          {formData.timeMode === 'start-end' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-start" className="block mb-1">Horário de Início</label>
                <input 
                  type="time" 
                  id="time-start" 
                  className="nes-input"
                  value={formData.timeStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="time-end" className="block mb-1">Horário de Fim</label>
                <input 
                  type="time" 
                  id="time-end" 
                  className="nes-input"
                  value={formData.timeEnd || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeEnd: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          {formData.timeMode === 'start-duration' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-start-duration" className="block mb-1">Horário de Início</label>
                <input 
                  type="time" 
                  id="time-start-duration" 
                  className="nes-input"
                  value={formData.timeStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="duration" className="block mb-1">Duração (minutos)</label>
                <input 
                  type="number" 
                  id="duration" 
                  className="nes-input"
                  min="1"
                  max="1440"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="task-frequency" className="text-lg block mb-1">Frequência</label>
          <select 
            id="task-frequency" 
            className="nes-select" 
            value={formData.frequency}
            onChange={(e) => updateFrequencyFields(e.target.value)}
          >
            <option value="DIARIA">Diária</option>
            <option value="SEMANAL">Semanal</option>
            <option value="UNICA">Data Única</option>
            <option value="DATAS_ESPECIFICAS">Datas Específicas</option>
          </select>
        </div>
       
        {/* Campos Dinâmicos de Frequência */}
        <div className="space-y-4 pt-2">
          {/* Diária */}
          {formData.frequency === 'DIARIA' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-start-diaria" className="block mb-1">Data Início</label>
                <input 
                  type="date" 
                  id="date-start-diaria" 
                  className="nes-input"
                  value={formData.dateStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateStart: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="date-end-diaria" className="block mb-1">Data Fim</label>
                <input 
                  type="date" 
                  id="date-end-diaria" 
                  className="nes-input"
                  value={formData.dateEnd || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          {/* Semanal */}
          {formData.frequency === 'SEMANAL' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-start-semanal" className="block mb-1">Data Início</label>
                  <input 
                    type="date" 
                    id="date-start-semanal" 
                    className="nes-input"
                    value={formData.dateStart || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateStart: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="date-end-semanal" className="block mb-1">Data Fim</label>
                  <input 
                    type="date" 
                    id="date-end-semanal" 
                    className="nes-input"
                    value={formData.dateEnd || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                  />
                </div>
              </div>
              <label className="block mb-1">Dias da Semana</label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-center">
                {[
                  { key: 'sun', label: 'D' },
                  { key: 'mon', label: 'S' },
                  { key: 'tue', label: 'T' },
                  { key: 'wed', label: 'Q' },
                  { key: 'thu', label: 'Q' },
                  { key: 'fri', label: 'S' },
                  { key: 'sat', label: 'S' }
                ].map(day => (
                  <div key={day.key}>
                    <input 
                      type="checkbox" 
                      id={day.key} 
                      className="task-checkbox"
                      checked={formData.weekdays?.includes(day.key) || false}
                      onChange={() => toggleWeekday(day.key)}
                    />
                    <label htmlFor={day.key}>{day.label}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Única */}
          {formData.frequency === 'UNICA' && (
            <div>
              <label htmlFor="date-unica" className="block mb-1">Data</label>
              <input 
                type="date" 
                id="date-unica" 
                className="nes-input"
                value={formData.specificDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specificDate: e.target.value }))}
              />
            </div>
          )}
          
          {/* Datas Específicas */}
          {formData.frequency === 'DATAS_ESPECIFICAS' && (
            <div>
              <label className="block mb-1">Selecione as datas</label>
              <input type="text" className="nes-input" placeholder="Use um calendário de múltipla seleção aqui" />
            </div>
          )}
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="pixel-btn w-full text-green-400" 
            style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Salvar Tarefa'}
          </button>
        </div>
      </form>
    </div>
  );
};