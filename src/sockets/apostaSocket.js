// src/sockets/apostaSocket.js
export const setupApostaSocket = (io) => {
    // ===== CONEXÃO =====
    io.on('connection', (socket) => {
        console.log('Usuário conectado (Apostas):', socket.id);

        // === JOIN ROOM PARA APOSTAS ===
        socket.on('join-aposta-room', ({ cardId, merito = 'visitante' }) => {
            const room = `${cardId}-apostas-${merito}`;
            socket.join(room);
            console.log(`[APOSTAS] Usuário ${socket.id} entrou na sala de apostas: ${room}`);
        });

        // === LEAVE ROOM PARA APOSTAS ===
        socket.on('leave-aposta-room', ({ cardId, merito = 'visitante' }) => {
            const room = `${cardId}-apostas-${merito}`;
            socket.leave(room);
            console.log(`[APOSTAS] Usuário ${socket.id} saiu da sala de apostas: ${room}`);
        });

        // === EVENTOS DE APOSTAS ===
        socket.on('nova-aposta', async (data) => {
            const room = `${data.cardId}-apostas-${data.merito || 'visitante'}`;
            io.to(room).emit('nova-aposta', { 
                cardId: data.cardId, 
                aposta: data.aposta, 
                sala: data.sala 
            });
            console.log(`[APOSTAS] Nova aposta em ${room}: ${data.aposta.titulo}`);
        });

        socket.on('participar-aposta', async (data) => {
            const room = `${data.cardId}-apostas-${data.merito}`;
            io.to(room).emit('aposta-atualizada', { 
                cardId: data.cardId, 
                apostaId: data.apostaId, 
                updates: { participantes: data.participantes } 
            });
            console.log(`[APOSTAS] Participação em ${room}`);
        });

        socket.on('encerrar-aposta', async (data) => {
            const room = `${data.cardId}-apostas-${data.merito}`;
            io.to(room).emit('aposta-encerrada', { 
                cardId: data.cardId, 
                apostaId: data.apostaId, 
                opcaoVencedora: data.opcaoVencedora 
            });
            console.log(`[APOSTAS] Aposta encerrada em ${room}`);
        });

        socket.on('enviar-comprovante-aposta', async (data) => {
            const room = `${data.cardId}-apostas-${data.merito}`;
            io.to(room).emit('comprovante-enviado-aposta', data);
            console.log(`[APOSTAS] Comprovante enviado em ${room}`);
        });

        // === EVENTOS DE DESAFIOS ===
        socket.on('join-desafio-room', ({ cardId, merito = 'visitante' }) => {
            const room = `${cardId}-desafios-${merito}`;
            socket.join(room);
            console.log(`[DESAFIOS] Usuário ${socket.id} entrou na sala de desafios: ${room}`);
        });

        socket.on('leave-desafio-room', ({ cardId, merito = 'visitante' }) => {
            const room = `${cardId}-desafios-${merito}`;
            socket.leave(room);
            console.log(`[DESAFIOS] Usuário ${socket.id} saiu da sala de desafios: ${room}`);
        });

        socket.on('nova-desafio', async (data) => {
            const room = `${data.cardId}-desafios-${data.merito || 'visitante'}`;
            io.to(room).emit('nova-desafio', { 
                cardId: data.cardId, 
                desafio: data.desafio, 
                sala: data.sala 
            });
            console.log(`[DESAFIOS] Novo desafio em ${room}: ${data.desafio.titulo}`);
        });

        socket.on('participar-desafio', async (data) => {
            const room = `${data.cardId}-desafios-${data.merito}`;
            io.to(room).emit('desafio-atualizado', { 
                cardId: data.cardId, 
                desafioId: data.desafioId, 
                updates: { participantes: data.participantes } 
            });
            console.log(`[DESAFIOS] Participação em ${room}`);
        });

        socket.on('encerrar-desafio', async (data) => {
            const room = `${data.cardId}-desafios-${data.merito}`;
            io.to(room).emit('desafio-encerrado', { 
                cardId: data.cardId, 
                desafioId: data.desafioId, 
                opcaoVencedora: data.opcaoVencedora 
            });
            console.log(`[DESAFIOS] Desafio encerrado em ${room}`);
        });

        socket.on('enviar-comprovante-desafio', async (data) => {
            const room = `${data.cardId}-desafios-${data.merito}`;
            io.to(room).emit('comprovante-enviado-desafio', data);
            console.log(`[DESAFIOS] Comprovante enviado em ${room}`);
        });

        // === DESCONEXÃO ===
        socket.on('disconnect', () => {
            console.log('Usuário desconectado (Apostas):', socket.id);
        });
    });
};