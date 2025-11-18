// src/sockets/webrtcSocket.js

// Usamos um Map para rastrear ativamente quem está em qual sala
// Map<roomId, Set<socketId>>
const gameRooms = new Map();

// Adiciona a sala padrão
gameRooms.set('default_room', new Set());

/**
 * Notifica todos os sockets sobre a lista atual de salas.
 */
const updateRoomsList = (io) => {
  const activeRooms = Array.from(gameRooms.keys());
  io.emit('rooms_list', activeRooms);
  //console.log('[SERVER] Lista de salas atualizada:', activeRooms);
};

export const setupWebRTCSignaling = (io) => {
  io.on('connection', (socket) => {
  //  //console.log(`🔌 Novo socket conectado: ${socket.id}`);

    // --- Gerenciamento de Salas ---

    socket.on('join_room', (roomId) => {
      if (!roomId) return;

      // 1. Garante que a sala exista no Map
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, new Set());
      }

      // 2. Adiciona o socket à sala
      socket.join(roomId);
      gameRooms.get(roomId).add(socket.id);
      //console.log(`🎮 Socket ${socket.id} entrou na sala: ${roomId}`);

      // 3. Pega a lista de peers que JÁ ESTÃO na sala (excluindo ele mesmo)
      const existingPeerIds = Array.from(gameRooms.get(roomId)).filter(
        (id) => id !== socket.id
      );

      // 4. ENVIA APENAS PARA O NOVO SOCKET a lista de peers existentes
      // O cliente usará isso para criar conexões (Ofertas)
      if (existingPeerIds.length > 0) {
        socket.emit('existing_peers_in_room', {
          roomId: roomId,
          peerIds: existingPeerIds,
        });
        //console.log(`[SERVER] Enviando ${existingPeerIds.length} peers existentes para ${socket.id}`);
      }
      
      // 5. NOTIFICA OS OUTROS PEERS que um novo peer chegou
      // Eles usarão isso para criar conexões (não-ofertantes)
      socket.to(roomId).emit('peer_joined', {
        roomId: roomId,
        peerId: socket.id,
      });
    });

    // NOVO: Handler para 'leave_room'
    socket.on('leave_room', (roomId) => {
      handleLeaveRoom(socket, io, roomId);
    });

    // --- Gerenciamento de Lista de Salas (UI) ---

    socket.on('get_rooms_list', () => {
      socket.emit('rooms_list', Array.from(gameRooms.keys()));
    });

    socket.on('check_room_exists', (roomName, callback) => {
      const exists = gameRooms.has(roomName);
      //console.log(`[SERVER] Check room ${roomName}: ${exists ? 'exists' : 'not exists'}`);
      callback(exists);
    });

    socket.on('create_room', (roomName) => {
      if (!gameRooms.has(roomName)) {
        gameRooms.set(roomName, new Set());
        //console.log(`[SERVER] Sala criada: ${roomName}`);
        updateRoomsList(io); // Atualiza todos
      }
      // (O 'join_room' do cliente cuidará de entrar)
    });













    // --- Sinalização WebRTC ---

    socket.on('signal', (data) => {
      // Retransmissão simples. O cliente deve sempre prover 'to'
      if (data.to) {
        // //console.log(`[SIGNAL] de ${socket.id} para ${data.to} (tipo ${data.type})`);
        io.to(data.to).emit('signal', { ...data, from: socket.id });
      } else {
        console.warn(`[SIGNAL] Sinal de ${socket.id} sem 'to' foi ignorado.`);
      }
    });

    /////////////
    /////////////pagamentos
    /////////////
        // --- NOVO: Transferência de Comprovantes ---
    socket.on('file_metadata', (data) => {
      // data: { to, fileName, fileSize, fileType, roomId, metadata }
      if (data.to) {
        //console.log(`[FILE] Metadata de ${socket.id} para ${data.to}: ${data.fileName}`);
        io.to(data.to).emit('file_metadata', { 
          ...data, 
          from: socket.id 
        });
      }
    });

    socket.on('file_chunk', (data) => {
      // data: { to, chunk, chunkIndex, totalChunks, fileId }
      if (data.to) {
        // Retransmite o chunk para o destinatário
        io.to(data.to).emit('file_chunk', {
          ...data,
          from: socket.id
        });
      }
    });

    socket.on('file_transfer_complete', (data) => {
      // data: { to, fileId, success }
      if (data.to) {
        io.to(data.to).emit('file_transfer_complete', {
          ...data,
          from: socket.id
        });
      }
    });

    socket.on('file_transfer_error', (data) => {
      // data: { to, fileId, error }
      if (data.to) {
        io.to(data.to).emit('file_transfer_error', {
          ...data,
          from: socket.id
        });
      }
    });
    
    /////////////
    /////////////pagamentos
    /////////////
    
    
    
    
    
    
    
    
    
    
    
    // --- Desconexão ---

    socket.on('disconnect', () => {
      //console.log(`❌ Socket desconectado: ${socket.id}`);
      // Itera por TODAS as salas para remover o socket
      gameRooms.forEach((socketsInRoom, roomId) => {
        if (socketsInRoom.has(socket.id)) {
          // Usa a mesma lógica de 'leave_room'
          handleLeaveRoom(socket, io, roomId, true /* isDisconnecting */);
        }
      });
    });
    
  });

  /**
   * Função helper para lidar com a saída de uma sala (leave ou disconnect)
   */
  const handleLeaveRoom = (socket, io, roomId, isDisconnecting = false) => {
    if (!roomId || !gameRooms.has(roomId)) return;

    const room = gameRooms.get(roomId);
    if (!room.has(socket.id)) return;

    // 1. Remove o socket da sala
    if (!isDisconnecting) {
        socket.leave(roomId);
    }
    room.delete(socket.id);
    //console.log(`[SERVER] Socket ${socket.id} saiu da sala ${roomId}`);

    // 2. Notifica os peers restantes na sala
    socket.to(roomId).emit('peer_left', {
      roomId: roomId, // INCLUI O ID DA SALA
      peerId: socket.id,
    });

    // 3. Se a sala estiver vazia (e não for a default), remove
    if (room.size === 0 && roomId !== 'default_room') {
      gameRooms.delete(roomId);
      //console.log(`[SERVER] Sala vazia "${roomId}" removida.`);
      updateRoomsList(io); // Atualiza lista para todos
    }
  };
};





///////////
///////////
///////////
///////////

