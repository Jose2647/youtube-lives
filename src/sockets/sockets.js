/*
export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuário conectado:', socket.id);

        // ===== SISTEMA DE CONVITES =====
        socket.on('join-invite', ({ inviteCode, user, merito }) => {
            const room = `invite-${inviteCode}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala de convite ${room}`);
            io.to(room).emit('user-joined-invite', { user, inviteCode });
        });

        // ===== SALAS POR ENTIDADE =====
        socket.on('join-jogo', ({ jogoId, user, merito }) => {
            const room = `jogo-${jogoId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        socket.on('join-time', ({ timeId, user, merito }) => {
            const room = `time-${timeId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        socket.on('join-live', ({ liveId, user, merito }) => {
    const room = `live-${liveId}-${merito || 'visitante'}`;
    socket.join(room);
    console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na live ${room}`);
});

        socket.on('join-room', ({ cardId, user, merito }) => {
            const room = `${cardId}-${merito || 'visitante'}`;
            socket.join(room);
            console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room}`);
        });

        // ===== SISTEMA DE CHAT =====
        socket.on('chat-message', (data) => {
            let room;
            
            if (data.inviteCode) {
                room = `invite-${data.inviteCode}`;
            } else if (data.jogoId) {
                room = `jogo-${data.jogoId}-${data.merito || 'visitante'}`;
            } else if (data.timeId) {
                room = `time-${data.timeId}-${data.merito || 'visitante'}`;
            } else if (data.liveId) {
                room = `live-${data.liveId}-${data.merito || 'visitante'}`;
            } else {
                room = `${data.cardId}-${data.merito || 'visitante'}`;
            }

            io.to(room).emit('chat-message', {
                cardId: data.cardId,
                jogoId: data.jogoId,
                timeId: data.timeId,
                liveId: data.liveId,
                inviteCode: data.inviteCode,
                usuario: data.user || data.usuario,
                mensagem: data.message || data.mensagem,
                data: data.data || new Date().toISOString(),
                merito: data.merito
            });
            console.log(`Mensagem enviada para ${room}: ${data.mensagem || data.message}`);
        });

        // ===== WEBRTC - VOZ =====
        socket.on('voice-join', ({ cardId, jogoId, timeId, liveId, inviteCode, user, merito }) => {
            const room = getRoomName({ cardId, jogoId, timeId, liveId, inviteCode, merito });
            io.to(room).emit('voice-join', { cardId, jogoId, timeId, liveId, inviteCode, user, merito });
            console.log(`Usuário ${user || 'Visitante'} iniciou voz na sala ${room}`);
        });

        socket.on('voice-leave', ({ cardId, jogoId, timeId, liveId, inviteCode, user, merito }) => {
            const room = getRoomName({ cardId, jogoId, timeId, liveId, inviteCode, merito });
            io.to(room).emit('voice-leave', { cardId, jogoId, timeId, liveId, inviteCode, user, merito });
            console.log(`Usuário ${user || 'Visitante'} saiu da voz na sala ${room}`);
        });

        // ===== WEBRTC - DATA SHARING =====
        socket.on('data-share-join', ({ cardId, jogoId, timeId, liveId, inviteCode, user, merito }) => {
            const room = getRoomName({ cardId, jogoId, timeId, liveId, inviteCode, merito });
            io.to(room).emit('data-share-join', { cardId, jogoId, timeId, liveId, inviteCode, user, merito });
            console.log(`Usuário ${user} iniciou compartilhamento de dados na sala ${room}`);
        });

        // ===== WEBRTC SIGNALING =====
        socket.on('offer', (data) => {
            const room = getRoomName(data);
            socket.to(room).to(data.to).emit('offer', { 
                ...data, 
                from: socket.id 
            });
            console.log(`Oferta enviada de ${socket.id} para ${data.to} na sala ${room}`);
        });

        socket.on('answer', (data) => {
            const room = getRoomName(data);
            socket.to(room).to(data.to).emit('answer', { 
                ...data, 
                from: socket.id 
            });
            console.log(`Resposta enviada de ${socket.id} para ${data.to} na sala ${room}`);
        });

        socket.on('ice-candidate', (data) => {
            const room = getRoomName(data);
            socket.to(room).to(data.to).emit('ice-candidate', { 
                ...data, 
                from: socket.id 
            });
            console.log(`ICE candidate enviado de ${socket.id} para ${data.to} na sala ${room}`);
        });

        socket.on('disconnect', () => {
            console.log('Usuário desconectado:', socket.id);
        });

        socket.on('data-share-init', ({ targetUser, shareType, merito, userName }) => {
        const room = getRoomName({ merito });
        socket.to(room).to(targetUser).emit('data-share-request', {
            from: socket.id,
            user: userName,  // Enviado pelo cliente
            shareType,
            merito
        });
        });
        
        socket.on('data-share-accept', ({ to, shareType }) => {
            socket.to(to).emit('data-share-ready', {
                from: socket.id,
                user: usuarioLogado?.nome,
                shareType
            });
        });
    });
};

// Função auxiliar para determinar o nome da sala
function getRoomName({ cardId, jogoId, timeId, liveId, inviteCode, merito = 'visitante' }) {
    if (inviteCode) return `invite-${inviteCode}`;
    if (jogoId) return `jogo-${jogoId}-${merito}`;
    if (timeId) return `time-${timeId}-${merito}`;
    if (liveId) return `live-${liveId}-${merito}`;
    return `${cardId}-${merito}`;
}
*/
// src/sockets/sockets.js
import { Chat } from '../models/index.js';

export const setupSocket = (io) => {
    // ===== CONTROLE DE SALAS ATIVAS =====
    const salasAtivas = {}; // { 'live-123': { nome: 'Live #123', usuarios: 5 } }

    // === FUNÇÕES AUXILIARES ===
    const formatarNomeSala = (room) => {
        if (room.startsWith('live-')) return `Live #${room.split('-')[1]}`;
        if (room.startsWith('jogo-')) return `Jogo #${room.split('-')[1]}`;
        if (room.startsWith('time-')) return `Time #${room.split('-')[1]}`;
        if (room.startsWith('invite-')) return `Convite ${room.split('-')[1].slice(0, 6)}...`;
        if (room.includes('-')) return room.split('-').slice(0, -1).join(' ');
        return room;
    };

    const atualizarSala = (room) => {
        const adapterRoom = io.sockets.adapter.rooms.get(room);
        const count = adapterRoom ? adapterRoom.size : 0;

        if (count === 0) {
            delete salasAtivas[room];
        } else {
            if (!salasAtivas[room]) {
                salasAtivas[room] = { nome: formatarNomeSala(room), usuarios: 0 };
            }
            salasAtivas[room].usuarios = count;
        }

        // Notifica todos os clientes (chat global)
        io.emit('room-user-count', { room, count });
    };

    const entrarNaSala = (socket, room, user, merito) => {
        if (!room || typeof room !== 'string') return;
        socket.join(room);
        atualizarSala(room);
        console.log(`[JOIN] ${user || 'Visitante'} entrou em ${room} (ID: ${socket.id})`);
    };

    const sairDaSala = (socket, room) => {
        if (!room) return;
        socket.leave(room);
        atualizarSala(room);
        console.log(`[LEAVE] ${socket.id} saiu de ${room}`);
    };

    const isValidId = (id) => typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
    const isValidMerito = (merito) => !merito || (typeof merito === 'number' && merito >= 0);

    const getRoomName = ({ cardId, jogoId, timeId, liveId, inviteCode, merito = 'visitante' }) => {
        if (inviteCode && isValidId(inviteCode)) return `invite-${inviteCode}`;
        if (jogoId && isValidId(jogoId)) return `jogo-${jogoId}-${merito}`;
        if (timeId && isValidId(timeId)) return `time-${timeId}-${merito}`;
        if (liveId && isValidId(liveId)) return `live-${liveId}-${merito}`;
        if (cardId && isValidId(cardId)) return `${cardId}-${merito}`;
        return null;
    };

    // ===== CONEXÃO =====
    io.on('connection', (socket) => {
        console.log('Usuário conectado:', socket.id);

        // === JOIN GENÉRICO (TODAS AS ENTIDADES) ===
        const joinEvents = {
            'join-jogo': ({ jogoId, user, merito }) => {
                if (!isValidId(jogoId) || !isValidMerito(merito)) return;
                const room = `jogo-${jogoId}-${merito || 'visitante'}`;
                entrarNaSala(socket, room, user, merito);
            },
            'join-time': ({ timeId, user, merito }) => {
                if (!isValidId(timeId) || !isValidMerito(merito)) return;
                const room = `time-${timeId}-${merito || 'visitante'}`;
                entrarNaSala(socket, room, user, merito);
            },
            'join-live': ({ liveId, user, merito }) => {
                if (!isValidId(liveId) || !isValidMerito(merito)) return;
                const room = `live-${liveId}-${merito || 'visitante'}`;
                entrarNaSala(socket, room, user, merito);
            },
            'join-room': ({ cardId, user, merito }) => {
                if (!isValidId(cardId) || !isValidMerito(merito)) return;
                const room = `${cardId}-${merito || 'visitante'}`;
                entrarNaSala(socket, room, user, merito);
            },
            'join-invite': ({ inviteCode, user, merito }) => {
                if (!isValidId(inviteCode)) return;
                const room = `invite-${inviteCode}`;
                entrarNaSala(socket, room, user, merito);
                io.to(room).emit('user-joined-invite', { user, inviteCode });
            }
        };

        Object.entries(joinEvents).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        // === SAIR DA SALA ===
        socket.on('leave-room', ({ room }) => {
            sairDaSala(socket, room);
        });

        // === LISTA DE SALAS ATIVAS ===
        socket.on('request-rooms', () => {
            const lista = Object.fromEntries(
                Object.entries(salasAtivas).map(([room, info]) => [
                    room,
                    { nome: info.nome, usuarios: info.usuarios }
                ])
            );
            socket.emit('rooms-list', lista);
        });

        // === CHAT DE TEXTO (COM PERSISTÊNCIA) ===
        socket.on('chat-message', async (data) => {
            const room = getRoomName(data);
            if (!room) return;

            const mensagem = {
                room,
                cardId: data.cardId,
                jogoId: data.jogoId,
                timeId: data.timeId,
                liveId: data.liveId,
                inviteCode: data.inviteCode,
                usuario: data.user || data.usuario || 'Anônimo',
                mensagem: data.message || data.mensagem,
                data: new Date().toISOString(),
                merito: data.merito,
                socketId: socket.id
            };

            try {
                await Chat.create({
                    room,
                    usuario: mensagem.usuario,
                    mensagem: mensagem.mensagem,
                    data: new Date(mensagem.data)
                });
            } catch (err) {
                console.error('Erro ao salvar mensagem no banco:', err);
            }

            io.to(room).emit('chat-message', mensagem);
            console.log(`[CHAT] ${mensagem.usuario}: ${mensagem.mensagem} → ${room}`);
        });

        // === WEBRTC SIGNALING (VOZ, VÍDEO, DATA) ===
        ['offer', 'answer', 'ice-candidate'].forEach(event => {
            socket.on(event, (data) => {
                const room = getRoomName(data);
                if (!room || !data.to) return;

                socket.to(room).to(data.to).emit(event, {
                    ...data,
                    from: socket.id
                });
                console.log(`[WEBRTC] ${event} de ${socket.id} → ${data.to} em ${room}`);
            });
        });

        // === VOZ / DATA SHARE (EVENTOS DE ENTRADA) ===
        socket.on('voice-join', (data) => {
            const room = getRoomName(data);
            if (room) io.to(room).emit('voice-join', { ...data, from: socket.id });
        });

        socket.on('voice-leave', (data) => {
            const room = getRoomName(data);
            if (room) io.to(room).emit('voice-leave', { ...data, from: socket.id });
        });

        socket.on('data-share-join', (data) => {
            const room = getRoomName(data);
            if (room) io.to(room).emit('data-share-join', { ...data, from: socket.id });
        });

        // === DATA SHARE REQUEST (1:1) ===
        socket.on('data-share-init', ({ targetUser, shareType, merito, userName }) => {
            const room = getRoomName({ merito });
            if (!room || !targetUser) return;

            socket.to(room).to(targetUser).emit('data-share-request', {
                from: socket.id,
                user: userName,
                shareType,
                merito
            });
        });

        socket.on('data-share-accept', ({ to, shareType }) => {
            if (!to) return;
            socket.to(to).emit('data-share-ready', {
                from: socket.id,
                shareType
            });
        });

        // === DESCONEXÃO ===
        socket.on('disconnect', () => {
            console.log('Usuário desconectado:', socket.id);

            // Atualiza todas as salas que o usuário estava
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    atualizarSala(room);
                }
            }
        });
        
        /*
        
        // Dentro de io.on('connection')
          socket.on('join-room', async ({ room, user, merito }) => {
              socket.join(room);
              atualizarSala(room);
              io.to(room).emit('user-joined-room', { socketId: socket.id, user, room });
              
              // Enviar histórico
              const history = await Chat.find({ room }).sort({ data: 1 }).limit(50);
              socket.emit('chat-history', history.map(m => ({
                  room: m.room,
                  usuario: m.usuario,
                  mensagem: m.mensagem,
                  data: m.data,
                  socketId: 'history'
              })));
          });
          */
          socket.on('leave-room', ({ room }) => {
              socket.leave(room);
              io.to(room).emit('user-left-room', { socketId: socket.id, room });
              atualizarSala(room);
          });
          
          socket.on('request-chat-history', async ({ room }) => {
              const history = await Chat.find({ room }).sort({ data: 1 }).limit(50);
              socket.emit('chat-history', history.map(m => ({
                  room: m.room,
                  usuario: m.usuario,
                  mensagem: m.mensagem,
                  data: m.data,
                  socketId: 'history'
              })));
          });
          
          socket.on('chat-message', async (data) => {
              const room = data.room || getRoomName(data);
              if (!room) return;
          
              const mensagem = {
                  room,
                  usuario: data.usuario,
                  mensagem: data.mensagem,
                  data: new Date(),
                  socketId: socket.id
              };
          
              await Chat.create(mensagem);
              io.to(room).emit('chat-message', mensagem);
          });
          
          
          
          /////////
          /////////
          /////////
          
          socket.on('create-room', ({ room, nome, criador }) => {
                    if (!room || !nome) return;
                
                    // Adiciona à lista global de salas ativas
                    salasAtivas[room] = {
                        nome: nome,
                        usuarios: 1,
                        criador: criador
                    };
                
                    // Notifica todos os clientes
                    io.emit('room-created', { room, info: salasAtivas[room] });
                
                    // O criador entra automaticamente
                    socket.join(room);
                    atualizarSala(room);
                
                    console.log(`[CRIAR SALA] ${criador} criou ${room} → ${nome}`);
                });
          /////////
          /////////
          
          
          // === NOVOS EVENTS PARA APOSTAS (ADICIONAR APÓS CHAT-MESSAGE) ===
socket.on('nova-aposta', async (data) => {
    const room = `${data.cardId}-apostas-${data.merito || 'visitante'}`;
    io.to(room).emit('nova-aposta', { cardId: data.cardId, aposta: data.aposta, sala: data.sala });
    console.log(`[APOSTAS] Nova aposta em ${room}: ${data.aposta.titulo}`);
});

socket.on('participar-aposta', async (data) => {
    const room = `${data.cardId}-apostas-${data.merito}`;
    io.to(room).emit('aposta-atualizada', { cardId: data.cardId, apostaId: data.apostaId, updates: { participantes: data.participantes } });
    console.log(`[APOSTAS] Participação em ${room}`);
});

socket.on('encerrar-aposta', async (data) => {
    const room = `${data.cardId}-apostas-${data.merito}`;
    io.to(room).emit('aposta-encerrada', { cardId: data.cardId, apostaId: data.apostaId, opcaoVencedora: data.opcaoVencedora });
    console.log(`[APOSTAS] Aposta encerrada em ${room}`);
});

socket.on('enviar-comprovante-aposta', async (data) => {
    const room = `${data.cardId}-apostas-${data.merito}`;
    io.to(room).emit('comprovante-enviado-aposta', data);
    console.log(`[APOSTAS] Comprovante enviado em ${room}`);
});

// === NOVOS EVENTS PARA DESAFIOS (SIMÉTRICOS) ===
socket.on('nova-desafio', async (data) => {
    const room = `${data.cardId}-desafios-${data.merito || 'visitante'}`;
    io.to(room).emit('nova-desafio', { cardId: data.cardId, desafio: data.desafio, sala: data.sala });
    console.log(`[DESAFIOS] Novo desafio em ${room}: ${data.desafio.titulo}`);
});

socket.on('participar-desafio', async (data) => {
    const room = `${data.cardId}-desafios-${data.merito}`;
    io.to(room).emit('desafio-atualizado', { cardId: data.cardId, desafioId: data.desafioId, updates: { participantes: data.participantes } });
    console.log(`[DESAFIOS] Participação em ${room}`);
});

socket.on('encerrar-desafio', async (data) => {
    const room = `${data.cardId}-desafios-${data.merito}`;
    io.to(room).emit('desafio-encerrado', { cardId: data.cardId, desafioId: data.desafioId, opcaoVencedora: data.opcaoVencedora });
    console.log(`[DESAFIOS] Desafio encerrado em ${room}`);
});

socket.on('enviar-comprovante-desafio', async (data) => {
    const room = `${data.cardId}-desafios-${data.merito}`;
    io.to(room).emit('comprovante-enviado-desafio', data);
    console.log(`[DESAFIOS] Comprovante enviado em ${room}`);
});

// === JOIN ROOM ATUALIZADO (ADICIONAR OU EXPANDIR O EXISTENTE PARA TIPO) ===
socket.on('join-room', ({ cardId, tipo, user, merito }) => {  // Expande o existente com 'tipo'
    const room = `${cardId}-${tipo || ''}-${merito || 'visitante'}`;
    socket.join(room);
    console.log(`Usuário ${user || 'Visitante'} (${socket.id}) entrou na sala ${room} (${tipo || 'geral'})`);
    // Chama o existente se não tem tipo
    if (!tipo) {
        const oldRoom = `${cardId}-${merito || 'visitante'}`;
        socket.join(oldRoom);
        console.log(`Fallback: Entrou em ${oldRoom}`);
    }
});


    });

    // === LIMPEZA PERIÓDICA DE SALAS VAZIAS ===
    setInterval(() => {
        for (const room of io.sockets.adapter.rooms.keys()) {
            if (room !== io.sockets.adapter.sids.get(room)?.id) {
                atualizarSala(room);
            }
        }
    }, 10000);
};