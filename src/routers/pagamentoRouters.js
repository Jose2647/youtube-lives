
// src/routers/authRoutes.js
import express from 'express';
import { User } from '../models/models.js'; // Removi Invite da importação
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';



// ===== SISTEMA DE CONQUISTAS E MÉRITO =====
const conquistasOrdem = ['latão', 'bronze', 'pratinha', 'ouro', 'diamante'];

async function atualizarMeritoEConquista(user, minutosAtraso) {
    if (!user) return;

    if (minutosAtraso <= 0) {
        user.merito = 100;
        user.conquistas = 'latão';
    } else if (minutosAtraso <= 5) {
        const idx = conquistasOrdem.indexOf(user.conquistas);
        if (idx < conquistasOrdem.length - 1) {
            user.conquistas = conquistasOrdem[idx + 1];
        }
    } else {
        const passos = Math.floor(minutosAtraso / 5);
        let idx = conquistasOrdem.indexOf(user.conquistas);
        idx = Math.max(0, idx - passos);
        user.conquistas = conquistasOrdem[idx];
        user.merito = Math.max(0, user.merito - (passos * 5));
    }

    await user.save();
}

// Rota de pagamento (sem upload de imagem)
router.post('/pagamento', async (req, res) => {
    try {
        const { email, minutosAtraso } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

        await atualizarMeritoEConquista(user, parseInt(minutosAtraso));

        res.json({
            msg: 'Pagamento registrado com sucesso!',
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
});

export default router;