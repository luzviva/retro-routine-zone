import { useState } from "react";
import { CoinIcon } from "./CoinIcon";

interface StoreItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  image: string;
  canAfford: boolean;
}

interface ChildStoreScreenProps {
  coinBalance: number;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
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
      <div className="pixel-border p-8 w-full max-w-md text-center relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-4 text-4xl text-red-500"
        >
          &times;
        </button>
        <h2 className="text-3xl text-yellow-400 mb-4">Confirmar Compra?</h2>
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-40 object-cover mx-auto mb-4" 
          style={{ imageRendering: 'pixelated' }}
        />
        <h3 className="text-2xl text-cyan-400 mb-2">{item.name}</h3>
        <p className="mb-6">{item.description}</p>
        <p className="text-3xl text-yellow-400 mb-8 flex items-center justify-center gap-2">
          <CoinIcon />
          {item.cost}
        </p>
        <div className="flex justify-center gap-6">
          <button 
            onClick={onClose} 
            className="pixel-btn text-yellow-400" 
            style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="pixel-btn text-green-400" 
            style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChildStoreScreen = ({ coinBalance, onNavigate, onLogout }: ChildStoreScreenProps) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      description: "Um passeio especial no seu parque preferido com direito a sorvete.",
      cost: 250,
      image: "https://placehold.co/300x200/0f3460/ffffff?text=Passeio+no+Parque",
      canAfford: coinBalance >= 250
    }
  ];

  const handlePurchaseClick = (item: StoreItem) => {
    if (item.canAfford) {
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    setShowModal(false);
    setSelectedItem(null);
    // Aqui implementaria a lógica de compra
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div>
        {/* Header da Criança */}
        <header className="pixel-border p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl text-cyan-400">Loja de Recompensas</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-3xl text-yellow-400">
              <CoinIcon className="w-8 h-8" />
              <span>{coinBalance}</span>
            </div>
            <button 
              onClick={() => onNavigate('child-tasks-screen')} 
              className="pixel-btn"
            >
              Tarefas
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

        {/* Grade de Itens da Loja */}
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeItems.map(item => (
            <div key={item.id} className="pixel-border flex flex-col">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-40 object-cover" 
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-2xl text-yellow-400 mb-2">{item.name}</h3>
                <p className="text-cyan-400/80 mb-4 flex-grow">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-yellow-400 flex items-center gap-2">
                    <CoinIcon />
                    {item.cost}
                  </span>
                  <button 
                    className={item.canAfford ? "pixel-btn" : "btn-disabled"} 
                    disabled={!item.canAfford}
                    onClick={() => handlePurchaseClick(item)}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      <ConfirmPurchaseModal 
        item={selectedItem}
        isVisible={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPurchase}
      />
    </>
  );
};