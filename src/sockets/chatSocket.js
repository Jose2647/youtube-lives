// src/sockets/chatSocket.js
import { Chat } from '../models/index.js';

export const setupChatSocket = (io) => {
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
        console.log('Usuário conectado (Chat):', socket.id);
        


          socket.on('request-peers', ({ room }) => {
            const roomSet = io.sockets.adapter.rooms.get(room);
            if (!roomSet) return;
            const peers = Array.from(roomSet).filter(id => id !== socket.id);
            socket.emit('peers-list', peers);
          });


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
            console.log('Usuário desconectado (Chat):', socket.id);

            // Atualiza todas as salas que o usuário estava
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    atualizarSala(room);
                }
            }
        });
        
        // === HISTÓRICO DE CHAT ===
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

        // === CRIAR SALA ===
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