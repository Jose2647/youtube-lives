import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento } from '../models/index.js';
import { montarEstruturaJogos, popularMongoDBComDadosFakes } from '../services/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// ===== ROTAS PÚBLICAS =====
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
        console.log("jogosCompletos",jogosCompletos)
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
// ===== ROTA PARA POPULAR DADOS FAKES =====
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

// Rota principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

export default router;


novas funcionalidades
///////_____________________
///////_____________________
///////_____________________
///////_____________________
///////_____________________
import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer } from '../models/index.js';
import { montarEstruturaJogos, popularMongoDBComDadosFakes } from '../services/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

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
// Rotas existentes (mantidas como no original)
router.get('/jogos-completos', async (req, res) => {
    try {
        const jogosCompletos = await montarEstruturaJogos();
        res.send(jogosCompletos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ... (outras rotas como /users, /apostas, /desafios, /chats, /notificacoes, /eventos, /login, /populate-fake-data, etc.)

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default router;


novas funcionalidades
//////_____________________
//////_____________________
//////_____________________
//////_____________________
//////_____________________
//////_____________________

import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Invite } from '../models/index.js';
import { montarEstruturaJogos, popularMongoDBComDadosFakes } from '../services/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Importar UUID
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// Rota para gerar um link de convite (requer autenticação)
router.post('/generate-invite', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).send('Autenticação necessária');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        const inviteCode = uuidv4(); // Gerar código único
        await Invite.create({
            inviteCode,
            creatorId: user.id,
            invitedUserId: null
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

// ... (manter todas as rotas existentes: /jogo/:jogoId, /time/:timeId, /aposta/:cardId, etc.)

export default router;



// Exemplo de consulta para hierarquia
router.get('/invite-hierarchy', async (req, res) => {
    try {
        const invites = await Invite.find().populate('creatorId invitedUserId', 'nome usuario');
        res.json(invites);
    } catch (err) {
        res.status(500).send(err.message);
    }
});