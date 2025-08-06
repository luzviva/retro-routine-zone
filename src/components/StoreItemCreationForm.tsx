import { useState } from "react";

interface StoreItemFormData {
  name: string;
  description: string;
  cost: number;
  stock?: number;
  image?: File;
}

interface StoreItemCreationFormProps {
  onSubmit: (data: StoreItemFormData) => void;
}

export const StoreItemCreationForm = ({ onSubmit }: StoreItemCreationFormProps) => {
  const [formData, setFormData] = useState<StoreItemFormData>({
    name: 'Pizza no Sábado',
    description: 'Vamos pedir uma pizza grande do sabor que você escolher!',
    cost: 300,
    stock: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="pixel-border p-6">
      <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Criar Item da Loja</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="item-name" className="text-lg block mb-1">Nome do Item</label>
          <input 
            type="text" 
            id="item-name" 
            className="nes-input" 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="item-desc" className="text-lg block mb-1">Descrição</label>
          <textarea 
            id="item-desc" 
            className="nes-input h-24"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="item-cost" className="text-lg block mb-1">Custo (moedas)</label>
            <input 
              type="number" 
              id="item-cost" 
              className="nes-input" 
              value={formData.cost}
              onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <label htmlFor="item-stock" className="text-lg block mb-1">Estoque (vazio=infinito)</label>
            <input 
              type="number" 
              id="item-stock" 
              className="nes-input" 
              placeholder="infinito"
              value={formData.stock || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : undefined }))}
            />
          </div>
        </div>
        <div>
          <label htmlFor="item-image" className="text-lg block mb-1">Imagem do Item</label>
          <input 
            type="file" 
            id="item-image" 
            className="nes-input"
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] }))}
          />
        </div>
        <div className="pt-4">
          <button type="submit" className="pixel-btn w-full text-green-400" style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}>
            Salvar Item
          </button>
        </div>
      </form>
    </div>
  );
};