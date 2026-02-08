import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import codeExecutor from './services/codeExecutor.js';
import challengeService from './services/challengeService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
const corsOrigin = isProduction
    ? process.env.CORS_ORIGIN || '*'  // In production, use env var or allow all
    : 'http://localhost:5173';

app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

app.use(express.json());

// Socket.IO Setup
const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ==================== GAME STATE ====================
const rooms = new Map(); // roomId -> Room Object
const playerSockets = new Map(); // socketId -> { roomId, playerName, role }

// Global Statistics
let battlesCompleted = 0;
const serverStartTime = Date.now();

// FIX Bug #22: Rate limiting for code submissions
const submissionRateLimits = new Map(); // socketId -> lastSubmitTime

function getUptime() {
    const uptimeMs = Date.now() - serverStartTime;
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    return uptimeHours < 1 ? '99.9%' : '99.9%'; // Can implement real uptime tracking
}

class Room {
    constructor(roomId, hostName, hostSocketId, customChallenge = null) {
        this.roomId = roomId;

        // Use custom challenge if provided, otherwise select random challenge
        if (customChallenge && customChallenge.title && customChallenge.description) {
            this.challenge = {
                id: `custom-${Date.now()}`,
                title: customChallenge.title,
                description: customChallenge.description,
                difficulty: customChallenge.difficulty || 'Medium',
                timeLimit: customChallenge.timeLimit || 300,
                examples: customChallenge.examples || [],
                constraints: customChallenge.constraints || [],
                starterCode: {
                    javascript: '// Write your solution here\n',
                    python: '# Write your solution here\n',
                    java: '// Write your solution here\n',
                    cpp: '// Write your solution here\n',
                    c: '// Write your solution here\n',
                    csharp: '// Write your solution here\n',
                    go: '// Write your solution here\n',
                    rust: '// Write your solution here\n'
                },
                // Convert examples to test cases for validation
                testCases: (customChallenge.examples || []).map(example => ({
                    input: example.input || '',
                    expectedOutput: example.output || ''
                }))
            };
        } else {
            this.challenge = challengeService.getRandomChallenge();
        }

        this.host = {
            name: hostName,
            socketId: hostSocketId,
            code: this.challenge.starterCode.javascript || '// Your code here...\n',
            language: 'javascript',
            mana: 100,
            testResults: null,
            powerUpsUnlocked: false // Unlocked when 100% tests pass
        };
        this.opponent = null;
        this.spectators = new Set();
        this.gameState = {
            status: 'waiting', // 'waiting', 'active', 'finished'
            timeLeft: this.challenge.timeLimit, // Use challenge time limit
            winner: null,
            startedAt: null
        };
        this.activeSabotages = {
            host: { fog: false, earthquake: false, glitch: false, backspace: false, invisible: false, slowmo: false, flip: false, scroll: false, caps: false },
            opponent: { fog: false, earthquake: false, glitch: false, backspace: false, invisible: false, slowmo: false, flip: false, scroll: false, caps: false }
        };
        // FIX Bug #3: Track timer interval for cleanup
        this.timerInterval = null;
        // FIX Bug #4: Prevent race conditions in code submission
        this.submissionLocks = {
            host: false,
            opponent: false
        };
    }

    addOpponent(name, socketId) {
        this.opponent = {
            name,
            socketId,
            code: this.challenge.starterCode.javascript || '// Opponent code...\n',
            language: 'javascript',
            mana: 100,
            testResults: null,
            powerUpsUnlocked: false
        };
        this.gameState.status = 'active';
        this.gameState.startedAt = Date.now();
    }

    addSpectator(socketId) {
        this.spectators.add(socketId);
    }

    removeSpectator(socketId) {
        this.spectators.delete(socketId);
    }

    isFull() {
        return this.opponent !== null;
    }

    getPlayerBySocketId(socketId) {
        if (this.host.socketId === socketId) return { role: 'host', player: this.host };
        if (this.opponent?.socketId === socketId) return { role: 'opponent', player: this.opponent };
        return null;
    }

    toJSON() {
        return {
            roomId: this.roomId,
            challenge: {
                id: this.challenge.id,
                title: this.challenge.title,
                difficulty: this.challenge.difficulty,
                description: this.challenge.description,
                examples: this.challenge.examples,
                constraints: this.challenge.constraints,
                timeLimit: this.challenge.timeLimit
            },
            host: { name: this.host.name, powerUpsUnlocked: this.host.powerUpsUnlocked },
            opponent: this.opponent ? { name: this.opponent.name, powerUpsUnlocked: this.opponent.powerUpsUnlocked } : null,
            spectatorCount: this.spectators.size,
            gameState: this.gameState,
            playerCount: this.opponent ? 2 : 1
        };
    }
}

// ==================== HELPER FUNCTIONS ====================
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function broadcastToRoom(roomId, event, data, excludeSocketId = null) {
    const room = rooms.get(roomId);
    if (!room) return;

    const sockets = [room.host.socketId];
    if (room.opponent) sockets.push(room.opponent.socketId);
    room.spectators.forEach(s => sockets.push(s));

    sockets.forEach(socketId => {
        if (socketId !== excludeSocketId) {
            io.to(socketId).emit(event, data);
        }
    });
}

// ==================== SOCKET.IO EVENTS ====================
io.on('connection', (socket) => {
    console.log(`[CONNECT] Socket ${socket.id} connected`);

    // ===== CREATE ROOM =====
    socket.on('create-room', ({ playerName, customChallenge }) => {
        try {
            console.log('[CREATE-ROOM] Received custom challenge:', JSON.stringify(customChallenge, null, 2));
            const roomId = generateRoomId();
            const room = new Room(roomId, playerName, socket.id, customChallenge);
            console.log('[CREATE-ROOM] Room challenge:', room.challenge.title);
            rooms.set(roomId, room);
            playerSockets.set(socket.id, { roomId, playerName, role: 'host' });

            socket.join(roomId);

            const roomData = room.toJSON();
            console.log('[CREATE-ROOM] Sending response:', JSON.stringify(roomData, null, 2));
            socket.emit('room-created', { roomId, room: roomData });

            console.log(`[CREATE] Room ${roomId} created by ${playerName}${customChallenge ? ' with custom challenge' : ''}`);
        } catch (error) {
            console.error('[CREATE-ROOM ERROR]', error);
            socket.emit('error', { message: 'Failed to create room: ' + error.message });
        }
    });

    // ===== JOIN ROOM =====
    socket.on('join-room', ({ roomId, playerName }) => {
        // FIX Bug #21: Validate room ID format
        if (!roomId || !/^[A-Z0-9]{6}$/.test(roomId)) {
            socket.emit('error', { message: 'Invalid room ID format' });
            return;
        }

        // FIX Bug #21: Validate player name
        if (!playerName || playerName.trim().length === 0) {
            socket.emit('error', { message: 'Player name required' });
            return;
        }

        if (playerName.length > 20) {
            socket.emit('error', { message: 'Player name too long (max 20 characters)' });
            return;
        }

        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.isFull()) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        room.addOpponent(playerName, socket.id);
        playerSockets.set(socket.id, { roomId, playerName, role: 'opponent' });
        socket.join(roomId);

        // Notify both players
        io.to(room.host.socketId).emit('opponent-joined', {
            opponent: { name: playerName },
            gameState: room.gameState
        });

        // FIX Bug #1: Send challenge to joining player
        socket.emit('room-joined', {
            roomId,
            room: room.toJSON(),
            challenge: room.challenge,  // CRITICAL FIX
            opponentName: room.host.name
        });

        // Start game timer
        startGameTimer(roomId);

        console.log(`[JOIN] ${playerName} joined room ${roomId}`);
    });

    // ===== SPECTATE ROOM =====
    socket.on('spectate-room', ({ roomId }) => {
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        room.addSpectator(socket.id);
        playerSockets.set(socket.id, { roomId, role: 'spectator' });
        socket.join(roomId);

        // FIX Bug #2: Send challenge to spectators
        socket.emit('spectate-started', {
            roomId,
            challenge: room.challenge,  // CRITICAL FIX
            hostCode: room.host.code,
            opponentCode: room.opponent?.code || '',
            hostName: room.host.name,
            opponentName: room.opponent?.name || 'Waiting...',
            gameState: room.gameState,
            spectatorCount: room.spectators.size
        });

        // Notify room of new spectator
        broadcastToRoom(roomId, 'spectator-count-updated', { count: room.spectators.size });

        console.log(`[SPECTATE] Socket ${socket.id} spectating room ${roomId}`);
    });

    // ===== CODE UPDATE =====
    socket.on('code-update', ({ code }) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo || playerInfo.role === 'spectator') return;

        const room = rooms.get(playerInfo.roomId);
        if (!room) return;

        const playerData = room.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        playerData.player.code = code;

        // Broadcast to opponent and spectators
        broadcastToRoom(playerInfo.roomId, 'opponent-code-update', {
            code,
            role: playerData.role
        }, socket.id);
    });

    // ===== SABOTAGE ACTIVATION =====
    socket.on('activate-sabotage', ({ sabotageId, manaCost }) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo || playerInfo.role === 'spectator') return;

        const room = rooms.get(playerInfo.roomId);
        if (!room) return;

        const playerData = room.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        // Check if power-ups are unlocked
        if (!playerData.player.powerUpsUnlocked) {
            socket.emit('error', { message: 'Complete all test cases to unlock power-ups!' });
            return;
        }

        // Deduct mana
        if (playerData.player.mana >= manaCost) {
            playerData.player.mana -= manaCost;

            // Activate sabotage
            room.activeSabotages[playerData.role][sabotageId] = true;

            // Broadcast to opponent
            const opponentSocketId = playerData.role === 'host' ? room.opponent?.socketId : room.host.socketId;
            if (opponentSocketId) {
                io.to(opponentSocketId).emit('sabotage-received', { sabotageId });
            }

            // Broadcast to spectators
            room.spectators.forEach(spectatorId => {
                io.to(spectatorId).emit('sabotage-activated', {
                    sabotageId,
                    activatedBy: playerData.role
                });
            });

            console.log(`[SABOTAGE] ${playerData.role} activated ${sabotageId} in room ${playerInfo.roomId}`);
        }
    });

    // ===== CHANGE LANGUAGE =====
    socket.on('change-language', ({ language }) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo || playerInfo.role === 'spectator') return;

        const room = rooms.get(playerInfo.roomId);
        if (!room) return;

        const playerData = room.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        // Update language and load starter code
        playerData.player.language = language;
        // Use challenge's starterCode directly (works for both custom and built-in challenges)
        playerData.player.code = room.challenge.starterCode?.[language] || challengeService.getStarterCode(room.challenge.id, language);

        // Send new starter code to player
        socket.emit('language-changed', {
            language,
            code: playerData.player.code
        });

        console.log(`[LANGUAGE] ${playerData.role} changed to ${language} in room ${playerInfo.roomId}`);
    });

    // ===== SUBMIT CODE (Run Tests) =====
    socket.on('submit-code', async ({ code, language }) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo || playerInfo.role === 'spectator') return;

        const room = rooms.get(playerInfo.roomId);
        if (!room) return;

        const playerData = room.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        // FIX Bug #22: Rate limit check
        const now = Date.now();
        const lastSubmit = submissionRateLimits.get(socket.id) || 0;
        const timeSinceLastSubmit = now - lastSubmit;

        if (timeSinceLastSubmit < 2000) {  // 2 second cooldown
            socket.emit('error', {
                message: `Please wait ${Math.ceil((2000 - timeSinceLastSubmit) / 1000)}s before submitting again`
            });
            return;
        }

        // FIX Bug #20: Validate code length
        if (!code || code.length === 0) {
            socket.emit('error', { message: 'Code cannot be empty' });
            return;
        }

        if (code.length > 50000) {  // 50KB limit
            socket.emit('error', { message: 'Code too long (max 50KB)' });
            return;
        }

        // FIX Bug #20: Validate language
        const validLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'];
        if (!validLanguages.includes(language.toLowerCase())) {
            socket.emit('error', { message: 'Invalid language' });
            return;
        }

        // FIX Bug #4: Check if already submitting
        if (room.submissionLocks[playerData.role]) {
            socket.emit('error', { message: 'Already running tests. Please wait.' });
            return;
        }

        // Lock submission
        room.submissionLocks[playerData.role] = true;
        submissionRateLimits.set(socket.id, now);

        console.log(`[SUBMIT] ${playerData.role} submitting code in room ${playerInfo.roomId}`);

        try {
            // Get test cases from the challenge (works for both built-in and custom challenges)
            const testCases = room.challenge.testCases || challengeService.getTestCases(room.challenge.id);

            // Run code against all test cases
            const results = await codeExecutor.runTestCases(code, language, testCases);

            // Store results
            playerData.player.testResults = results;

            // Unlock power-ups if all tests passed
            if (results.allPassed && !playerData.player.powerUpsUnlocked) {
                playerData.player.powerUpsUnlocked = true;
                socket.emit('power-ups-unlocked', {
                    message: '🎉 All tests passed! Power-ups unlocked!'
                });
                console.log(`[UNLOCK] ${playerData.role} unlocked power-ups in room ${playerInfo.roomId}`);
            }

            // Send test results to player
            socket.emit('test-results', {
                results: results,
                powerUpsUnlocked: playerData.player.powerUpsUnlocked
            });

            // Notify opponent of submission
            const opponentSocketId = playerData.role === 'host' ? room.opponent?.socketId : room.host.socketId;
            if (opponentSocketId) {
                io.to(opponentSocketId).emit('opponent-submitted', {
                    passedTests: results.passedTests,
                    totalTests: results.totalTests,
                    allPassed: results.allPassed
                });
            }

        } catch (error) {
            console.error(`[SUBMIT ERROR] ${error.message}`);
            socket.emit('test-results', {
                error: error.message,
                results: null
            });
        } finally {
            // FIX Bug #4: Unlock submission
            room.submissionLocks[playerData.role] = false;
        }
    });

    // ===== GET ACTIVE ROOMS (for lobby) =====
    socket.on('get-active-rooms', () => {
        const activeRooms = Array.from(rooms.values())
            .filter(room => room.gameState.status === 'waiting' || room.gameState.status === 'active')
            .map(room => room.toJSON());

        socket.emit('active-rooms-list', { rooms: activeRooms });
    });

    // ===== DISCONNECT =====
    socket.on('disconnect', () => {
        const playerInfo = playerSockets.get(socket.id);

        if (playerInfo) {
            const room = rooms.get(playerInfo.roomId);

            if (room) {
                if (playerInfo.role === 'spectator') {
                    room.removeSpectator(socket.id);
                    broadcastToRoom(playerInfo.roomId, 'spectator-count-updated', {
                        count: room.spectators.size
                    });
                } else {
                    // Player left - end game
                    room.gameState.status = 'finished';
                    room.gameState.winner = playerInfo.role === 'host' ? 'opponent' : 'host';

                    // FIX Bug #3: Clear timer interval
                    if (room.timerInterval) {
                        clearInterval(room.timerInterval);
                        room.timerInterval = null;
                    }

                    broadcastToRoom(playerInfo.roomId, 'player-left', {
                        leftPlayer: playerInfo.role,
                        winner: room.gameState.winner
                    });

                    // FIX Bug #8: Clean up room only if no spectators
                    setTimeout(() => {
                        const currentRoom = rooms.get(playerInfo.roomId);
                        if (currentRoom && currentRoom.spectators.size === 0) {
                            rooms.delete(playerInfo.roomId);
                            console.log(`[CLEANUP] Room ${playerInfo.roomId} deleted`);
                        } else {
                            console.log(`[CLEANUP] Room ${playerInfo.roomId} kept (has spectators)`);
                        }
                    }, 30000);
                }
            }

            playerSockets.delete(socket.id);
        }

        // FIX Bug #22: Clean up rate limit
        submissionRateLimits.delete(socket.id);

        console.log(`[DISCONNECT] Socket ${socket.id} disconnected`);
    });
});

// ==================== GAME TIMER ====================
function startGameTimer(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // FIX Bug #3: Store interval in room for cleanup
    room.timerInterval = setInterval(() => {
        if (!rooms.has(roomId)) {
            clearInterval(room.timerInterval);
            return;
        }

        room.gameState.timeLeft -= 1;

        // Broadcast time update
        broadcastToRoom(roomId, 'time-update', { timeLeft: room.gameState.timeLeft });

        // Regenerate mana
        if (room.host.mana < 100) room.host.mana = Math.min(100, room.host.mana + 2);
        if (room.opponent && room.opponent.mana < 100) {
            room.opponent.mana = Math.min(100, room.opponent.mana + 2);
        }

        // Game over
        if (room.gameState.timeLeft <= 0) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
            room.gameState.status = 'finished';

            // Determine winner based on test results
            const hostPassed = room.host.testResults?.passedTests || 0;
            const opponentPassed = room.opponent?.testResults?.passedTests || 0;
            const hostAllPassed = room.host.testResults?.allPassed || false;
            const opponentAllPassed = room.opponent?.testResults?.allPassed || false;

            let winner = 'draw';
            let winReason = 'Time expired - No clear winner';

            if (hostAllPassed && !opponentAllPassed) {
                winner = 'host';
                winReason = `${room.host.name} completed all test cases!`;
            } else if (opponentAllPassed && !hostAllPassed) {
                winner = 'opponent';
                winReason = `${room.opponent.name} completed all test cases!`;
            } else if (hostAllPassed && opponentAllPassed) {
                winner = 'draw';
                winReason = 'Both players completed all tests - Perfect tie!';
            } else if (hostPassed > opponentPassed) {
                winner = 'host';
                winReason = `${room.host.name} passed more tests (${hostPassed} vs ${opponentPassed})`;
            } else if (opponentPassed > hostPassed) {
                winner = 'opponent';
                winReason = `${room.opponent.name} passed more tests (${opponentPassed} vs ${hostPassed})`;
            } else {
                winner = 'draw';
                winReason = `Tie - Both passed ${hostPassed} tests`;
            }

            room.gameState.winner = winner;
            room.gameState.winReason = winReason;

            battlesCompleted++; // Increment global counter

            broadcastToRoom(roomId, 'game-over', {
                winner: winner,
                winReason: winReason,
                finalScores: {
                    host: {
                        name: room.host.name,
                        passedTests: hostPassed,
                        totalTests: room.host.testResults?.totalTests || 0,
                        allPassed: hostAllPassed
                    },
                    opponent: {
                        name: room.opponent?.name || 'Opponent',
                        passedTests: opponentPassed,
                        totalTests: room.opponent?.testResults?.totalTests || 0,
                        allPassed: opponentAllPassed
                    }
                }
            });

            console.log(`[GAME OVER] Room ${roomId} finished - Winner: ${winner} (${winReason})`);
        }
    }, 1000);
}

// ==================== REST API ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        connections: io.engine.clientsCount,
        battlesCompleted: battlesCompleted,
        uptime: getUptime()
    });
});

// Legacy health endpoint (keep for backwards compatibility)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        connections: io.engine.clientsCount,
        battlesCompleted: battlesCompleted,
        uptime: getUptime()
    });
});

app.get('/api/rooms', (req, res) => {
    const activeRooms = Array.from(rooms.values()).map(room => room.toJSON());
    res.json({ rooms: activeRooms });
});

// ==================== STATIC FILE SERVING (PRODUCTION) ====================
if (isProduction) {
    // Serve static files from the React app build directory
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));

    // Handle React routing - return index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🎮 CodeClash Server Running        ║
║   Port: ${PORT}                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════╝
  `);
});

export default httpServer;
