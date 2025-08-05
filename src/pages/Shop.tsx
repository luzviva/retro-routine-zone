import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CoinIcon } from "../components/CoinIcon";

interface StoreItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  image: string;
  canAfford: boolean;
}

interface ConfirmPurchaseModalProps {
  item: StoreItem | null;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmPurchaseModal = ({ item, isVisible, onClose, onConfirm }: ConfirmPurchaseModalProps) => {
  if (!isVisible || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="pixel-border p-6 md:p-8 w-full max-w-md text-center relative">
        <h2 className="text-3xl text-yellow-400 mb-4">Confirmar Compra?</h2>
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-40 object-cover mx-auto mb-4 border-4 border-black" 
          style={{ imageRendering: 'pixelated' }}
        />
        <h3 className="text-2xl text-cyan-400 mb-2">{item.name}</h3>
        <p className="mb-6 text-base">{item.description} A combinação será feita com seus pais.</p>
        <p className="text-3xl text-yellow-400 mb-8 flex items-center justify-center gap-2">
          <CoinIcon />
          {item.cost}
        </p>
        <div className="flex justify-center gap-4 md:gap-6">
          <button onClick={onClose} className="pixel-btn">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-green">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [coinBalance, setCoinBalance] = useState(125);

  const storeItems: StoreItem[] = [
    {
      id: 1,
      name: "1h de Videogame",
      description: "Uma hora extra para jogar seu jogo favorito no final de semana.",
      cost: 100,
      image: "https://placehold.co/300x200/e94560/ffffff?text=1h+de+Videogame",
      canAfford: coinBalance >= 100
    },
    {
      id: 2,
      name: "Passeio no Parque",
      description: "Um passeio especial com direito a sorvete.",
      cost: 250,
      image: "https://placehold.co/300x200/0f3460/ffffff?text=Passeio+no+Parque",
      canAfford: coinBalance >= 250
    },
    {
      id: 3,
      name: "Noite da Pizza",
      description: "Escolha o sabor da pizza para o jantar de sábado!",
      cost: 120,
      image: "https://placehold.co/300x200/39FF14/000000?text=Pizza!",
      canAfford: coinBalance >= 120
    },
    {
      id: 4,
      name: "Caixa de LEGO",
      description: "Uma caixa nova de LEGO do seu tema preferido.",
      cost: 500,
      image: "https://placehold.co/300x200/ffff00/000000?text=LEGO",
      canAfford: coinBalance >= 500
    }
  ];

  const handlePurchaseClick = (item: StoreItem) => {
    if (item.canAfford) {
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedItem) {
      setCoinBalance(prevBalance => prevBalance - selectedItem.cost);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleBackToTasks = () => {
    navigate('/');
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* CABEÇALHO DA LOJA */}
        <header className="pixel-border p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-4xl text-yellow-400">LOJA DE RECOMPENSAS</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-3xl text-yellow-400">
              <CoinIcon className="w-8 h-8" />
              <span>{coinBalance}</span>
            </div>
            <button className="pixel-btn text-lg" onClick={handleBackToTasks}>
              Tarefas
            </button>
          </div>
        </header>

        {/* LOJA */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {storeItems.map(item => (
              <div 
                key={item.id} 
                className={`item-card ${!item.canAfford ? 'opacity-70' : ''}`}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-40 object-cover" 
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-2xl text-yellow-400 mb-2">{item.name}</h3>
                  <p className="text-cyan-400/80 mb-4 flex-grow text-base">{item.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl text-yellow-400 flex items-center gap-2">
                      <CoinIcon />
                      {item.cost}
                    </span>
                    <button 
                      className={item.canAfford ? "btn-green" : "btn-disabled"} 
                      disabled={!item.canAfford}
                      onClick={() => handlePurchaseClick(item)}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ConfirmPurchaseModal 
        item={selectedItem}
        isVisible={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default Shop;