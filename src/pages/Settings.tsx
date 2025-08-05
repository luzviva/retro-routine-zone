import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PinScreen } from "../components/PinScreen";
import { ChildTasksScreen } from "../components/ChildTasksScreen";
import { ChildStoreScreen } from "../components/ChildStoreScreen";
import { ParentDashboard } from "../components/ParentDashboard";

type ScreenType = 'pin' | 'child-tasks' | 'child-store' | 'parent-dashboard';
type UserType = 'child' | 'parent';

const Settings = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('pin');
  const [coinBalance] = useState(125);

  const handlePinSuccess = (userType: UserType) => {
    if (userType === 'child') {
      setCurrentScreen('child-tasks');
    } else {
      setCurrentScreen('parent-dashboard');
    }
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as ScreenType);
  };

  const handleLogout = () => {
    setCurrentScreen('pin');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'pin':
        return <PinScreen onPinSuccess={handlePinSuccess} />;
      case 'child-tasks':
        return (
          <ChildTasksScreen 
            coinBalance={coinBalance}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case 'child-store':
        return (
          <ChildStoreScreen 
            coinBalance={coinBalance}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case 'parent-dashboard':
        return <ParentDashboard onLogout={handleLogout} />;
      default:
        return <PinScreen onPinSuccess={handlePinSuccess} />;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão de voltar para home - apenas visível na tela PIN */}
        {currentScreen === 'pin' && (
          <div className="mb-4">
            <button 
              onClick={handleBackToHome}
              className="pixel-btn text-cyan-400"
              style={{ borderColor: 'hsl(var(--pixel-cyan))', color: 'hsl(var(--pixel-cyan))' }}
            >
              ← Voltar para Home
            </button>
          </div>
        )}
        
        {renderScreen()}
      </div>
    </div>
  );
};

export default Settings;