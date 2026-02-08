import { useState } from 'react';
import LandingPage from './components/LandingPage';
import RoomLobby from './components/RoomLobby';
import BattleArena from './components/BattleArena';
import SpectatorMode from './components/SpectatorMode';
import ReloadPrompt from './components/ReloadPrompt';
import ThemeToggle from './components/ThemeToggle';

// Layout Component with Persistent Navbar
const Layout = ({ children, currentView, onViewChange }) => {
  const isImmersive = currentView === 'arena' || currentView === 'spectator';

  return (
    <div className="min-h-screen bg-bg-void font-sans text-text-primary selection:bg-accent-neon selection:text-bg-void overflow-x-hidden transition-colors duration-300">
      {/* Background Grid */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />

      {/* Persistent Navbar - Hidden in immersive modes */}
      {!isImmersive && (
        <nav className="fixed top-0 left-0 right-0 z-50 nav-glass h-16 flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onViewChange('landing')}
          >
            <span className="font-mono font-bold text-xl tracking-tighter">
              <span className="text-text-primary">Code</span>
              <span className="text-accent-neon group-hover:animate-pulse">Clash</span>
            </span>
            <span className="text-accent-neon font-mono text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity -ml-1">
              _&gt;
            </span>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {currentView === 'landing' && (
              <button
                onClick={() => onViewChange('lobby')}
                className="hidden md:block btn-neon text-sm py-2 px-4 shadow-[0_0_15px_-3px_rgba(0,221,165,0.3)]"
              >
                Start Battle_
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 ${isImmersive ? '' : 'pt-16'} min-h-screen flex flex-col`}>
        {children}
      </main>

      <ReloadPrompt />
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [roomData, setRoomData] = useState(null);

  // Navigation Handlers
  const navigate = (view) => {
    setCurrentView(view);
    if (view === 'landing') setRoomData(null);
  };

  const handleJoinRoom = (data) => {
    setRoomData(data);
    setCurrentView('arena');
  };

  const handleSpectate = (roomId) => {
    setRoomData({ roomId, role: 'spectator' });
    setCurrentView('spectator');
  };

  return (
    <Layout currentView={currentView} onViewChange={navigate}>
      {currentView === 'landing' && (
        <LandingPage onEnterArena={() => navigate('lobby')} />
      )}

      {currentView === 'lobby' && (
        <RoomLobby
          onJoinRoom={handleJoinRoom}
          onSpectate={handleSpectate}
        />
      )}

      {currentView === 'arena' && (
        <BattleArena
          roomData={roomData}
          onLeave={() => navigate('lobby')} // FIX: Changed onExit to onLeave to match prop name
        />
      )}

      {currentView === 'spectator' && (
        <SpectatorMode
          roomId={roomData?.roomId}
          onExit={() => navigate('lobby')}
        />
      )}
    </Layout>
  );
}

export default App;
