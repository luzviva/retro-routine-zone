import { useState } from "react";

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
    title: 'Escovar os dentes',
    description: 'Lembre-se de escovar bem por 2 minutos.',
    reward: 5,
    child: 'Aventureiro',
    frequency: 'DIARIA',
    dateStart: '',
    dateEnd: '',
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    timeStart: '08:00',
    timeEnd: '08:10',
    timeMode: 'start-end',
    duration: 10,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            >
              <option>Aventureiro</option>
              <option>Exploradora</option>
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
          <button type="submit" className="pixel-btn w-full text-green-400" style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}>
            Salvar Tarefa
          </button>
        </div>
      </form>
    </div>
  );
};