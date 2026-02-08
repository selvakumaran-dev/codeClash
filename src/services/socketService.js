import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('[Socket] Connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('[Socket] Disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('[Socket] Error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Helper to ensure socket is connected
    ensureConnected() {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            if (!this.socket) {
                this.connect();
            }

            // Wait for connection
            const timeout = setTimeout(() => {
                reject(new Error('Socket connection timeout'));
            }, 5000);

            this.socket.once('connect', () => {
                clearTimeout(timeout);
                resolve();
            });

            this.socket.once('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    // ===== ROOM OPERATIONS =====
    async createRoom(playerName, customChallenge = null) {
        try {
            await this.ensureConnected();

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Create room timeout'));
                }, 10000);

                this.socket.emit('create-room', { playerName, customChallenge });

                this.socket.once('room-created', (data) => {
                    clearTimeout(timeout);
                    resolve(data);
                });

                this.socket.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        } catch (error) {
            throw new Error(`Failed to create room: ${error.message}`);
        }
    }

    async joinRoom(roomId, playerName) {
        try {
            await this.ensureConnected();

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Join room timeout'));
                }, 10000);

                this.socket.emit('join-room', { roomId, playerName });

                this.socket.once('room-joined', (data) => {
                    clearTimeout(timeout);
                    resolve(data);
                });

                this.socket.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        } catch (error) {
            throw new Error(`Failed to join room: ${error.message}`);
        }
    }

    async spectateRoom(roomId) {
        try {
            await this.ensureConnected();

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Spectate room timeout'));
                }, 10000);

                this.socket.emit('spectate-room', { roomId });

                this.socket.once('spectate-started', (data) => {
                    clearTimeout(timeout);
                    resolve(data);
                });

                this.socket.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        } catch (error) {
            throw new Error(`Failed to spectate room: ${error.message}`);
        }
    }

    getActiveRooms() {
        return new Promise((resolve) => {
            this.socket.emit('get-active-rooms');
            this.socket.once('active-rooms-list', (data) => resolve(data.rooms));
        });
    }

    // ===== GAME ACTIONS =====
    updateCode(code) {
        this.socket.emit('code-update', { code });
    }

    activateSabotage(sabotageId, manaCost) {
        this.socket.emit('activate-sabotage', { sabotageId, manaCost });
    }

    // ===== EVENT LISTENERS =====
    onOpponentJoined(callback) {
        this.socket.on('opponent-joined', callback);
    }

    onOpponentCodeUpdate(callback) {
        this.socket.on('opponent-code-update', callback);
    }

    onSabotageReceived(callback) {
        this.socket.on('sabotage-received', callback);
    }

    onSabotageActivated(callback) {
        this.socket.on('sabotage-activated', callback);
    }

    onTimeUpdate(callback) {
        this.socket.on('time-update', callback);
    }

    onGameOver(callback) {
        this.socket.on('game-over', callback);
    }

    onPlayerLeft(callback) {
        this.socket.on('player-left', callback);
    }

    onSpectatorCountUpdated(callback) {
        this.socket.on('spectator-count-updated', callback);
    }

    // ===== CLEANUP =====
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
