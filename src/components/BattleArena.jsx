import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
    Play,
    Zap,
    Eye,
    Skull,
    Clock,
    Users,
    Code2,
    CheckCircle2,
    XCircle,
    Lock,
    Unlock,
    ChevronDown,
    Terminal,
    AlertCircle,
    FileText,
    Swords,
    Menu
} from 'lucide-react';
import socketService from '../services/socketService';
import NotificationSystem, { useNotifications } from './NotificationSystem';

// Sabotage durations (must match sabotages array)
const SABOTAGE_DURATIONS = {
    fog: 5000,
    earthquake: 3000,
    glitch: 4000,
    backspace: 8000,
    invisible: 6000,
    slowmo: 7000,
    flip: 5000,
    scroll: 6000,
    caps: 10000
};

const BattleArena = ({ roomData, playerRole, onLeave }) => {
    const notify = useNotifications();
    // Game State
    const [timeLeft, setTimeLeft] = useState(roomData?.gameState?.timeLeft || 300);
    const [mana, setMana] = useState(100);
    const [opponentName, setOpponentName] = useState(roomData?.opponent?.name || 'Waiting...');
    const [spectatorCount, setSpectatorCount] = useState(roomData?.spectatorCount || 0);

    // Challenge State
    const [challenge, setChallenge] = useState(roomData?.challenge || null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [opponentCode, setOpponentCode] = useState('');

    // Test Results State
    const [testResults, setTestResults] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [powerUpsUnlocked, setPowerUpsUnlocked] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Sabotage State
    const [activeSabotages, setActiveSabotages] = useState({
        fog: false,
        earthquake: false,
        glitch: false
    });

    // Mobile Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // UI State
    const [showProblem, setShowProblem] = useState(true);
    const [activeTab, setActiveTab] = useState('editor'); // 'problem', 'editor', 'battle'
    const editorRef = useRef(null);

    // FIX Bug #16: Debounce code updates
    const codeUpdateTimeout = useRef(null);

    const languages = [
        { id: 'javascript', name: 'JS', icon: '🟨' },
        { id: 'python', name: 'Py', icon: '🐍' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'cpp', name: 'C++', icon: '⚡' },
        { id: 'c', name: 'C', icon: '🔧' },
        { id: 'csharp', name: 'C#', icon: '💎' },
        { id: 'go', name: 'Go', icon: '🔵' },
        { id: 'rust', name: 'Rust', icon: '🦀' }
    ];

    const sabotages = [
        {
            id: 'fog',
            name: 'Foggy Screen',
            icon: Eye,
            manaCost: 30,
            duration: 5000,
            cooldown: 15000,
            desc: 'Blur opponent\'s view',
        },
        {
            id: 'earthquake',
            name: 'Screen Shake',
            icon: Skull,
            manaCost: 25,
            duration: 3000,
            cooldown: 12000,
            desc: 'Shake their editor',
        },
        {
            id: 'glitch',
            name: 'Glitch Effect',
            icon: Zap,
            manaCost: 35,
            duration: 4000,
            cooldown: 20000,
            desc: 'Distort their screen',
        },
        {
            id: 'backspace',
            name: 'Backspace Lock',
            icon: Lock,
            manaCost: 40,
            duration: 8000,
            cooldown: 25000,
            desc: 'Disable backspace key',
        },
        {
            id: 'invisible',
            name: 'Invisible Cursor',
            icon: Eye,
            manaCost: 30,
            duration: 6000,
            cooldown: 18000,
            desc: 'Hide their cursor',
        },
        {
            id: 'slowmo',
            name: 'Slow Motion',
            icon: Clock,
            manaCost: 35,
            duration: 7000,
            cooldown: 20000,
            desc: 'Delay their typing',
        },
        {
            id: 'flip',
            name: 'Code Flip',
            icon: Code2,
            manaCost: 45,
            duration: 5000,
            cooldown: 30000,
            desc: 'Rotate editor 180°',
        },
        {
            id: 'scroll',
            name: 'Random Scroll',
            icon: AlertCircle,
            manaCost: 20,
            duration: 6000,
            cooldown: 15000,
            desc: 'Auto-scroll randomly',
        },
        {
            id: 'caps',
            name: 'Caps Lock',
            icon: Lock,
            manaCost: 25,
            duration: 10000,
            cooldown: 20000,
            desc: 'Force UPPERCASE typing',
        },
    ];

    // Initialize code from challenge
    useEffect(() => {
        if (challenge?.starterCode && selectedLanguage) {
            const starterCode = challenge.starterCode[selectedLanguage] || `// Write your ${selectedLanguage} code here\n`;
            // Only set if code is empty or is a generic placeholder
            if (!code || code.startsWith('// Write your') || code === '// Your code here') {
                setCode(starterCode);
            }
        }
    }, [challenge, selectedLanguage]);

    // Initialize socket connection on mount
    useEffect(() => {
        if (!socketService.socket || !socketService.connected) {
            socketService.connect();
        }

        return () => {
            // Don't disconnect on unmount - other components might need it
        };
    }, []);

    // FIX Bug #9: Listen for challenge data on join
    useEffect(() => {
        if (!socketService.socket) return;

        // Listen for room-joined event (for opponents)
        const handleRoomJoined = (data) => {
            if (data.challenge) {
                setChallenge(data.challenge);
                setCode(data.challenge.starterCode[selectedLanguage] || '');
            }
            // Set opponent name (which is the host for the joining player)
            if (data.opponentName) {
                setOpponentName(data.opponentName);
            }
        };

        // Listen for opponent-joined event (for host)
        const handleOpponentJoined = (data) => {
            setOpponentName(data.opponent.name);
        };

        socketService.socket.on('room-joined', handleRoomJoined);
        socketService.socket.on('opponent-joined', handleOpponentJoined);

        return () => {
            if (socketService.socket) {
                socketService.socket.off('room-joined', handleRoomJoined);
                socketService.socket.off('opponent-joined', handleOpponentJoined);
            }
        };
    }, [selectedLanguage]);

    // FIX Bug #15: Proper socket listener cleanup
    useEffect(() => {
        if (!socketService.socket) return;

        const handleTimeUpdate = (data) => {
            setTimeLeft(data.timeLeft);
        };

        const handleOpponentCode = (data) => {
            setOpponentCode(data.code);
        };

        const handleSabotage = (data) => {
            setActiveSabotages(prev => ({ ...prev, [data.sabotageId]: true }));
            setTimeout(() => {
                setActiveSabotages(prev => ({ ...prev, [data.sabotageId]: false }));
            }, SABOTAGE_DURATIONS[data.sabotageId] || 3000);
        };

        const handleLanguageChanged = (data) => {
            setCode(data.code);
            setSelectedLanguage(data.language);
        };

        const handleTestResults = (data) => {
            setIsSubmitting(false);
            setTestResults(data.results);
            setPowerUpsUnlocked(data.powerUpsUnlocked || false);
            setShowResults(true);
            // On mobile, switch to comparison/results view if needed, but staying on editor is usually better
        };

        const handlePowerUpsUnlocked = (data) => {
            setPowerUpsUnlocked(true);
        };

        const handleOpponentSubmitted = (data) => {
            if (data.allPassed) {
                notify.game(
                    `${opponentName} has unlocked power-ups! The battle intensifies!`,
                    '⚡ Opponent Power-Up'
                );
            }
        };

        const handleGameOver = (data) => {
            console.log('[GAME OVER]', data);

            // Determine if current player won
            const didWin = data.winner === playerRole;
            const isDraw = data.winner === 'draw';

            let title = '🏆 Game Over!';
            let message = data.winReason || 'Time expired';

            if (isDraw) {
                title = '🤝 Draw!';
                notify.game(message, title);
            } else if (didWin) {
                title = '🎉 Victory!';
                notify.game(`You won! ${message}`, title);
            } else {
                title = '😔 Defeat';
                notify.error(`You lost. ${message}`, title);
            }

            // Show final scores
            if (data.finalScores) {
                const { host, opponent } = data.finalScores;
                console.log(`Final Scores - ${host.name}: ${host.passedTests}/${host.totalTests}, ${opponent.name}: ${opponent.passedTests}/${opponent.totalTests}`);
            }

            // Auto-exit to lobby after 5 seconds
            setTimeout(() => {
                console.log('[AUTO-EXIT] Returning to lobby...');
                onLeave();
            }, 5000);
        };

        // FIX Bug #19: Listen for spectator count updates
        const handleSpectatorCountUpdated = (data) => {
            setSpectatorCount(data.count);
        };

        socketService.socket.on('time-update', handleTimeUpdate);
        socketService.socket.on('opponent-code-update', handleOpponentCode);
        socketService.socket.on('sabotage-received', handleSabotage);
        socketService.socket.on('language-changed', handleLanguageChanged);
        socketService.socket.on('test-results', handleTestResults);
        socketService.socket.on('power-ups-unlocked', handlePowerUpsUnlocked);
        socketService.socket.on('opponent-submitted', handleOpponentSubmitted);
        socketService.socket.on('game-over', handleGameOver);
        socketService.socket.on('spectator-count-updated', handleSpectatorCountUpdated);

        return () => {
            // FIX Bug #15: Remove specific listeners, not all
            if (socketService.socket) {
                socketService.socket.off('time-update', handleTimeUpdate);
                socketService.socket.off('opponent-code-update', handleOpponentCode);
                socketService.socket.off('sabotage-received', handleSabotage);
                socketService.socket.off('language-changed', handleLanguageChanged);
                socketService.socket.off('test-results', handleTestResults);
                socketService.socket.off('power-ups-unlocked', handlePowerUpsUnlocked);
                socketService.socket.off('opponent-submitted', handleOpponentSubmitted);
                socketService.socket.off('game-over', handleGameOver);
                socketService.socket.off('spectator-count-updated', handleSpectatorCountUpdated);
            }
        };
    }, [opponentName]);

    // FIX Bug #16: Debounce code updates
    const handleCodeChange = useCallback((value) => {
        // Apply caps lock sabotage transformation
        let processedValue = value;
        if (activeSabotages.caps && value) {
            // Find the difference between old and new code
            const oldCode = code;
            if (value.length > oldCode.length) {
                // New characters were added
                const newChars = value.substring(oldCode.length);
                const upperNewChars = newChars.toUpperCase();
                processedValue = oldCode + upperNewChars;
            } else {
                processedValue = value;
            }
        }

        // Apply slow motion delay
        if (activeSabotages.slowmo) {
            setTimeout(() => {
                setCode(processedValue);
            }, 200);
        } else {
            setCode(processedValue);
        }

        // Clear previous timeout
        if (codeUpdateTimeout.current) {
            clearTimeout(codeUpdateTimeout.current);
        }

        // Debounce socket update (300ms after user stops typing)
        codeUpdateTimeout.current = setTimeout(() => {
            socketService.updateCode(processedValue);
        }, 300);
    }, [activeSabotages.caps, activeSabotages.slowmo, code]);

    // Language change handler
    const handleLanguageChange = (language) => {
        console.log('Changing language to:', language);

        // Update local state immediately
        setSelectedLanguage(language);

        // Get starter code for new language
        const newStarterCode = challenge?.starterCode?.[language] || `// Write your ${language} code here\n`;
        setCode(newStarterCode);

        // Emit to socket if connected
        if (socketService.socket?.connected) {
            socketService.socket.emit('change-language', {
                language,
                code: newStarterCode
            });
        }
    };

    // FIX Bug #11: Clear old results on new submission
    const handleSubmitCode = () => {
        setIsSubmitting(true);
        setShowResults(false);  // Close old results
        setTestResults(null);    // Clear old data
        socketService.socket.emit('submit-code', {
            code,
            language: selectedLanguage
        });
    };

    const handleSabotage = (sabotageId, manaCost) => {
        if (!powerUpsUnlocked) {
            notify.locked(
                'Complete all test cases to unlock power-ups and sabotage your opponent!',
                '🔒 Power-Ups Locked'
            );
            return;
        }
        if (mana >= manaCost) {
            socketService.activateSabotage(sabotageId, manaCost);
            setMana(prev => prev - manaCost);
        } else {
            notify.warning(
                `Not enough mana! You need ${manaCost} MP but only have ${mana} MP.`,
                'Insufficient Mana'
            );
        }
    };

    // FIX Bug #24: Prevent negative time
    const formatTime = (seconds) => {
        const clampedSeconds = Math.max(0, seconds);
        const mins = Math.floor(clampedSeconds / 60);
        const secs = clampedSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <NotificationSystem
                notifications={notify.notifications}
                onClose={notify.removeNotification}
            />
            <div className="h-screen bg-bg-void flex flex-col overflow-hidden">
                {/* Top Status Bar - Responsive */}
                <div className="bg-bg-panel border-b border-border-subtle px-4 py-2 md:px-6 md:py-3 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Timer */}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent-neon" />
                            <span className="font-mono text-lg md:text-xl font-bold text-text-primary">
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        {/* Challenge Info - Hidden on very small screens */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-accent-neon/10 border border-accent-neon/30">
                                <span className="text-xs font-bold text-accent-neon uppercase">
                                    {challenge?.difficulty || 'Easy'}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-text-primary truncate max-w-[200px]">
                                {challenge?.title || 'Loading...'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* FIX Bug #23: Clamp mana between 0-100 */}
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 md:w-5 md:h-5 text-accent-chaos" />
                            <div className="w-16 md:w-32 h-2 bg-bg-void rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent-chaos to-pink-500 transition-all duration-300"
                                    style={{ width: `${Math.max(0, Math.min(100, mana))}%` }}
                                />
                            </div>
                            <span className="font-mono text-xs md:text-sm font-bold text-text-primary w-8 md:w-12">
                                {Math.max(0, Math.min(100, mana))}%
                            </span>
                        </div>

                        {/* Leave Button */}
                        <button
                            onClick={onLeave}
                            className="px-3 py-1 md:px-4 md:py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-xs md:text-sm font-medium"
                        >
                            Esc
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden relative">

                    {/* 1. Problem Panel */}
                    <AnimatePresence mode='wait'>
                        {/* In Mobile: Show only if activeTab is 'problem'. In Desktop: Show only if showProblem is true */}
                        {((['problem'].includes(activeTab)) || (!isMobile && showProblem)) && (
                            <motion.div
                                key="problem-panel"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className={`${isMobile ? (activeTab === 'problem' ? 'absolute inset-0 z-20' : 'hidden') : 'relative w-[40%] border-r'} border-border-subtle bg-bg-panel overflow-y-auto`}
                            >
                                <div className="p-4 md:p-6 pb-20 md:pb-6">
                                    {/* Desktop Header */}
                                    <div className="hidden md:flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-text-primary">Problem</h3>
                                        <button
                                            onClick={() => setShowProblem(false)}
                                            className="text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            Hide →
                                        </button>
                                    </div>

                                    {/* Mobile Header */}
                                    <div className="md:hidden mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="px-2 py-0.5 rounded-full bg-accent-neon/10 border border-accent-neon/30 inline-block">
                                                <span className="text-xs font-bold text-accent-neon uppercase">
                                                    {challenge?.difficulty || 'Easy'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">{challenge?.title}</h3>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
                                            Description
                                        </h4>
                                        <p className="text-text-primary leading-relaxed whitespace-pre-line text-sm md:text-base">
                                            {challenge?.description}
                                        </p>
                                    </div>

                                    {/* Examples */}
                                    {challenge?.examples && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
                                                Examples
                                            </h4>
                                            {challenge.examples.map((example, i) => (
                                                <div key={i} className="mb-4 p-4 rounded-lg bg-bg-void border border-border-subtle overflow-x-auto">
                                                    <div className="mb-2">
                                                        <span className="text-xs font-bold text-text-secondary">Input:</span>
                                                        <pre className="text-sm text-accent-neon font-mono mt-1">{example.input}</pre>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-xs font-bold text-text-secondary">Output:</span>
                                                        <pre className="text-sm text-accent-neon font-mono mt-1">{example.output}</pre>
                                                    </div>
                                                    {example.explanation && (
                                                        <div>
                                                            <span className="text-xs font-bold text-text-secondary">Explanation:</span>
                                                            <p className="text-sm text-text-primary mt-1">{example.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Constraints */}
                                    {challenge?.constraints && (
                                        <div>
                                            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
                                                Constraints
                                            </h4>
                                            <ul className="space-y-2">
                                                {challenge.constraints.map((constraint, i) => (
                                                    <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                                                        <span className="text-accent-neon mt-1">•</span>
                                                        <span>{constraint}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 2. Code Editor (Always present structurally but maybe hidden on mobile) */}
                    <div className={`flex-1 flex flex-col ${isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'}`}>
                        {/* Editor Toolbar */}
                        <div className="bg-bg-panel border-b border-border-subtle px-4 py-2 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                {!showProblem && (
                                    <button
                                        onClick={() => setShowProblem(true)}
                                        className="hidden md:block text-text-secondary hover:text-text-primary transition-colors text-sm"
                                    >
                                        ← Show Problem
                                    </button>
                                )}

                                {/* Language Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="appearance-none bg-bg-void border border-border-subtle rounded-lg px-3 py-1.5 md:px-4 md:py-2 pr-8 md:pr-10 text-xs md:text-sm text-text-primary font-mono cursor-pointer hover:border-accent-neon/50 transition-colors"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.id} value={lang.id}>
                                                {lang.icon} {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-text-secondary pointer-events-none" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmitCode}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-3 py-1.5 md:px-6 md:py-2 rounded-lg bg-accent-neon text-bg-void font-bold hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-bg-void border-t-transparent rounded-full animate-spin" />
                                        <span className="hidden md:inline">Running...</span>
                                        <span className="md:hidden">Run</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="hidden md:inline">Submit Code</span>
                                        <span className="md:hidden">Run</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Monaco Editor */}
                        <div
                            className={`flex-1 relative transition-all duration-300
                                ${activeSabotages.fog ? 'blur-md' : ''}
                                ${activeSabotages.earthquake ? 'animate-shake' : ''}
                                ${activeSabotages.glitch ? 'hue-rotate-180 saturate-200' : ''}
                                ${activeSabotages.flip ? 'rotate-180' : ''}
                                ${activeSabotages.invisible ? 'cursor-none' : ''}
                                ${activeSabotages.slowmo ? 'opacity-70' : ''}
                            `}
                            style={{
                                animation: activeSabotages.scroll ? 'randomScroll 0.5s infinite' : 'none'
                            }}
                        >
                            <Editor
                                height="100%"
                                language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                                value={code}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                                    lineNumbers: 'on',
                                    renderWhitespace: 'selection',
                                    tabSize: 2,
                                    padding: { top: 10 }
                                }}
                                onMount={(editor) => {
                                    editorRef.current = editor;

                                    // Add keyboard event listener for sabotages
                                    editor.onKeyDown((e) => {
                                        // Backspace Lock sabotage (KeyCode.Backspace = 1)
                                        if (activeSabotages.backspace && (e.keyCode === 1 || e.browserEvent.key === 'Backspace')) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }

                                        // Delete key lock (also prevent delete)
                                        if (activeSabotages.backspace && (e.keyCode === 20 || e.browserEvent.key === 'Delete')) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }
                                    });
                                }}
                            />
                        </div>

                        {/* Test Results Panel */}
                        <AnimatePresence>
                            {showResults && testResults && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: '50%', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="absolute bottom-0 left-0 right-0 z-30 border-t border-border-subtle bg-bg-panel shadow-2xl overflow-hidden flex flex-col"
                                >
                                    <div className="p-4 bg-bg-panel border-b border-border-subtle shrink-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                <Terminal className="w-5 h-5 text-accent-neon" />
                                                Test Results
                                            </h3>
                                            <button
                                                onClick={() => setShowResults(false)}
                                                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto p-4 max-h-[60vh] pb-20 md:pb-4">
                                        {/* Summary */}
                                        <div className="flex items-center gap-4 mb-4 p-4 rounded-lg bg-bg-void border border-border-subtle">
                                            <div className="flex items-center gap-2">
                                                {testResults.allPassed ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-400" />
                                                )}
                                                <span className="text-lg font-bold text-text-primary">
                                                    {testResults.passedTests}/{testResults.totalTests} Passed
                                                </span>
                                            </div>

                                            {testResults.allPassed && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-neon/10 border border-accent-neon/30">
                                                    <Unlock className="w-4 h-4 text-accent-neon" />
                                                    <span className="text-sm font-bold text-accent-neon">Unlocked!</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Individual Test Results */}
                                        <div className="space-y-2">
                                            {testResults.results?.map((result, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded-lg border ${result.passed
                                                        ? 'bg-green-500/5 border-green-500/30'
                                                        : 'bg-red-500/5 border-red-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold text-text-primary">
                                                            Test Case {result.testCase}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {result.passed ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            )}
                                                            <span className="text-xs text-text-secondary">
                                                                {result.time}s
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!result.passed && (
                                                        <div className="text-xs space-y-1">
                                                            <div>
                                                                <span className="text-text-secondary">Expected:</span>
                                                                <pre className="text-green-400 font-mono mt-1 whitespace-pre-wrap break-all">{result.expectedOutput}</pre>
                                                            </div>
                                                            <div>
                                                                <span className="text-text-secondary">Got:</span>
                                                                <pre className="text-red-400 font-mono mt-1 whitespace-pre-wrap break-all">{result.actualOutput}</pre>
                                                            </div>
                                                            {result.error && (
                                                                <div>
                                                                    <span className="text-text-secondary">Error:</span>
                                                                    <pre className="text-red-400 font-mono mt-1 whitespace-pre-wrap break-all">{result.error}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Battle/Sabotage Panel */}
                    <div className={`${isMobile ? (activeTab === 'battle' ? 'absolute inset-0 z-20' : 'hidden') : 'w-72 border-l'} border-border-subtle bg-bg-panel overflow-y-auto`}>
                        <div className="p-4 pb-20 md:pb-4">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    {powerUpsUnlocked ? (
                                        <Unlock className="w-4 h-4 text-accent-neon" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-text-secondary" />
                                    )}
                                    Power-ups
                                </h3>

                                {!powerUpsUnlocked && (
                                    <div className="mb-4 p-3 rounded-lg bg-accent-chaos/5 border border-accent-chaos/30">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-accent-chaos mt-0.5" />
                                            <div className="text-xs text-text-secondary">
                                                <p className="font-bold mb-1">🔒 Power-Ups Locked</p>
                                                <p>Complete <span className="text-accent-neon font-bold">all test cases</span> to unlock!</p>
                                                {!opponentName && (
                                                    <p className="mt-1 text-accent-chaos">⚠️ Waiting for opponent to join...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {sabotages.map((sabotage) => (
                                        <button
                                            key={sabotage.id}
                                            onClick={() => handleSabotage(sabotage.id, sabotage.manaCost)}
                                            disabled={!powerUpsUnlocked || mana < sabotage.manaCost || !opponentName}
                                            className={`w-full p-4 rounded-lg border transition-all text-left group ${powerUpsUnlocked && mana >= sabotage.manaCost && opponentName
                                                ? 'bg-accent-chaos/10 border-accent-chaos/30 hover:bg-accent-chaos/20 hover:border-accent-chaos/50 cursor-pointer'
                                                : 'bg-bg-void border-border-subtle opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <sabotage.icon className="w-5 h-5 text-accent-chaos group-hover:scale-110 transition-transform" />
                                                    <span className="font-bold text-text-primary text-sm">{sabotage.name}</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-accent-chaos bg-accent-chaos/10 px-2 py-0.5 rounded">
                                                    {sabotage.manaCost} MP
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-secondary">{sabotage.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Opponent's Code Preview */}
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Opponent</span>
                                    <span className="text-accent-neon text-xs normal-case">{opponentName}</span>
                                </h3>
                                <div className="bg-bg-void rounded-lg border border-border-subtle p-3 max-h-64 overflow-y-auto">
                                    <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap">
                                        {opponentCode || '// Waiting for opponent...'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden bg-bg-panel border-t border-border-subtle flex items-center justify-around py-2 px-1 pb-safe shrink-0 z-50">
                    <button
                        onClick={() => setActiveTab('problem')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'problem' ? 'text-accent-neon bg-accent-neon/10' : 'text-text-secondary'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Problem</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'editor' ? 'text-accent-neon bg-accent-neon/10' : 'text-text-secondary'
                            }`}
                    >
                        <Code2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Code</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('battle')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'battle' ? 'text-accent-chaos bg-accent-chaos/10' : 'text-text-secondary'
                            }`}
                    >
                        <Swords className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Battle</span>
                    </button>
                </div>

                <style>{`
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
                
                @keyframes randomScroll {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(-10px); }
                    50% { transform: translateY(5px); }
                    75% { transform: translateY(-5px); }
                }
                
                .cursor-none * {
                    cursor: none !important;
                    caret-color: transparent !important;
                }
            `}</style>
            </div>
        </>
    );
};

export default BattleArena;

