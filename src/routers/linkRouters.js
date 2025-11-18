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
router.post('/generate-invite', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Autenticação necessária' });

        const decoded = jwt.verify(token, JWT_SECRET);
    //    const user = await User.findById(decoded.userId);
    // DEPOIS (mude para buscar pelo campo id que é Number)
const user = await User.findOne({ id: decoded.userId });
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
// Rota para processar o link de convite - REDIRECIONAR para a aplicação principal
router.get('/invite/:inviteCode', async (req, res) => {
    try {
        const inviteCode = req.params.inviteCode;
        const invite = await Invite.findOne({ inviteCode });
        
        if (!invite) {
            // Se o convite não existe, redireciona para home
            return res.redirect('/');
        }

        // Redireciona para a aplicação principal com o código de convite
        res.redirect(`/?invite=${inviteCode}`);
    } catch (err) {
        console.error('Erro ao processar convite:', err);
        res.redirect('/');
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