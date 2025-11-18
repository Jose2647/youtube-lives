// src/routers/authRoutes.js
import express from 'express';
import { User } from '../models/models.js'; // Removi Invite da importação
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(senha, user.senha)) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha) return res.status(400).json({ msg: 'Campos obrigatórios faltando' });
        if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email já existe' });
        const hashedSenha = await bcrypt.hash(senha, 10);
        const newUser = new User({
            id: (await User.countDocuments()) + 1,
            nome,
            email,
            senha: hashedSenha,
            merito: 100,
            conquistas: 'latão'
        });

        await newUser.save();
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: newUser });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});







export default router;





/*
// src/routers/authRoutes.js
import multer from 'multer';
import fs from 'fs';

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

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' }); // Mude para JSON
        }
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(senha, user.senha)) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' }); // <-- MUDANÇA: user.id (Number)
        res.json({ token, user }); // Mude para JSON
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha) return res.status(400).json({ msg: 'Campos obrigatórios faltando' });
        if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email já existe' });
        const hashedSenha = await bcrypt.hash(senha, 10);
        const newUser = new User({
    id: (await User.countDocuments()) + 1,
    nome,
    email,
    senha: hashedSenha,
    merito: 100,
    conquistas: 'latão'
});

        await newUser.save();
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' }); // <-- MUDANÇA: newUser.id (Number)
        res.status(201).json({ token, user: newUser });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});








// ===== SISTEMA DE CONQUISTAS E MÉRITO + PAGAMENTO PIX =====
const conquistasOrdem = ['latão', 'bronze', 'pratinha', 'ouro', 'diamante'];

// Configuração do armazenamento de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/comprovantes';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });
async function atualizarMeritoEConquista(user, minutosAtraso) {
    if (!user) return;

    // Pagou tudo: reset total
    if (minutosAtraso <= 0) {
        user.merito = 100;
        user.conquistas = 'latão';
    } else if (minutosAtraso <= 5) {
        // Atraso pequeno: sobe 1 conquista
        const idx = conquistasOrdem.indexOf(user.conquistas);
        if (idx < conquistasOrdem.length - 1) {
            user.conquistas = conquistasOrdem[idx + 1];
        }
    } else {
        // Atraso > 5 min: perde 1 conquista e 5 de mérito a cada 5 minutos
        const passos = Math.floor(minutosAtraso / 5);
        let idx = conquistasOrdem.indexOf(user.conquistas);
        idx = Math.max(0, idx - passos);
        user.conquistas = conquistasOrdem[idx];
        user.merito = Math.max(0, user.merito - (passos * 5));
    }

    await user.save();
}
 // MODIFIQUE a rota de pagamento para não usar upload:
router.post('/pagamento', async (req, res) => {
    try {
        const { email, minutosAtraso } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

        // Atualiza mérito e conquista APENAS
        await atualizarMeritoEConquista(user, parseInt(minutosAtraso));

        res.json({
            msg: 'Pagamento registrado com sucesso!',
            user
            // REMOVA o comprovante da resposta
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
});




export default router;
*/


