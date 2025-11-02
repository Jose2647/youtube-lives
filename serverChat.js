// chat-server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const PORT = 3001;

// Configuração do CORS para permitir conexões de qualquer origem
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

// Configuração do Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
});


const chatSchema = new mongoose.Schema({
    room: { type: String, required: true, index: true }, // ex: "live-1-visitante"
    usuario: { type: String, required: true },
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatdb';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado ao MongoDB'))
    .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// Estado do servidor
const salasAtivas = {};
const usuariosConectados = new Map();

// ===== SISTEMA DE CHAT POR JOGO =====
io.on('connection', (socket) => {
    console.log('🔗 Novo usuário conectado:', socket.id);

    // === JOIN JOGO CHAT ===
    socket.on('join-jogo-chat', async (data) => {
        const { jogoId, salaId, usuario } = data;
        
        // Entrar na sala
        socket.join(salaId);
        
        // Registrar usuário
        usuariosConectados.set(socket.id, { usuario, salaId });
        
        // Atualizar sala ativa
        if (!salasAtivas[salaId]) {
            salasAtivas[salaId] = {
                nome: `Jogo ${jogoId}`,
                usuarios: new Set(),
                tipo: 'jogo-chat',
                jogoId: jogoId
            };
        }
        
        salasAtivas[salaId].usuarios.add(usuario);
        
        // Notificar outros usuários
        socket.to(salaId).emit('chat-jogo-users-update', {
            salaId,
            users: Array.from(salasAtivas[salaId].usuarios)
        });
        
        // Enviar lista atualizada para o novo usuário
        socket.emit('chat-jogo-users-update', {
            salaId,
            users: Array.from(salasAtivas[salaId].usuarios)
        });
        
        console.log(`[CHAT JOGO] ${usuario} entrou na sala ${salaId}`);
    });

    // === LEAVE JOGO CHAT ===
    socket.on('leave-jogo-chat', (data) => {
        const { salaId, usuario } = data;
        
        socket.leave(salaId);
        
        const userInfo = usuariosConectados.get(socket.id);
        if (userInfo) {
            usuariosConectados.delete(socket.id);
        }
        
        if (salasAtivas[salaId]) {
            salasAtivas[salaId].usuarios.delete(usuario);
            
            // Se não há mais usuários, remover sala
            if (salasAtivas[salaId].usuarios.size === 0) {
                delete salasAtivas[salaId];
            } else {
                // Notificar usuários restantes
                socket.to(salaId).emit('chat-jogo-users-update', {
                    salaId,
                    users: Array.from(salasAtivas[salaId].usuarios)
                });
            }
        }
        
        console.log(`[CHAT JOGO] ${usuario} saiu da sala ${salaId}`);
    });

    // === CHAT JOGO MESSAGE ===
    socket.on('chat-jogo-message', async (data) => {
        const { salaId, mensagem, usuario, jogoId } = data;
        
        const messageData = {
            salaId,
            usuario,
            mensagem,
            data: new Date().toISOString(),
            jogoId
        };
        
        // Salvar no banco
        try {
            await Chat.create({
                room: salaId,
                usuario: usuario,
                mensagem: mensagem,
                data: new Date(),
                jogoId: jogoId,
                tipo: 'jogo'
            });
        } catch (err) {
            console.error('Erro ao salvar mensagem do jogo:', err);
        }
        
        // Enviar para todos na sala
        io.to(salaId).emit('chat-jogo-message', messageData);
        
        console.log(`[CHAT JOGO] ${usuario} em ${salaId}: ${mensagem}`);
    });

    // === REQUEST CHAT HISTORY ===
    socket.on('request-jogo-chat-history', async (data) => {
        const { salaId } = data;
        
        try {
            const history = await Chat.find({ room: salaId })
                .sort({ data: 1 })
                .limit(50);
            
            socket.emit('chat-jogo-history', {
                salaId,
                messages: history.map(m => ({
                    salaId: m.room,
                    usuario: m.usuario,
                    mensagem: m.mensagem,
                    data: m.data,
                    jogoId: m.jogoId
                }))
            });
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            socket.emit('chat-error', { error: 'Erro ao carregar histórico' });
        }
    });

    // === WEBRTC PARA CHAT DE VOZ ===
    socket.on('join-voice-chat', (data) => {
        const { salaId, usuario } = data;
        
        // Notificar outros usuários na sala
        socket.to(salaId).emit('user-joined-voice', {
            salaId,
            usuario,
            socketId: socket.id
        });
        
        console.log(`[VOZ JOGO] ${usuario} entrou no chat de voz em ${salaId}`);
    });

    socket.on('leave-voice-chat', (data) => {
        const { salaId, usuario } = data;
        
        socket.to(salaId).emit('user-left-voice', {
            salaId,
            usuario
        });
        
        console.log(`[VOZ JOGO] ${usuario} saiu do chat de voz em ${salaId}`);
    });

    // === WEBRTC SIGNALING ===
    socket.on('webrtc-offer', (data) => {
        socket.to(data.to).emit('webrtc-offer', {
            ...data,
            from: socket.id
        });
    });

    socket.on('webrtc-answer', (data) => {
        socket.to(data.to).emit('webrtc-answer', {
            ...data,
            from: socket.id
        });
    });

    socket.on('webrtc-ice-candidate', (data) => {
        socket.to(data.to).emit('webrtc-ice-candidate', {
            ...data,
            from: socket.id
        });
    });

    // === STATUS E INFO ===
    socket.on('get-room-info', (data) => {
        const { salaId } = data;
        const sala = salasAtivas[salaId];
        
        if (sala) {
            socket.emit('room-info', {
                salaId,
                usuarios: Array.from(sala.usuarios),
                totalUsuarios: sala.usuarios.size
            });
        }
    });

    socket.on('get-active-rooms', () => {
        const roomsInfo = Object.entries(salasAtivas).map(([salaId, info]) => ({
            salaId,
            nome: info.nome,
            usuarios: Array.from(info.usuarios),
            totalUsuarios: info.usuarios.size,
            jogoId: info.jogoId
        }));
        
        socket.emit('active-rooms', roomsInfo);
    });

    // === DISCONNECT ===
    socket.on('disconnect', () => {
        console.log('🔌 Usuário desconectado:', socket.id);
        
        const userInfo = usuariosConectados.get(socket.id);
        if (userInfo) {
            const { usuario, salaId } = userInfo;
            
            // Remover usuário da sala
            if (salasAtivas[salaId]) {
                salasAtivas[salaId].usuarios.delete(usuario);
                
                // Notificar outros usuários
                socket.to(salaId).emit('chat-jogo-users-update', {
                    salaId,
                    users: Array.from(salasAtivas[salaId].usuarios)
                });
                
                // Remover sala se estiver vazia
                if (salasAtivas[salaId].usuarios.size === 0) {
                    delete salasAtivas[salaId];
                }
            }
            
            usuariosConectados.delete(socket.id);
            console.log(`[CHAT JOGO] ${usuario} desconectado da sala ${salaId}`);
        }
    });

    // === ERROR HANDLING ===
    socket.on('error', (error) => {
        console.error('❌ Erro no socket:', error);
    });
});

// Rotas HTTP para monitoramento
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        connectedUsers: usuariosConectados.size,
        activeRooms: Object.keys(salasAtivas).length,
        rooms: Object.entries(salasAtivas).map(([salaId, info]) => ({
            salaId,
            nome: info.nome,
            usuarios: Array.from(info.usuarios),
            totalUsuarios: info.usuarios.size
        }))
    });
});

app.get('/room/:salaId', (req, res) => {
    const { salaId } = req.params;
    const sala = salasAtivas[salaId];
    
    if (sala) {
        res.json({
            salaId,
            nome: sala.nome,
            usuarios: Array.from(sala.usuarios),
            totalUsuarios: sala.usuarios.size,
            jogoId: sala.jogoId
        });
    } else {
        res.status(404).json({ error: 'Sala não encontrada' });
    }
});

app.get('/history/:salaId', async (req, res) => {
    const { salaId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    try {
        const history = await Chat.find({ room: salaId })
            .sort({ data: -1 })
            .limit(limit);
        
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor de Chat rodando na porta ${PORT}`);
    console.log(`📡 Socket.IO ouvindo conexões`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Desligando servidor de chat...');
    
    // Fechar todas as conexões Socket.IO
    io.close();
    
    // Fechar conexão com MongoDB
    await mongoose.connection.close();
    
    console.log('✅ Servidor de chat desligado');
    process.exit(0);
});