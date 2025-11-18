// src/routers/authRoutes.js

import express from 'express';
import { User, Invite } from '../models/models.js'; // Importe apenas os models necessários
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Você precisa do segredo JWT aqui também

///////////
///////////
///////////
///////////
// Rota para registrar o uso do convite (Modificada para usar Email)
router.post('/register-via-invite', async (req, res) => {
    try {
        const { inviteCode, senha, email, nome } = req.body; // <-- 'usuario' removido
        const invite = await Invite.findOne({ inviteCode });
        if (!invite || invite.invitedUserId) {
            return res.status(400).send('Convite inválido ou já usado');
        }

        // (Adicionado) Validação de email duplicado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email já cadastrado.' });
        }

        // Criar novo usuário
        const userId = (await User.countDocuments()) + 1; // Simples incremento para ID
        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUser = await User.create({
            id: userId,
            nome,
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
// ===== SISTEMA DE CONVITES =====
// Rota para gerar um link de convite (requer autenticação)
/*
// Rota para gerar um link de convite (requer autenticação)
router.post('/generate-invite', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Autenticação necessária' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ id: decoded.userId });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const { jogoId, estadioId, timeId, liveId, sync = false } = req.body;
        const inviteCode = uuidv4();

        await Invite.create({
            inviteCode,
            creatorId: user.id,
            jogoId: jogoId || null,
            estadioId: estadioId || null,
            timeId: timeId || null,
            liveId: liveId || null,
            sync // ← agora salva a flag sync no banco!
        });

        // FORÇA SEMPRE O DOMÍNIO DE PRODUÇÃO
        const inviteLink = `https://youtube-lives.onrender.com/invite/${inviteCode}`;

        res.json({ 
            inviteCode,
            inviteLink 
        });

    } catch (err) {
        console.error('Erro generate-invite:', err);
        res.status(500).json({ message: err.message });
    }
});


// Rota para processar o link de convite - REDIRECIONAR para a aplicação principal

// Rota para processar o link de convite - REDIRECIONA com todos os parâmetros

router.get('/invite/:inviteCode', async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const invite = await Invite.findOne({ inviteCode });

        if (!invite) {
            return res.redirect('https://youtube-lives.onrender.com');
        }

        // Monta URL com todos os parâmetros necessários
        let url = 'https://youtube-lives.onrender.com/?invite=' + inviteCode;

        if (invite.jogoId) url += `&jogoId=${invite.jogoId}`;
        if (invite.estadioId) url += `&estadioId=${invite.estadioId}`;
        if (invite.timeId) url += `&timeId=${invite.timeId}`;
        if (invite.liveId) url += `&liveId=${invite.liveId}`;
        if (invite.sync) url += `&sync=true`;

        res.redirect(url);
    } catch (err) {
        console.error('Erro ao processar convite:', err);
        res.redirect('https://youtube-lives.onrender.com');
    }
});

router.get('/invite-details/:inviteCode', async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const invite = await Invite.findOne({ inviteCode });

        if (!invite) {
            return res.status(404).json({ msg: 'Convite não encontrado' });
        }

        // Buscar informações do criador
        const creator = await User.findOne({ id: invite.creatorId });
        
        res.json({
            jogoId: invite.jogoId,
            estadioId: invite.estadioId,
            timeId: invite.timeId,
            liveId: invite.liveId,
            sync: invite.sync || false,
            creatorId: invite.creatorId,
            creatorName: creator ? creator.nome : 'Usuário'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
*/
// src/routers/authRoutes.js

// ... (mantenha os imports e configurações iniciais)

// Rota para gerar um link de convite (requer autenticação)
router.post('/generate-invite', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Autenticação necessária' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ id: decoded.userId });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        // ADICIONADO: divId e cardId
        const { jogoId, estadioId, timeId, liveId, divId, cardId, sync = false } = req.body;
        const inviteCode = uuidv4();

        await Invite.create({
            inviteCode,
            creatorId: user.id,
            jogoId: jogoId || null,
            estadioId: estadioId || null,
            timeId: timeId || null,
            liveId: liveId || null,
            divId: divId || null,   // <-- Novo
            cardId: cardId || null, // <-- Novo
            sync 
        });

        // FORÇA SEMPRE O DOMÍNIO DE PRODUÇÃO (ou use variável de ambiente)
        const inviteLink = `https://youtube-lives.onrender.com/invite/${inviteCode}`;

        res.json({ 
            inviteCode,
            inviteLink 
        });

    } catch (err) {
        console.error('Erro generate-invite:', err);
        res.status(500).json({ message: err.message });
    }
});

// Rota para processar o link de convite - REDIRECIONA com todos os parâmetros
router.get('/invite/:inviteCode', async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const invite = await Invite.findOne({ inviteCode });

        if (!invite) {
            return res.redirect('https://youtube-lives.onrender.com');
        }

        // Monta URL com todos os parâmetros necessários
        let url = 'https://youtube-lives.onrender.com/?invite=' + inviteCode;

        if (invite.jogoId) url += `&jogoId=${invite.jogoId}`;
        if (invite.estadioId) url += `&estadioId=${invite.estadioId}`;
        if (invite.timeId) url += `&timeId=${invite.timeId}`;
        if (invite.liveId) url += `&liveId=${invite.liveId}`;
        // ADICIONADO: Parâmetros profundos
        if (invite.divId) url += `&divId=${invite.divId}`;
        if (invite.cardId) url += `&cardId=${invite.cardId}`;
        
        if (invite.sync) url += `&sync=true`;

        res.redirect(url);
    } catch (err) {
        console.error('Erro ao processar convite:', err);
        res.redirect('https://youtube-lives.onrender.com');
    }
});

// Rota de detalhes (necessária para o frontend ler os dados JSON)
router.get('/invite-details/:inviteCode', async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const invite = await Invite.findOne({ inviteCode });

        if (!invite) {
            return res.status(404).json({ msg: 'Convite não encontrado' });
        }

        const creator = await User.findOne({ id: invite.creatorId });
        
        res.json({
            jogoId: invite.jogoId,
            estadioId: invite.estadioId,
            timeId: invite.timeId,
            liveId: invite.liveId,
            divId: invite.divId,     // <-- Retornar aqui
            cardId: invite.cardId,   // <-- Retornar aqui
            sync: invite.sync || false,
            creatorId: invite.creatorId,
            creatorName: creator ? creator.nome : 'Usuário'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ... (restante do código)
// Exemplo de consulta para hierarquia de convites
router.get('/invite-hierarchy', async (req, res) => {
    try {
        const invites = await Invite.find().populate('creatorId invitedUserId', 'nome usuario');
        res.json(invites);
    } catch (err) {
        res.status(500).send(err.message);
    }
});



export default router;


/*
// ANTES (linha ~48)
const user = await User.findById(decoded.userId);

// DEPOIS (mude para buscar pelo campo id que é Number)
const user = await User.findOne({ id: decoded.userId });
*/