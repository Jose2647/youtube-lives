export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuário conectado:', socket.id);

        socket.on('join-live', (liveId) => {
            socket.join(liveId);
            console.log(`Usuário ${socket.id} entrou na live ${liveId}`);
        });

        socket.on('chat-message', (data) => {
            io.to(data.liveId).emit('chat-message', {
                user: data.user,
                message: data.message,
                timestamp: new Date()
            });
        });

        socket.on('join-room', ({ cardId, user, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        socket.on('chat-message', (data) => {
            const room = `${data.cardId}-${data.merito || 'visitante'}`;
            io.to(room).emit('chat-message', {
                cardId: data.cardId,
                usuario: data.user || data.usuario,
                mensagem: data.message || data.mensagem,
                data: data.data || new Date().toISOString(),
                merito: data.merito
            });
            console.log(`Mensagem enviada para ${room}: ${data.mensagem || data.message}`);
        });

        socket.on('voice-join', ({ cardId, user, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            io.to(room).emit('voice-join', { cardId, user, merito });
            console.log(`Usuário ${user || 'Visitante'} iniciou voz na sala ${room}`);
        });

        socket.on('voice-leave', ({ cardId, user, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            io.to(room).emit('voice-leave', { cardId, user, merito });
            console.log(`Usuário ${user || 'Visitante'} saiu da voz na sala ${room}`);
        });

        socket.on('offer', ({ cardId, to, offer, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            socket.to(room).to(to).emit('offer', { cardId, from: socket.id, offer, merito });
            console.log(`Oferta enviada de ${socket.id} para ${to} na sala ${room}`);
        });

        socket.on('answer', ({ cardId, to, answer, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            socket.to(room).to(to).emit('answer', { cardId, from: socket.id, answer, merito });
            console.log(`Resposta enviada de ${socket.id} para ${to} na sala ${room}`);
        });

        socket.on('ice-candidate', ({ cardId, to, candidate, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            socket.to(room).to(to).emit('ice-candidate', { cardId, from: socket.id, candidate, merito });
            console.log(`ICE candidate enviado de ${socket.id} para ${to} na sala ${room}`);
        });
        
        socket.on('data-share-join', ({ cardId, user, merito }) => {
              const room = `${cardId}-${merito || 'visitante'}`;
              io.to(room).emit('data-share-join', { cardId, user, merito });
              console.log(`Usuário ${user} iniciou compartilhamento de dados na sala ${room}`);
          });

        socket.on('disconnect', () => {
            console.log('Usuário desconectado:', socket.id);
        });
    });
};


////////________________
////////________________
////////________________
////////________________
////////________________


export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuário conectado:', socket.id);

        // Entrar em uma sala de jogo
        socket.on('join-jogo', ({ jogoId, user, merito }) => {
            const room = `jogo-${jogoId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        // Entrar em uma sala de time
        socket.on('join-time', ({ timeId, user, merito }) => {
            const room = `time-${timeId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        // Entrar em uma sala de live (já existe, mantido como referência)
        socket.on('join-live', (liveId) => {
            socket.join(liveId);
            console.log(`Usuário ${socket.id} entrou na live ${liveId}`);
        });

        // ... (outros eventos existentes: join-room, chat-message, voice-join, voice-leave, offer, answer, ice-candidate, disconnect)

        socket.on('chat-message', (data) => {
            const room = data.jogoId
                ? `jogo-${data.jogoId}-${data.merito || 'visitante'}`
                : data.timeId
                ? `time-${data.timeId}-${data.merito || 'visitante'}`
                : `${data.cardId}-${data.merito || 'visitante'}`;
            io.to(room).emit('chat-message', {
                cardId: data.cardId,
                jogoId: data.jogoId,
                timeId: data.timeId,
                usuario: data.user || data.usuario,
                mensagem: data.message || data.mensagem,
                data: data.data || new Date().toISOString(),
                merito: data.merito
            });
            console.log(`Mensagem enviada para ${room}: ${data.mensagem || data.message}`);
        });

        // ... (manter eventos WebRTC: voice-join, voice-leave, offer, answer, ice-candidate, disconnect)
    });
};

////////________________
////////________________
////////________________
////////________________
////////________________

export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuário conectado:', socket.id);

        // Novo evento: join-invite (para usuários que acessam via link de convite)
        socket.on('join-invite', ({ inviteCode, user, merito }) => {
            const room = `invite-${inviteCode}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala de convite ${room}`);
            io.to(room).emit('user-joined-invite', { user, inviteCode });
        });

        // ... (manter eventos existentes: join-jogo, join-time, join-live, join-room, chat-message, etc.)

        socket.on('disconnect', () => {
            console.log('Usuário desconectado:', socket.id);
        });
    });
};