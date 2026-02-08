import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Copy,
    Check,
    ArrowRight,
    Eye,
    Swords,
    Shield
} from 'lucide-react';

import Logo from './Logo';
import socketService from '../services/socketService';
import NotificationSystem, { useNotifications } from './NotificationSystem';

const RoomLobby = ({ onJoinRoom, onSpectate }) => {
    const notify = useNotifications();
    const [view, setView] = useState('main'); // 'main', 'create', 'join'
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [createdRoomId, setCreatedRoomId] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeRooms, setActiveRooms] = useState([]);
    const [spectateRoomId, setSpectateRoomId] = useState('');
    const [createdRoomData, setCreatedRoomData] = useState(null); // Store full room data

    // Custom Challenge State
    const [customChallenge, setCustomChallenge] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        timeLimit: 300, // seconds
        examples: [{ input: '', output: '', explanation: '' }],
        constraints: ['']
    });

    // Fetch active rooms from backend
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/rooms`);
                const data = await response.json();

                // Transform backend data to match UI format
                const formattedRooms = data.rooms
                    .filter(room => room.gameState.status === 'waiting' || room.gameState.status === 'active')
                    .map(room => ({
                        id: room.roomId,
                        host: room.host.name,
                        players: room.playerCount,
                        spectators: room.spectatorCount,
                        difficulty: room.gameState.status === 'active' ? 'In Progress' : 'Waiting'
                    }));

                setActiveRooms(formattedRooms);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
                setActiveRooms([]);
            }
        };

        fetchRooms();
        const interval = setInterval(fetchRooms, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // Generate random room ID
    const generateRoomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };


    const handleCreateRoom = async () => {
        if (!playerName.trim() || !customChallenge.title.trim() || !customChallenge.description.trim()) return;

        try {
            // Create room with custom challenge - socket connection handled automatically
            console.log('Creating room with custom challenge:', customChallenge);
            const response = await socketService.createRoom(playerName, customChallenge);
            console.log('Room created response:', response);

            // Store the actual backend room ID AND full room data
            setCreatedRoomId(response.roomId);
            setCreatedRoomData(response.room); // Store challenge and game state
            setView('created');
        } catch (error) {
            console.error('Failed to create room:', error);
            notify.error(
                error.message || 'Unable to create room. Please check your connection and try again.',
                'Room Creation Failed'
            );
        }
    };

    const handleJoinRoom = async () => {
        if (!playerName.trim() || !roomId.trim()) return;

        try {
            // Join room via socket - connection handled automatically
            const response = await socketService.joinRoom(roomId.toUpperCase(), playerName);

            // Navigate to arena with room data
            onJoinRoom({
                roomId: roomId.toUpperCase(),
                playerName,
                role: 'opponent', // Joining player is the opponent
                challenge: response.challenge,
                gameState: response.gameState,
                opponent: { name: response.opponentName } // Host is the opponent for joining player
            });
        } catch (error) {
            console.error('Failed to join room:', error);
            notify.error(
                error.message || 'Unable to join room. Please verify the room code and try again.',
                'Failed to Join Room'
            );
        }
    };

    const handleStartBattle = () => {
        // Room is already created, just navigate to arena with full data
        onJoinRoom({
            roomId: createdRoomId,
            playerName,
            role: 'host',
            challenge: createdRoomData?.challenge,
            gameState: createdRoomData?.gameState
        });
    };

    const handleSpectateRoom = async () => {
        if (!spectateRoomId.trim() || spectateRoomId.length !== 6) return;

        try {
            // Spectate room via socket - connection handled automatically
            const response = await socketService.spectateRoom(spectateRoomId.toUpperCase());

            // Navigate to spectator mode
            onSpectate(spectateRoomId.toUpperCase());
        } catch (error) {
            console.error('Failed to spectate room:', error);
            notify.error(
                error.message || 'Unable to join as spectator. Please verify the room code.',
                'Spectate Failed'
            );
        }
    };


    const copyRoomId = () => {
        navigator.clipboard.writeText(createdRoomId);
        setCopied(true);
        notify.success('Room ID copied to clipboard!', 'Copied');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <NotificationSystem
                notifications={notify.notifications}
                onClose={notify.removeNotification}
            />
            <div className="min-h-screen bg-bg-void grid-bg flex items-center justify-center p-6">
                {/* Background Effects */}
                <div className="fixed inset-0 -z-10">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                        }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-neon/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            delay: 1,
                        }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-chaos/10 rounded-full blur-3xl"
                    />
                </div>

                <div className="w-full max-w-6xl">
                    <AnimatePresence mode="wait">
                        {/* Main Menu */}
                        {view === 'main' && (
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Header */}
                                <div className="text-center mb-12 flex flex-col items-center">
                                    <div className="mb-6 scale-150">
                                        <Logo />
                                    </div>
                                    <h1 className="text-6xl font-black text-text-primary mb-4">Battle Lobby</h1>
                                    <p className="text-xl text-text-secondary">Create a room, join a battle, or spectate the pros</p>
                                </div>

                                {/* Main Actions */}
                                <div className="grid md:grid-cols-3 gap-6 mb-12">
                                    {/* Create Room */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setView('create')}
                                        className="group panel-professional p-6 md:p-8 border border-text-primary/10 hover:border-accent-neon/50 transition-all duration-300 text-left relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent-neon/20 flex items-center justify-center mb-6 group-hover:bg-accent-neon/30 transition-colors">
                                                <Plus className="w-6 h-6 md:w-8 md:h-8 text-accent-neon" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3">Create Room</h3>
                                            <p className="text-sm md:text-base text-text-secondary mb-6">Start a new battle and invite opponents</p>
                                            <div className="flex items-center gap-2 text-accent-neon font-mono text-sm">
                                                <span>Get Started</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Join Room */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setView('join')}
                                        className="group panel-professional p-6 md:p-8 border border-text-primary/10 hover:border-accent-chaos/50 transition-all duration-300 text-left relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-accent-chaos/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent-chaos/20 flex items-center justify-center mb-6 group-hover:bg-accent-chaos/30 transition-colors">
                                                <Swords className="w-6 h-6 md:w-8 md:h-8 text-accent-chaos" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3">Join Room</h3>
                                            <p className="text-sm md:text-base text-text-secondary mb-6">Enter a room ID and start battling</p>
                                            <div className="flex items-center gap-2 text-accent-chaos font-mono text-sm">
                                                <span>Enter Code</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Spectate */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setView('spectate')}
                                        className="group panel-professional p-6 md:p-8 border border-text-primary/10 hover:border-blue-500/50 transition-all duration-300 text-left relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                                                <Eye className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3">Spectate</h3>
                                            <p className="text-sm md:text-base text-text-secondary mb-6">Watch live battles and learn from pros</p>
                                            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
                                                <span>Browse Rooms</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Create Room View */}
                        {view === 'create' && (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <button
                                    onClick={() => setView('main')}
                                    className="text-text-secondary hover:text-text-primary mb-8 flex items-center gap-2"
                                >
                                    ← Back to Lobby
                                </button>

                                <div className="panel-professional p-10 border border-text-primary/10 max-h-[80vh] overflow-y-auto">
                                    <h2 className="text-4xl font-black text-text-primary mb-2">Create Custom Challenge</h2>
                                    <p className="text-text-secondary mb-8">Design your own coding problem for the battle</p>

                                    <div className="space-y-6">
                                        {/* Player Name */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors font-mono"
                                            />
                                        </div>

                                        {/* Challenge Title */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Challenge Title
                                            </label>
                                            <input
                                                type="text"
                                                value={customChallenge.title}
                                                onChange={(e) => setCustomChallenge({ ...customChallenge, title: e.target.value })}
                                                placeholder="e.g., Two Sum, Reverse String"
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Problem Description */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Problem Description
                                            </label>
                                            <textarea
                                                value={customChallenge.description}
                                                onChange={(e) => setCustomChallenge({ ...customChallenge, description: e.target.value })}
                                                placeholder="Describe the problem clearly. What should the function do?"
                                                rows={6}
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Difficulty & Time Limit Row */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Difficulty */}
                                            <div>
                                                <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                    Difficulty
                                                </label>
                                                <select
                                                    value={customChallenge.difficulty}
                                                    onChange={(e) => setCustomChallenge({ ...customChallenge, difficulty: e.target.value })}
                                                    className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary focus:border-accent-neon focus:outline-none transition-colors cursor-pointer"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>

                                            {/* Time Limit */}
                                            <div>
                                                <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                    Time Limit (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    min="1"
                                                    max="60"
                                                    value={customChallenge.timeLimit / 60}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Allow empty input while typing
                                                        if (value === '') {
                                                            setCustomChallenge({ ...customChallenge, timeLimit: 300 });
                                                            return;
                                                        }
                                                        const minutes = Math.max(1, Math.min(60, parseInt(value) || 5));
                                                        setCustomChallenge({ ...customChallenge, timeLimit: minutes * 60 });
                                                    }}
                                                    onBlur={(e) => {
                                                        // Ensure valid value on blur
                                                        const value = e.target.value;
                                                        if (value === '' || parseInt(value) < 1) {
                                                            setCustomChallenge({ ...customChallenge, timeLimit: 300 });
                                                        }
                                                    }}
                                                    className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary focus:border-accent-neon focus:outline-none transition-colors text-center text-lg font-mono"
                                                />
                                            </div>
                                        </div>

                                        {/* Examples */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Examples
                                            </label>
                                            {customChallenge.examples.map((example, index) => (
                                                <div key={index} className="mb-4 p-4 bg-text-primary/5 rounded-xl border border-text-primary/10">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-bold text-accent-neon">Example {index + 1}</span>
                                                        {customChallenge.examples.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const newExamples = customChallenge.examples.filter((_, i) => i !== index);
                                                                    setCustomChallenge({ ...customChallenge, examples: newExamples });
                                                                }}
                                                                className="text-red-400 hover:text-red-300 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            value={example.input}
                                                            onChange={(e) => {
                                                                const newExamples = [...customChallenge.examples];
                                                                newExamples[index].input = e.target.value;
                                                                setCustomChallenge({ ...customChallenge, examples: newExamples });
                                                            }}
                                                            placeholder="Input: [2, 7, 11, 15], 9"
                                                            className="w-full px-4 py-2 bg-text-primary/5 border border-text-primary/10 rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors text-sm font-mono"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={example.output}
                                                            onChange={(e) => {
                                                                const newExamples = [...customChallenge.examples];
                                                                newExamples[index].output = e.target.value;
                                                                setCustomChallenge({ ...customChallenge, examples: newExamples });
                                                            }}
                                                            placeholder="Output: [0, 1]"
                                                            className="w-full px-4 py-2 bg-text-primary/5 border border-text-primary/10 rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors text-sm font-mono"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={example.explanation}
                                                            onChange={(e) => {
                                                                const newExamples = [...customChallenge.examples];
                                                                newExamples[index].explanation = e.target.value;
                                                                setCustomChallenge({ ...customChallenge, examples: newExamples });
                                                            }}
                                                            placeholder="Explanation (optional)"
                                                            className="w-full px-4 py-2 bg-text-primary/5 border border-text-primary/10 rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setCustomChallenge({
                                                    ...customChallenge,
                                                    examples: [...customChallenge.examples, { input: '', output: '', explanation: '' }]
                                                })}
                                                className="w-full px-4 py-3 bg-text-primary/5 hover:bg-text-primary/10 border border-text-primary/10 rounded-xl text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                                            >
                                                + Add Example
                                            </button>
                                        </div>

                                        {/* Constraints */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Constraints
                                            </label>
                                            {customChallenge.constraints.map((constraint, index) => (
                                                <div key={index} className="mb-3 flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={constraint}
                                                        onChange={(e) => {
                                                            const newConstraints = [...customChallenge.constraints];
                                                            newConstraints[index] = e.target.value;
                                                            setCustomChallenge({ ...customChallenge, constraints: newConstraints });
                                                        }}
                                                        placeholder="e.g., 1 <= nums.length <= 10^4"
                                                        className="flex-1 px-4 py-3 bg-text-primary/5 border border-text-primary/10 rounded-lg text-text-primary placeholder-text-secondary focus:border-accent-neon focus:outline-none transition-colors text-sm font-mono"
                                                    />
                                                    {customChallenge.constraints.length > 1 && (
                                                        <button
                                                            onClick={() => {
                                                                const newConstraints = customChallenge.constraints.filter((_, i) => i !== index);
                                                                setCustomChallenge({ ...customChallenge, constraints: newConstraints });
                                                            }}
                                                            className="text-red-400 hover:text-red-300 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setCustomChallenge({
                                                    ...customChallenge,
                                                    constraints: [...customChallenge.constraints, '']
                                                })}
                                                className="w-full px-4 py-3 bg-text-primary/5 hover:bg-text-primary/10 border border-text-primary/10 rounded-xl text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                                            >
                                                + Add Constraint
                                            </button>
                                        </div>

                                        {/* Create Button */}
                                        <button
                                            onClick={handleCreateRoom}
                                            disabled={!playerName.trim() || !customChallenge.title.trim() || !customChallenge.description.trim()}
                                            className="w-full px-8 py-5 bg-accent-neon text-bg-void font-bold text-lg rounded-xl hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create Room with Custom Challenge
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Room Created View */}
                        {view === 'created' && (
                            <motion.div
                                key="created"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="panel-professional p-10 border border-accent-neon/30 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/10 to-transparent" />

                                    <div className="relative z-10 text-center">
                                        <div className="w-20 h-20 rounded-full bg-accent-neon/20 flex items-center justify-center mx-auto mb-6">
                                            <Check className="w-10 h-10 text-accent-neon" />
                                        </div>

                                        <h2 className="text-4xl font-black text-text-primary mb-4">Room Created!</h2>
                                        <p className="text-text-secondary mb-8">Share this code with your opponent</p>

                                        <div className="panel-professional p-8 mb-8 border border-text-primary/10">
                                            <div className="text-sm text-text-secondary mb-3 uppercase tracking-wider">Room ID</div>
                                            <div className="text-6xl font-black text-accent-neon font-mono mb-6">
                                                {createdRoomId}
                                            </div>

                                            <button
                                                onClick={copyRoomId}
                                                className="px-6 py-3 bg-text-primary/10 hover:bg-text-primary/20 text-text-primary rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy Room ID
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setView('main')}
                                                className="flex-1 px-6 py-4 panel-professional border border-text-primary/10 text-text-primary rounded-xl hover:border-text-primary/30 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleStartBattle}
                                                className="flex-1 px-6 py-4 bg-accent-neon text-bg-void font-bold rounded-xl hover:shadow-neon transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-5 h-5" />
                                                Enter Arena
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Join Room View */}
                        {view === 'join' && (
                            <motion.div
                                key="join"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <button
                                    onClick={() => setView('main')}
                                    className="text-text-secondary hover:text-text-primary mb-8 flex items-center gap-2"
                                >
                                    ← Back to Lobby
                                </button>

                                <div className="panel-professional p-10 border border-text-primary/10">
                                    <h2 className="text-4xl font-black text-text-primary mb-8">Join Battle Room</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-accent-chaos focus:outline-none transition-colors font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Room ID
                                            </label>
                                            <input
                                                type="text"
                                                value={roomId}
                                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                                placeholder="Enter 6-digit room code"
                                                maxLength={6}
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-accent-chaos focus:outline-none transition-colors font-mono text-2xl tracking-widest text-center"
                                            />
                                        </div>

                                        <button
                                            onClick={handleJoinRoom}
                                            disabled={!playerName.trim() || !roomId.trim() || roomId.length !== 6}
                                            className="w-full px-8 py-5 bg-accent-chaos text-white font-bold text-lg rounded-xl hover:shadow-chaos transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            <Swords className="w-5 h-5" />
                                            Join Battle
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Spectate Room View */}
                        {view === 'spectate' && (
                            <motion.div
                                key="spectate"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <button
                                    onClick={() => setView('main')}
                                    className="text-text-secondary hover:text-text-primary mb-8 flex items-center gap-2"
                                >
                                    ← Back to Lobby
                                </button>

                                <div className="panel-professional p-10 border border-text-primary/10">
                                    <h2 className="text-4xl font-black text-text-primary mb-8">Spectate Battle</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                                                Room ID
                                            </label>
                                            <input
                                                type="text"
                                                value={spectateRoomId}
                                                onChange={(e) => setSpectateRoomId(e.target.value.toUpperCase())}
                                                placeholder="Enter 6-digit room code"
                                                maxLength={6}
                                                className="w-full px-6 py-4 bg-text-primary/5 border border-text-primary/10 rounded-xl text-text-primary placeholder-text-secondary focus:border-blue-500 focus:outline-none transition-colors font-mono text-2xl tracking-widest text-center"
                                            />
                                            <p className="text-sm text-text-secondary mt-2">
                                                Enter the room code to watch the battle live
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleSpectateRoom}
                                            disabled={!spectateRoomId.trim() || spectateRoomId.length !== 6}
                                            className="w-full px-8 py-5 bg-blue-500 text-text-primary font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Start Spectating
                                        </button>

                                        {/* Optional: Show active rooms as quick options */}
                                        {activeRooms.length > 0 && (
                                            <div className="pt-6 border-t border-text-primary/10">
                                                <p className="text-sm text-text-secondary mb-4">Or choose from active battles:</p>
                                                <div className="space-y-2">
                                                    {activeRooms.slice(0, 3).map((room) => (
                                                        <button
                                                            key={room.id}
                                                            onClick={async () => {
                                                                setSpectateRoomId(room.id);
                                                                // Directly spectate with room.id
                                                                try {
                                                                    const response = await socketService.spectateRoom(room.id);
                                                                    onSpectate(room.id);
                                                                } catch (error) {
                                                                    console.error('Failed to spectate room:', error);
                                                                    notify.error(
                                                                        error.message || 'Unable to join as spectator.',
                                                                        'Spectate Failed'
                                                                    );
                                                                }
                                                            }}
                                                            className="w-full p-4 bg-text-primary/5 hover:bg-text-primary/10 rounded-xl transition-colors text-left flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <div className="font-mono font-bold text-text-primary">{room.id}</div>
                                                                <div className="text-sm text-text-secondary">Host: {room.host}</div>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                                                <span>{room.players}/2</span>
                                                                <Eye className="w-4 h-4" />
                                                                <span>{room.spectators}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default RoomLobby;

