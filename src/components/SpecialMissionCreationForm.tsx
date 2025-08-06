import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SpecialMissionFormData {
  title: string;
  executions: number;
  prizeType: 'coins' | 'store-item' | 'text';
  coinsAmount?: number;
  storeItem?: string;
  textDescription?: string;
  assignedTo: string;
}

interface SpecialMissionCreationFormProps {
  onSubmit: (data: SpecialMissionFormData) => void;
}

export const SpecialMissionCreationForm = ({ onSubmit }: SpecialMissionCreationFormProps) => {
  const [formData, setFormData] = useState<SpecialMissionFormData>({
    title: '',
    executions: 5,
    prizeType: 'coins',
    coinsAmount: 25,
    assignedTo: '',
  });

  const [children, setChildren] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    fetchFamilyChildren();
  }, []);

  const fetchFamilyChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's family
      const { data: memberData } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!memberData) return;

      // Get all children in the family
      const { data: childrenData, error } = await supabase
        .from('family_members')
        .select(`
          user_id,
          profiles(display_name)
        `)
        .eq('family_id', memberData.family_id)
        .eq('role', 'child');

      if (error) {
        console.error('Erro ao buscar crianças:', error);
        return;
      }

      const childrenList = (childrenData || []).map(child => ({
        id: child.user_id,
        name: (child.profiles as any)?.display_name || 'Sem nome'
      }));

      setChildren(childrenList);
      
      // Set first child as default
      if (childrenList.length > 0) {
        setFormData(prev => ({ ...prev, assignedTo: childrenList[0].id }));
      }

    } catch (error) {
      console.error('Erro ao buscar dados da família:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updatePrizeType = (prizeType: 'coins' | 'store-item' | 'text') => {
    setFormData(prev => ({ ...prev, prizeType }));
  };

  return (
    <div className="pixel-border p-6 mt-8">
      <h2 className="text-3xl text-purple-400 mb-6 border-b-4 border-purple-400 pb-2">✨ Criar Missão Especial ✨</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="special-task-title" className="text-lg block mb-1">Título da Missão</label>
            <input 
              type="text" 
              id="special-task-title" 
              className="nes-input" 
              placeholder="Beba 5 copos de água hoje!"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="special-task-executions" className="text-lg block mb-1">Nº de Execuções</label>
            <input 
              type="number" 
              id="special-task-executions" 
              className="nes-input" 
              placeholder="5"
              value={formData.executions}
              onChange={(e) => setFormData(prev => ({ ...prev, executions: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="mission-child" className="text-lg block mb-1">Associar à Criança</label>
          <select 
            id="mission-child" 
            className="nes-select"
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
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

        <div>
          <label className="text-lg block mb-2">Tipo de Prêmio</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-lg cursor-pointer">
              <input 
                type="radio" 
                name="prize-type" 
                value="coins" 
                className="nes-radio"
                checked={formData.prizeType === 'coins'}
                onChange={() => updatePrizeType('coins')}
              />
              Moedas
            </label>
            <label className="flex items-center gap-2 text-lg cursor-pointer">
              <input 
                type="radio" 
                name="prize-type" 
                value="store-item" 
                className="nes-radio"
                checked={formData.prizeType === 'store-item'}
                onChange={() => updatePrizeType('store-item')}
              />
              Item da Loja
            </label>
            <label className="flex items-center gap-2 text-lg cursor-pointer">
              <input 
                type="radio" 
                name="prize-type" 
                value="text" 
                className="nes-radio"
                checked={formData.prizeType === 'text'}
                onChange={() => updatePrizeType('text')}
              />
              Outro
            </label>
          </div>
        </div>

        {/* Campos Dinâmicos de Prêmio */}
        <div className="pt-2">
          {formData.prizeType === 'coins' && (
            <div>
              <label htmlFor="prize-coins-amount" className="text-lg block mb-1">Quantidade de Moedas</label>
              <input 
                type="number" 
                id="prize-coins-amount" 
                className="nes-input" 
                placeholder="25"
                value={formData.coinsAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coinsAmount: parseInt(e.target.value) }))}
              />
            </div>
          )}
          
          {formData.prizeType === 'store-item' && (
            <div>
              <label htmlFor="prize-store-item-select" className="text-lg block mb-1">Selecione o Item da Loja</label>
              <select 
                id="prize-store-item-select" 
                className="nes-select"
                value={formData.storeItem || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, storeItem: e.target.value }))}
              >
                <option value="">Selecione um item</option>
                <option value="1h de Videogame">1h de Videogame</option>
                <option value="Passeio no Parque">Passeio no Parque</option>
                <option value="Noite da Pizza">Noite da Pizza</option>
                <option value="Caixa de LEGO">Caixa de LEGO</option>
              </select>
            </div>
          )}
          
          {formData.prizeType === 'text' && (
            <div>
              <label htmlFor="prize-text-description" className="text-lg block mb-1">Descreva o Prêmio</label>
              <textarea 
                id="prize-text-description" 
                className="nes-input h-24" 
                placeholder="Escolher o filme para a noite de cinema!"
                value={formData.textDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, textDescription: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <button type="submit" className="pixel-btn w-full text-green-400" style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}>
            Salvar Missão Especial
          </button>
        </div>
      </form>
    </div>
  );
};