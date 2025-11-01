import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Invite } from '../models/index.js';
import { montarEstruturaJogos, popularMongoDBComDadosFakes } from '../services/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// ===== ROTAS PÚBLICAS =====

// === MIDDLEWARE AUTH OPCIONAL (NOVO - PARA PONTOS/DINHEIRO) ===
const authOptional = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;  // { userId }
        } catch (e) {
            return res.status(400).json({ msg: 'Token inválido' });
        }
    } else {
        req.user = { userId: null, nome: 'Anônimo', merito: 0 };  // Fallback anônimo
    }
    next();
};

// Rota para obter estrutura completa dos jogos
router.get('/jogos-completos', async (req, res) => {
    try {
        const jogosCompletos = await montarEstruturaJogos();
        res.send(jogosCompletos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Apostas
router.get('/apostas', async (req, res) => {
    try {
        const apostas = await Aposta.find();
        res.send(apostas);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Desafios
router.get('/desafios', async (req, res) => {
    try {
        const desafios = await Desafio.find();
        res.send(desafios);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Chats
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find();
        res.send(chats);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Jogos (apenas dados básicos)
router.get('/jogos', async (req, res) => {
    try {
        const jogosCompletos = await montarEstruturaJogos();
        console.log("jogosCompletos", jogosCompletos);
        res.send(jogosCompletos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Notificacoes
router.get('/notificacoes', async (req, res) => {
    try {
        const notificacoes = await Notificacao.find();
        res.send(notificacoes);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Routes for Eventos
router.get('/eventos', async (req, res) => {
    try {
        const eventos = await Evento.find();
        res.send(eventos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para popular dados
router.get('/populate-fake-data', async (req, res) => {
    try {
        const result = await popularMongoDBComDadosFakes();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao popular dados: ' + error.message
        });
    }
});
// Login Route
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const user = await User.findOne({ usuario });
        if (!user || !await bcrypt.compare(senha, user.senha)) {
            return res.status(401).send('Credenciais inválidas');
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.send({ token, user });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// ===== ROTAS ESPECÍFICAS POR ID =====
// Rota para um jogo específico
router.get('/jogo/:jogoId', async (req, res) => {
    try {
        const jogoId = parseInt(req.params.jogoId);
        const jogo = await Jogo.findOne({ id: jogoId });
        if (!jogo) {
            return res.status(404).send('Jogo não encontrado');
        }
        // Opcional: Carregar estrutura completa (estádios, times, lives) como em montarEstruturaJogos
        const jogosCompletos = await montarEstruturaJogos();
        const jogoCompleto = jogosCompletos.find(j => j.id === jogoId);
        res.send(jogoCompleto || jogo);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para um time específico
/*
router.get('/time/:timeId', async (req, res) => {
    try {
        const timeId = parseInt(req.params.timeId);
        const time = await Time.findOne({ id: timeId });
        if (!time) {
            return res.status(404).send('Time não encontrado');
        }
        // Opcional: Carregar lives associadas
        const lives = await Live.find({ timeId });
        res.send({ ...time.toObject(), lives });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
*/
// Rota para time com suporte a parâmetros de chat
router.get('/time/:timeId', async (req, res) => {
    const { jogo, estadio, chat, nome } = req.query; // Captura os parâmetros
    const timeId = parseInt(req.params.timeId);
    
    // Sua lógica existente aqui...
    const time = await Time.findOne({ id: timeId });
    if (!time) {
        return res.status(404).send('Time não encontrado');
    }
    
    // Os parâmetros ficam disponíveis no frontend via URL
    res.send({ 
        ...time.toObject(), 
        // mantém existing code...
    });
});
// Rota para uma live específica
router.get('/live/:liveId', async (req, res) => {
    try {
        const liveId = parseInt(req.params.liveId);
        const live = await Live.findOne({ id: liveId });
        if (!live) {
            return res.status(404).send('Live não encontrada');
        }
        // Opcional: Carregar divs horizontais e cards
        const divsHorizontais = await DivHorizontal.find({ liveId });
        const cards = await Card.find({ divHorizontalId: { $in: divsHorizontais.map(d => d.id) } });
        res.send({ ...live.toObject(), divsHorizontais, cards });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para uma aposta específica
router.get('/aposta/:cardId', async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const aposta = await Aposta.findOne({ cardId });
        if (!aposta) {
            return res.status(404).send('Aposta não encontrada');
        }
        res.send(aposta);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para um desafio específico
router.get('/desafio/:cardId', async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const desafio = await Desafio.findOne({ cardId });
        if (!desafio) {
            return res.status(404).send('Desafio não encontrado');
        }
        res.send(desafio);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// ===== SISTEMA DE CONVITES =====

// Rota para gerar um link de convite (requer autenticação)
router.post('/generate-invite', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).send('Autenticação necessária');

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const { jogoId, estadioId, timeId, liveId } = req.body; // Suporta todos os IDs
        const inviteCode = uuidv4();

        await Invite.create({
            inviteCode,
            creatorId: user.id,
            invitedUserId: null,
            jogoId: jogoId || null,
            estadioId: estadioId || null,
            timeId: timeId || null,
            liveId: liveId || null
        });

        const inviteLink = `http://localhost:3000/invite/${inviteCode}`;
        res.json({ inviteLink });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para processar o link de convite
router.get('/invite/:inviteCode', async (req, res) => {
    try {
        const inviteCode = req.params.inviteCode;
        const invite = await Invite.findOne({ inviteCode });
        if (!invite) {
            return res.status(404).send('Convite inválido');
        }

        // Servir a página inicial da aplicação
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Rota para registrar o uso do convite (quando o usuário se registra)
router.post('/register-via-invite', async (req, res) => {
    try {
        const { inviteCode, usuario, senha, email, nome } = req.body;
        const invite = await Invite.findOne({ inviteCode });
        if (!invite || invite.invitedUserId) {
            return res.status(400).send('Convite inválido ou já usado');
        }

        // Criar novo usuário
        const userId = (await User.countDocuments()) + 1; // Simples incremento para ID
        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUser = await User.create({
            id: userId,
            nome,
            usuario,
            email,
            senha: hashedPassword,
            contaBancaria: '',
            chavePix: '',
            merito: 0,
            desafiosCumpridos: 0,
            desafiosFalhados: 0,
            pagamentosRealizados: 0,
            pagamentosPendentes: 0,
            amigos: [],
            imagem: 'default-usuario.png'
        });

        // Atualizar o convite com o invitedUserId
        invite.invitedUserId = newUser.id;
        invite.usedAt = new Date();
        await invite.save();

        // Gerar token JWT para o novo usuário
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: newUser });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// === ROTAS PARA SALAS (CORRIGIDAS - ADICIONAR APÓS CONVITES) ===
// GET: Buscar/Criar sala (auth opcional)
router.get('/sala/:cardId/:tipo', authOptional, async (req, res) => {
    try {
        const { cardId, tipo } = req.params;
        const Model = tipo === 'apostas' ? Aposta : Desafio;
        let sala = await Model.findOne({ cardId });
        if (!sala) {
            sala = new Model({
                cardId,
                [tipo]: [],
                criador: req.user.nome || 'Anônimo',
                dataCriacao: new Date()
            });
            await sala.save();
        }
        // Filtra por mérito (loop manual sem await no callback)
        const userMerito = req.user.merito || 0;
        const itensFiltrados = [];
        for (const item of sala[tipo]) {
            const criadorItem = await User.findOne({ id: item.criador }).select('merito');
            if (criadorItem && criadorItem.merito === userMerito) {
                itensFiltrados.push(item);
            }
        }
        res.json({ ...sala.toObject(), [tipo]: itensFiltrados });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// POST: Criar item (auth opcional, mas obrigatório para 'dinheiro')
router.post('/sala/:cardId/:tipo', authOptional, async (req, res) => {
    try {
        const { cardId, tipo } = req.params;
        const itemData = req.body;  // { ..., tipoPagamento: 'pontos' | 'dinheiro' }
        const Model = tipo === 'apostas' ? Aposta : Desafio;

        // Se 'dinheiro', exige auth e validações extras
        if (itemData.tipoPagamento === 'dinheiro') {
            if (!req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para apostas com dinheiro' });
            const user = await User.findById(req.user.userId);
            if (!user.contaBancaria || !user.chavePix) return res.status(400).json({ msg: 'Conta bancária/Pix obrigatória para dinheiro' });
            if (itemData.valor > user.merito * 10) {  // Ex.: mérito em pontos converte para R$, ajuste lógica
                return res.status(400).json({ msg: 'Saldo insuficiente para aposta em dinheiro' });
            }
            user.merito -= itemData.valor / 10;  // Exemplo de conversão
            await user.save();
        } else {  // Pontos: anônimo ok, sem dedução
            if (req.user.userId) {
                const user = await User.findById(req.user.userId);
                if (itemData.valor > user.merito) return res.status(400).json({ msg: 'Saldo insuficiente em pontos' });
                user.merito -= itemData.valor;
                await user.save();
            }
        }

        let sala = await Model.findOne({ cardId });
        if (!sala) {
            sala = new Model({ cardId, [tipo]: [], criador: req.user.nome || 'Anônimo', dataCriacao: new Date() });
        }
        const novoItem = {
            id: sala[tipo].length + 1,
            ...itemData,
            status: tipo === 'apostas' ? 'aberta' : 'aberto',
            dataCriacao: new Date(),
            criador: req.user.userId || req.user.nome || 'Anônimo'
        };
        sala[tipo].push(novoItem);
        await sala.save();

        // Emit socket (se req.io configurado)
        if (req.io) {
            const room = `${cardId}-${tipo}-${req.user.merito || 0}`;
            const eventName = tipo === 'apostas' ? 'nova-aposta' : 'nova-desafio';
            req.io.to(room).emit(eventName, { cardId, [tipo === 'apostas' ? 'aposta' : 'desafio']: novoItem, sala });
        }

        res.json({ msg: `${tipo} criado (${itemData.tipoPagamento || 'pontos'})`, sala });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// PUT: Atualizar (similar, com check 'dinheiro')
router.put('/sala/:cardId/:tipo/:itemId', authOptional, async (req, res) => {
    try {
        const { cardId, tipo, itemId } = req.params;
        const updateData = req.body;
        const Model = tipo === 'apostas' ? Aposta : Desafio;
        const sala = await Model.findOne({ cardId });
        if (!sala) return res.status(404).json({ msg: 'Sala não encontrada' });

        const itemIndex = sala[tipo].findIndex(i => i.id === parseInt(itemId));
        if (itemIndex === -1) return res.status(404).json({ msg: 'Item não encontrado' });

        const item = sala[tipo][itemIndex];
        const userMerito = req.user.merito || 0;

        // Participar: Check mérito criador + saldo (pontos ou dinheiro)
        if (updateData.opcao) {
            const criadorItem = await User.findOne({ id: item.criador }).select('merito');
            if (criadorItem && criadorItem.merito !== userMerito) return res.status(400).json({ msg: 'Mérito incompatível' });
            if (item.tipoPagamento === 'dinheiro' && !req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para dinheiro' });
            const user = req.user.userId ? await User.findById(req.user.userId) : null;
            if (user && item.valor > (item.tipoPagamento === 'dinheiro' ? user.merito * 10 : user.merito)) {
                return res.status(400).json({ msg: `Saldo insuficiente (${item.tipoPagamento})` });
            }
            if (user) {
                user.merito -= item.valor / (item.tipoPagamento === 'dinheiro' ? 10 : 1);
                await user.save();
            }
            item.participantes.push({
                usuario: req.user.userId || req.user.nome || 'Anônimo',
                opcao: updateData.opcao,
                data: new Date()
            });
        }

        // Encerrar: Distribui mérito (sem mudanças, pois creator já validado)
        if (updateData.opcaoVencedora) {
            item.opcaoVencedora = updateData.opcaoVencedora;
            item.status = tipo === 'apostas' ? 'encerrada' : 'encerrado';
            const participantes = item.participantes;
            const vencedores = participantes.filter(p => p.opcao === item.opcaoVencedora);
            const totalPremio = item.valor * participantes.length;
            for (const vencedor of vencedores) {
                const userVencedor = await User.findOne({ id: vencedor.usuario });
                if (userVencedor) {
                    const premioPorUser = totalPremio / vencedores.length;
                    userVencedor.merito += item.tipoPagamento === 'dinheiro' ? premioPorUser / 10 : premioPorUser;  // Converte se dinheiro
                    await userVencedor.save();
                }
            }
        }

        // Comprovante (só para dinheiro)
        if (updateData.comprovante && item.tipoPagamento === 'dinheiro') {
            if (!req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para comprovante' });
            item.comprovantes = item.comprovantes || [];
            item.comprovantes.push({
                usuario: req.user.userId,
                comprovante: updateData.comprovante,
                data: new Date(),
                status: 'pendente'
            });
        }

        sala[tipo][itemIndex] = { ...item, ...updateData };
        await sala.save();

        if (req.io) {
            const room = `${cardId}-${tipo}-${userMerito}`;
            const eventName = tipo === 'apostas' ? 'aposta-atualizada' : 'desafio-atualizado';
            req.io.to(room).emit(eventName, { cardId, itemId, updates: updateData, sala });
        }

        res.json({ msg: `${tipo} atualizado`, sala });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});
// Exemplo de consulta para hierarquia de convites
router.get('/invite-hierarchy', async (req, res) => {
    try {
        const invites = await Invite.find().populate('creatorId invitedUserId', 'nome usuario');
        res.json(invites);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// ===== ROTAS ADICIONAIS =====
// Rota POST para popular dados (mantida para compatibilidade)
router.post('/populate-fake-data', async (req, res) => {
    try {
        const result = await popularMongoDBComDadosFakes();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao popular dados: ' + error.message
        });
    }
});
// Rota principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;