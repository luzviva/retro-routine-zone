import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NovoPerfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarMode, setAvatarMode] = useState<'predefined' | 'draw'>('predefined');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [pencilSize, setPencilSize] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [childName, setChildName] = useState('');
  const [childGender, setChildGender] = useState('Menino');
  const [childBirthdate, setChildBirthdate] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('#ff0000');
  
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const pixelDrawSize = 8; // 128 / 16 = 8

  // Cores da paleta
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#f2d5b1', '#8c5a3c', '#4a2a0b', '#c2813e', '#345e7a', 'transparent'
  ];

  // Avatares pré-definidos (placeholders)
  const predefinedAvatars = [
    'https://placehold.co/64x64/e94560/ffffff?text=AV1',
    'https://placehold.co/64x64/00bcd4/ffffff?text=AV2',
    'https://placehold.co/64x64/4caf50/ffffff?text=AV3',
    'https://placehold.co/64x64/ff9800/ffffff?text=AV4',
    'https://placehold.co/64x64/9c27b0/ffffff?text=AV5',
    'https://placehold.co/64x64/22c55e/ffffff?text=AV6'
  ];

  useEffect(() => {
    if (avatarMode === 'predefined' && predefinedAvatars.length > 0) {
      setSelectedAvatar(predefinedAvatars[0]);
    }
  }, [avatarMode]);

  useEffect(() => {
    updatePreview();
  }, [selectedAvatar, avatarMode]);

  const drawOnPixelCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !pixelCanvasRef.current) return;
    
    const canvas = pixelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelDrawSize);
    const y = Math.floor((e.clientY - rect.top) / pixelDrawSize);
    
    const offset = Math.floor(pencilSize / 2);

    for (let i = 0; i < pencilSize; i++) {
      for (let j = 0; j < pencilSize; j++) {
        const drawX = x - offset + i;
        const drawY = y - offset + j;
        if (selectedColor === 'transparent') {
          ctx.clearRect(drawX * pixelDrawSize, drawY * pixelDrawSize, pixelDrawSize, pixelDrawSize);
        } else {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(drawX * pixelDrawSize, drawY * pixelDrawSize, pixelDrawSize, pixelDrawSize);
        }
      }
    }
    updatePreview();
  };

  const clearPixelCanvas = () => {
    if (!pixelCanvasRef.current) return;
    const ctx = pixelCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, pixelCanvasRef.current.width, pixelCanvasRef.current.height);
    updatePreview();
  };

  const updatePreview = () => {
    if (!previewCanvasRef.current) return;
    const previewCtx = previewCanvasRef.current.getContext('2d');
    if (!previewCtx) return;

    previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    previewCtx.imageSmoothingEnabled = false;

    if (avatarMode === 'predefined' && selectedAvatar) {
      const img = new Image();
      img.onload = () => {
        previewCtx.drawImage(img, 0, 0, previewCanvasRef.current!.width, previewCanvasRef.current!.height);
      };
      img.src = selectedAvatar;
    } else if (avatarMode === 'draw' && pixelCanvasRef.current) {
      previewCtx.drawImage(pixelCanvasRef.current, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }
  };

  const handleSaveProfile = async () => {
    if (!childName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, insira o nome da criança",
      });
      return;
    }

    if (!childBirthdate) {
      toast({
        variant: "destructive", 
        title: "Data de nascimento obrigatória",
        description: "Por favor, insira a data de nascimento",
      });
      return;
    }

    setLoading(true);

    try {
      // Get avatar URL - use drawing canvas only for custom drawings
      let avatarUrl = selectedAvatar;
      if (avatarMode === 'draw' && pixelCanvasRef.current) {
        try {
          // Only export from the drawing canvas, not the preview canvas
          avatarUrl = pixelCanvasRef.current.toDataURL();
        } catch (error) {
          console.warn('Could not export custom drawing, using default:', error);
          avatarUrl = ''; // Use empty string if drawing export fails
        }
      }

      // Use the new secure function to create child profile
      const { data, error } = await supabase.rpc('create_child_profile', {
        child_name: childName,
        child_gender: childGender,
        child_birth_date: childBirthdate,
        child_favorite_color: favoriteColor,
        child_avatar_url: avatarUrl
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil criado com sucesso!",
        description: "O perfil da criança foi salvo no sistema",
      });

      navigate('/settings');

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar perfil",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="pixel-border p-4 mb-8 flex justify-between items-center">
          <h1 className="text-3xl text-cyan-400">Criar/Editar Perfil</h1>
          <button 
            onClick={() => navigate('/settings')} 
            className="pixel-btn text-yellow-400"
            style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
          >
            Voltar
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de Formulários */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações Básicas */}
            <div className="pixel-border p-6">
              <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Informações Básicas</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="child-name" className="text-lg block mb-1">Nome</label>
                  <input 
                    type="text" 
                    id="child-name" 
                    className="w-full bg-black/40 border-4 border-cyan-400 p-2 text-white text-lg focus:outline-none focus:border-yellow-400" 
                    placeholder="Aventureiro"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="child-gender" className="text-lg block mb-1">Gênero</label>
                    <select 
                      id="child-gender" 
                      className="w-full bg-black/40 border-4 border-cyan-400 p-2 text-white text-lg focus:outline-none focus:border-yellow-400 appearance-none"
                      value={childGender}
                      onChange={(e) => setChildGender(e.target.value)}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="%2300ffff"><polygon points="0,0 20,0 10,10"/></svg>')`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1em',
                        paddingRight: '2rem'
                      }}
                    >
                      <option>Menino</option>
                      <option>Menina</option>
                      <option>Prefiro não dizer</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="child-birthdate" className="text-lg block mb-1">Data de Aniversário</label>
                    <input 
                      type="date" 
                      id="child-birthdate" 
                      className="w-full bg-black/40 border-4 border-cyan-400 p-2 text-white text-lg focus:outline-none focus:border-yellow-400"
                      style={{ colorScheme: 'dark' }}
                      value={childBirthdate}
                      onChange={(e) => setChildBirthdate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="favorite-color" className="text-lg block mb-1">Cor Favorita</label>
                  <input 
                    type="color" 
                    id="favorite-color" 
                    className="w-full h-12 bg-black/40 border-4 border-cyan-400 p-1 cursor-pointer focus:outline-none focus:border-yellow-400"
                    value={favoriteColor}
                    onChange={(e) => setFavoriteColor(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Criador de Avatar */}
            <div className="pixel-border p-6">
              <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Avatar</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                <label className="flex items-center gap-2 text-lg cursor-pointer">
                  <input 
                    type="radio" 
                    name="avatar-type" 
                    value="predefined" 
                    className="appearance-none w-6 h-6 border-4 border-cyan-400 rounded-full bg-gray-800 cursor-pointer relative checked:after:content-[''] checked:after:block checked:after:w-3 checked:after:h-3 checked:after:bg-yellow-400 checked:after:rounded-full checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                    onChange={() => setAvatarMode('predefined')} 
                    checked={avatarMode === 'predefined'}
                  />
                  Escolher Avatar
                </label>
                <label className="flex items-center gap-2 text-lg cursor-pointer">
                  <input 
                    type="radio" 
                    name="avatar-type" 
                    value="draw" 
                    className="appearance-none w-6 h-6 border-4 border-cyan-400 rounded-full bg-gray-800 cursor-pointer relative checked:after:content-[''] checked:after:block checked:after:w-3 checked:after:h-3 checked:after:bg-yellow-400 checked:after:rounded-full checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                    onChange={() => setAvatarMode('draw')}
                    checked={avatarMode === 'draw'}
                  />
                  Desenhar Avatar
                </label>
              </div>

              {/* Galeria de Avatares Pré-definidos */}
              {avatarMode === 'predefined' && (
                <div>
                  <p className="mb-2">Selecione um avatar:</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 bg-black/20 p-2">
                    {predefinedAvatars.map((avatar, index) => (
                      <img 
                        key={index}
                        src={avatar} 
                        className={`w-16 h-16 border-4 cursor-pointer transition-all duration-150 ${
                          selectedAvatar === avatar ? 'border-yellow-400 scale-110' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedAvatar(avatar)}
                        alt={`Avatar ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Editor de Pixel Art */}
              {avatarMode === 'draw' && (
                <div>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <canvas 
                      ref={pixelCanvasRef}
                      width="128" 
                      height="128"
                      className="bg-slate-600 border-2 border-black cursor-crosshair"
                      style={{ imageRendering: 'pixelated' }}
                      onMouseDown={(e) => {
                        setIsDrawing(true);
                        drawOnPixelCanvas(e);
                      }}
                      onMouseMove={drawOnPixelCanvas}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseLeave={() => setIsDrawing(false)}
                    />
                    <div className="flex-grow">
                      <p className="text-lg mb-2">Ferramentas</p>
                      <div>
                        <label htmlFor="pencil-size" className="text-base block mb-1">
                          Espessura: <span>{pencilSize}</span>
                        </label>
                        <input 
                          type="range" 
                          id="pencil-size" 
                          min="1" 
                          max="5" 
                          value={pencilSize}
                          onChange={(e) => setPencilSize(parseInt(e.target.value))}
                          className="w-full h-3 bg-blue-900 border-2 border-black appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                        />
                      </div>
                      <p className="text-base mb-1 mt-2">Cores Rápidas</p>
                      <div className="grid grid-cols-6 gap-1 mb-4">
                        {colors.map((color, index) => (
                          <div 
                            key={index}
                            className={`w-8 h-8 cursor-pointer border-2 border-black transition-all duration-100 ${
                              selectedColor === color ? 'border-yellow-400' : ''
                            }`}
                            style={{ 
                              backgroundColor: color === 'transparent' ? 'transparent' : color,
                              backgroundImage: color === 'transparent' 
                                ? 'linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)'
                                : 'none',
                              backgroundSize: color === 'transparent' ? '10px 10px' : 'auto',
                              backgroundPosition: color === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : 'initial',
                              boxShadow: '2px 2px 0px #000'
                            }}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                      <label htmlFor="color-picker" className="text-base block mb-1">Cor Personalizada</label>
                      <input 
                        type="color" 
                        id="color-picker" 
                        value={selectedColor === 'transparent' ? '#E94560' : selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-10 bg-transparent border-2 border-black cursor-pointer p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:border-none"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                      />
                      <button 
                        className="pixel-btn text-sm w-full mt-4" 
                        onClick={clearPixelCanvas}
                      >
                        Limpar Desenho
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Preview do Avatar */}
          <div className="flex flex-col items-center">
            <div className="pixel-border p-2 mb-4">
              <canvas 
                ref={previewCanvasRef}
                width="256" 
                height="256"
                className="bg-blue-900"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <button 
              className="pixel-btn w-full text-green-400"
              style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NovoPerfil;