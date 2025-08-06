import { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from "@/integrations/supabase/client";

interface StoreItemFormData {
  name: string;
  description: string;
  cost: number;
  stock?: number;
  image?: File;
  imageUrl?: string;
  imageType: 'file' | 'camera' | 'url';
  assignedTo: string;
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
    imageType: 'file',
    assignedTo: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [children, setChildren] = useState<Array<{id: string, name: string}>>([]);

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
        setFormData(prev => ({ ...prev, assignedTo: childrenList[0].id }));
      }

    } catch (error) {
      console.error('Erro ao buscar dados da família:', error);
    }
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setImagePreview(image.dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: image.dataUrl, imageType: 'camera' }));
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
    }
  };

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        setImagePreview(image.dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: image.dataUrl, imageType: 'camera' }));
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file, imageType: 'file' }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url, imageType: 'url' }));
    if (url) {
      setImagePreview(url);
    }
  };

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
          <label htmlFor="store-child" className="text-lg block mb-1">Associar à Criança</label>
          <select 
            id="store-child" 
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
        
        {/* Seção de Imagem */}
        <div className="space-y-4 border-t border-gray-600 pt-4">
          <h3 className="text-xl text-cyan-400">Imagem do Item</h3>
          
          {/* Opções de imagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={takePicture}
                className="pixel-btn w-full text-blue-400"
                style={{ borderColor: 'hsl(var(--pixel-blue))', color: 'hsl(var(--pixel-blue))' }}
              >
                📷 Tirar Foto
              </button>
              
              <button
                type="button"
                onClick={selectFromGallery}
                className="pixel-btn w-full text-purple-400"
                style={{ borderColor: 'hsl(var(--pixel-purple))', color: 'hsl(var(--pixel-purple))' }}
              >
                🖼️ Escolher da Galeria
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <label htmlFor="item-file" className="block mb-1 text-sm">Ou escolher arquivo:</label>
                <input 
                  type="file" 
                  id="item-file" 
                  className="nes-input text-sm"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <div>
                <label htmlFor="item-url" className="block mb-1 text-sm">Ou usar URL:</label>
                <input 
                  type="url" 
                  id="item-url" 
                  className="nes-input text-sm"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imageUrl || ''}
                  onChange={handleUrlChange}
                />
              </div>
            </div>
          </div>
          
          {/* Preview da imagem */}
          {imagePreview && (
            <div className="border-2 border-gray-600 p-4">
              <h4 className="text-lg mb-2">Preview:</h4>
              <img 
                src={imagePreview} 
                alt="Preview do item" 
                className="max-w-full h-32 object-cover border-2 border-white"
              />
            </div>
          )}
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