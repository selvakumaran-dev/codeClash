import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
    Eye,
    Users,
    Timer,
    Trophy,
    Zap,
    ArrowLeft,
    Volume2,
    VolumeX,
    Maximize2
} from 'lucide-react';
import socketService from '../services/socketService';

const SpectatorMode = ({ roomId, onExit }) => {
    // Real data from socket
    const [hostCode, setHostCode] = useState('// Waiting for host...\\n');
    const [opponentCode, setOpponentCode] = useState('// Waiting for opponent...\\n');
    const [hostName, setHostName] = useState('Host');
    const [opponentName, setOpponentName] = useState('Opponent');
    const [timeLeft, setTimeLeft] = useState(300);
    const [spectatorCount, setSpectatorCount] = useState(1);
    const [challenge, setChallenge] = useState(null);
    const [gameState, setGameState] = useState(null);

    // UI state
    const [isMuted, setIsMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(null); // null, 'host', 'opponent'

    // Connect to room and listen for updates
    useEffect(() => {
        const connectToRoom = async () => {
            try {
                await socketService.connect();

                // Spectate the room
                await socketService.spectateRoom(roomId);

                console.log('[SPECTATOR] Connected to room:', roomId);
            } catch (error) {
                console.error('[SPECTATOR] Failed to connect:', error);
            }
        };

        connectToRoom();

        // Socket event listeners
        const handleSpectateStarted = (data) => {
            console.log('[SPECTATOR] Spectate started:', data);
            setHostCode(data.hostCode || '// Host code...\\n');
            setOpponentCode(data.opponentCode || '// Opponent code...\\n');
            setHostName(data.hostName || 'Host');
            setOpponentName(data.opponentName || 'Waiting...');
            setChallenge(data.challenge);
            setGameState(data.gameState);
            setTimeLeft(data.gameState?.timeLeft || 300);
            setSpectatorCount(data.spectatorCount || 1);
        };

        const handleCodeUpdate = (data) => {
            console.log('[SPECTATOR] Code update:', data.role);
            if (data.role === 'host') {
                setHostCode(data.code);
            } else if (data.role === 'opponent') {
                setOpponentCode(data.code);
            }
        };

        const handleTimeUpdate = (data) => {
            setTimeLeft(data.timeLeft);
        };

        const handleSpectatorCountUpdate = (data) => {
            setSpectatorCount(data.count);
        };

        // Register listeners
        if (socketService.socket) {
            socketService.socket.on('spectate-started', handleSpectateStarted);
            socketService.socket.on('opponent-code-update', handleCodeUpdate);
            socketService.socket.on('time-update', handleTimeUpdate);
            socketService.socket.on('spectator-count-updated', handleSpectatorCountUpdate);
        }

        // Cleanup
        return () => {
            if (socketService.socket) {
                socketService.socket.off('spectate-started', handleSpectateStarted);
                socketService.socket.off('opponent-code-update', handleCodeUpdate);
                socketService.socket.off('time-update', handleTimeUpdate);
                socketService.socket.off('spectator-count-updated', handleSpectatorCountUpdate);
            }
        };
    }, [roomId]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const PlayerCard = ({ name, code, side, color }) => {
        const lineCount = code ? code.split('\n').length : 0;

        return (
            <div className="flex flex-col h-full">
                {/* Player Header */}
                <div className={`glass-panel border-b border-text-primary/10 p-4 ${side === 'left' ? 'border-r' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{side === 'left' ? '👨‍💻' : '👩‍💻'}</div>
                            <div>
                                <div className="font-mono font-bold text-text-primary text-lg">{name}</div>
                                <div className={`text-sm font-mono ${color === 'accent-neon' ? 'text-accent-neon' : 'text-accent-chaos'
                                    }`}>
                                    {side === 'left' ? 'Host' : 'Opponent'}
                                </div>
                            </div>
                        </div>

                        {fullscreen !== side && (
                            <button
                                onClick={() => setFullscreen(side)}
                                className="p-2 hover:bg-text-primary/10 rounded-lg transition-colors"
                            >
                                <Maximize2 className="w-4 h-4 text-text-secondary" />
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-panel rounded-lg p-2 border border-text-primary/5">
                            <div className="text-xs text-text-secondary uppercase">Lines</div>
                            <div className="text-lg font-bold text-text-primary font-mono">{lineCount}</div>
                        </div>
                        <div className="glass-panel rounded-lg p-2 border border-text-primary/5">
                            <div className="text-xs text-text-secondary uppercase">Status</div>
                            <div className="text-lg font-bold text-accent-neon font-mono">LIVE</div>
                        </div>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        options={{
                            fontSize: fullscreen === side ? 16 : 14,
                            fontFamily: 'JetBrains Mono, monospace',
                            minimap: { enabled: fullscreen === side },
                            readOnly: true,
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            renderLineHighlight: 'none',
                            scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto',
                            },
                        }}
                    />

                    {/* Live Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 glass-panel px-3 py-2 rounded-lg border border-text-primary/10">
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-2 h-2 rounded-full ${color === 'accent-neon' ? 'bg-accent-neon' : 'bg-accent-chaos'
                                }`}
                        />
                        <span className="text-xs font-mono text-text-secondary">LIVE</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-screen bg-bg-void grid-bg overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="h-16 md:h-20 glass-panel border-b border-text-primary/10 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
                {/* Left: Back Button */}
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 p-2 md:px-4 md:py-2 hover:bg-text-primary/10 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-mono hidden md:inline">Exit</span>
                </button>

                {/* Center: Room Info */}
                <div className="flex items-center gap-2 md:gap-6">
                    <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-2 rounded-lg border border-text-primary/10">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <span className="font-mono text-text-primary font-bold">SPECTATOR MODE</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Timer className={`w-5 h-5 md:w-6 md:h-6 ${timeLeft < 60 ? 'text-red-500' : 'text-accent-neon'}`} />
                        <span
                            className={`font-mono text-2xl md:text-3xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-accent-neon'
                                }`}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div className="glass-panel px-3 py-1 md:px-4 md:py-2 rounded-lg border border-text-primary/10 flex items-center gap-2">
                        <span className="font-mono text-xs md:text-sm text-text-secondary hidden md:inline">Room: </span>
                        <span className="font-mono text-xs md:text-sm text-text-primary font-bold">{roomId}</span>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        <Users className="w-5 h-5 text-text-secondary" />
                        <span className="font-mono text-text-secondary">{spectatorCount}</span>
                    </div>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 md:p-3 hover:bg-text-primary/10 rounded-lg transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5 text-text-secondary" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-text-primary" />
                        )}
                    </button>

                    {fullscreen && (
                        <button
                            onClick={() => setFullscreen(null)}
                            className="hidden md:block px-4 py-2 bg-text-primary/10 hover:bg-text-primary/20 rounded-lg transition-colors text-text-primary font-mono text-sm"
                        >
                            Exit Fullscreen
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b border-text-primary/10 bg-bg-panel">
                <button
                    onClick={() => setFullscreen('left')}
                    className={`flex-1 py-3 text-sm font-bold font-mono transition-colors border-b-2 ${fullscreen !== 'right' ? 'text-accent-neon border-accent-neon bg-accent-neon/5' : 'text-text-secondary border-transparent'
                        }`}
                >
                    HOST ({hostName})
                </button>
                <button
                    onClick={() => setFullscreen('right')}
                    className={`flex-1 py-3 text-sm font-bold font-mono transition-colors border-b-2 ${fullscreen === 'right' ? 'text-accent-chaos border-accent-chaos bg-accent-chaos/5' : 'text-text-secondary border-transparent'
                        }`}
                >
                    OPPONENT ({opponentName})
                </button>
            </div>

            {/* Main View */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop Split View */}
                <div className="hidden md:flex w-full h-full">
                    {fullscreen === null ? (
                        <>
                            <div className="w-1/2 border-r border-text-primary/10">
                                <PlayerCard name={hostName} code={hostCode} side="left" color="accent-neon" />
                            </div>
                            <div className="w-1/2">
                                <PlayerCard name={opponentName} code={opponentCode} side="right" color="accent-chaos" />
                            </div>
                        </>
                    ) : fullscreen === 'left' ? (
                        <div className="w-full">
                            <PlayerCard name={hostName} code={hostCode} side="left" color="accent-neon" />
                        </div>
                    ) : (
                        <div className="w-full">
                            <PlayerCard name={opponentName} code={opponentCode} side="right" color="accent-chaos" />
                        </div>
                    )}
                </div>

                {/* Mobile View (Uses fullscreen state to toggle) */}
                <div className="md:hidden w-full h-full">
                    {fullscreen === 'right' ? (
                        <PlayerCard name={opponentName} code={opponentCode} side="right" color="accent-chaos" />
                    ) : (
                        <PlayerCard name={hostName} code={hostCode} side="left" color="accent-neon" />
                    )}
                </div>
            </div>

            {/* Bottom Bar - Live Stats */}
            <div className="h-16 glass-panel border-t border-text-primary/10 flex items-center justify-center gap-8 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent-neon" />
                    <span className="text-sm text-text-secondary">Watching: </span>
                    <span className="text-sm text-accent-neon font-mono font-bold">{hostName} vs {opponentName}</span>
                </div>

                <div className="w-px h-8 bg-text-primary/10" />

                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="text-sm text-red-400 font-mono">LIVE</span>
                </div>
            </div>
        </div>
    );
};

export default SpectatorMode;
