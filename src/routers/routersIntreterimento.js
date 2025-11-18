import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Invite } from '../models/models.js';
//import { montarEstruturaJogos, popularMongoDBComDadosFakes } from '../services/index.js';
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
// index.js - Adicionar esta rota
// Rota para histórico de chat do jogo
router.get('/chat-jogo/:jogoId/historico', async (req, res) => {
    try {
        const jogoId = parseInt(req.params.jogoId);
        const salaId = `jogo-${jogoId}`;
        
        const historico = await Chat.find({ room: salaId })
            .sort({ data: -1 })
            .limit(100);
        
        res.json(historico);
    } catch (err) {
        res.status(500).json({ error: err.message });
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








// Rota principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;