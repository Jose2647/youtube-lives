// src/sockets/webrtcSocket.js

    // src/sockets/webrtcSocket.js

export const setupWebRTCSignaling = (io) => {
    const gameRooms = new Map(); // Map<gameId, Set<socket.id>>

    io.on('connection', (socket) => {
        let currentRoom = null;

        console.log(`🔌 Novo socket conectado: ${socket.id}`);

        // Quando um cliente entra em uma sala (jogo)
        socket.on('join_room', (gameId) => {
            if (currentRoom) socket.leave(currentRoom);

            socket.join(gameId);
            currentRoom = gameId;

            if (!gameRooms.has(gameId)) {
                gameRooms.set(gameId, new Set());
            }
            gameRooms.get(gameId).add(socket.id);

            console.log(`🎮 Socket ${socket.id} entrou na sala: ${gameId}`);

            // Envia aos outros da sala que um novo peer chegou
            socket.to(gameId).emit('peer_joined', { peerId: socket.id });
        });

        // Quando recebe um sinal WebRTC (offer, answer, candidate)
        socket.on('signal', (message) => {
            if (!currentRoom) {
                console.warn(`⚠️ Sinal recebido sem sala definida.`);
                return;
            }

            // Adiciona o ID do remetente à mensagem
            message.from = socket.id;

            // Retransmite para todos os outros da mesma sala
            socket.to(currentRoom).emit('signal', message);
        });

        // Quando o peer sai da sala
        socket.on('disconnect', () => {
            if (currentRoom && gameRooms.has(currentRoom)) {
                gameRooms.get(currentRoom).delete(socket.id);

                // Notifica os outros peers da sala
                socket.to(currentRoom).emit('peer_left', { peerId: socket.id });

                console.log(`❌ Socket ${socket.id} saiu da sala ${currentRoom}`);
            }
        });
    });
};
