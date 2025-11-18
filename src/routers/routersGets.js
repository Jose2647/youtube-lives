import express from 'express';
import { User, Aposta, Desafio, Chat, Notificacao, Evento, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Invite } from '../models/models.js';
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
/*
// Routes for Jogos (apenas dados básicos)
router.get('/jogos', async (req, res) => {
    try {
        const jogosCompletos = await montarEstruturaJogos();
        //console.log("jogosCompletos", jogosCompletos);
        res.send(jogosCompletos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
*/
/*

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
*/
/*
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
*/
// Rota para um time específico
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



// Rota principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;