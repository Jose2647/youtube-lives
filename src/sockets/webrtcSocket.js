// src/sockets/webrtcSocket.js

    // src/sockets/webrtcSocket.js
    
    // Lista de rooms (simples array para teste; use DB para produção)
let rooms = ['default_room']; // Inicial com default

export const setupWebRTCSignaling = (io) => {
    const gameRooms = new Map(); // Map<gameId, Set<socket.id>>
/*
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
    */





io.on('connection', (socket) => {
  console.log(`🔌 Novo socket conectado: ${socket.id}`);

  // Join room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`🎮 Socket ${socket.id} entrou na sala: ${room}`);
    // Notifica outros na sala que peer joined
    socket.to(room).emit('peer_joined', { peerId: socket.id });
    // Adicione à lista de rooms se nova
    if (!rooms.includes(room)) {
      rooms.push(room);
      io.emit('rooms_list', rooms); // Atualiza todos com nova lista
    }
  });

  // Signal forwarding
  socket.on('signal', (data) => {
    console.log(`[SERVER] Signal from ${data.from} to ${data.to || 'broadcast'}: ${data.type}`);
    if (data.to) {
      io.to(data.to).emit('signal', data);
    } else {
      // Broadcast to room if no 'to' (fallback)
      const room = Array.from(socket.rooms)[1]; // Assume second room is the game room
      socket.to(room).emit('signal', data);
    }
  });

  // Novo: Get rooms list
  socket.on('get_rooms_list', () => {
    console.log(`[SERVER] Enviando lista de salas para ${socket.id}: ${rooms}`);
    socket.emit('rooms_list', rooms);
  });

  // Novo: Check if room exists
  socket.on('check_room_exists', (roomName, callback) => {
    const exists = rooms.includes(roomName);
    console.log(`[SERVER] Check room ${roomName}: ${exists ? 'exists' : 'not exists'}`);
    callback(exists);
  });

  // Novo: Create room (apenas adiciona à lista e join)
  socket.on('create_room', (roomName) => {
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      console.log(`[SERVER] Sala criada: ${roomName}`);
      io.emit('rooms_list', rooms); // Atualiza todos
    }
    // Opcional: join automático do criador
    socket.join(roomName);
    socket.to(roomName).emit('peer_joined', { peerId: socket.id });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket desconectado: ${socket.id}`);
    // Notifica peers em rooms
    for (const room of socket.rooms) {
      if (room !== socket.id) { // Ignora default socket room
        socket.to(room).emit('peer_left', { peerId: socket.id });
      }
    }
  });
});

};