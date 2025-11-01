

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from './src/middleware/cors.js';
import { authenticateOptional } from './src/middleware/auth.js';
import { connectDB } from './src/config/database.js';
import routes from './src/routers/index.js';
import { setupSocket } from './src/sockets/sockets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// === MIDDLEWARES ===
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authenticateOptional);

// === ROTAS API (TODAS EM /api) ===
app.use('/api', routes); // <--- IMPORTANTE: todas as rotas do router.js ficam em /api

// === SERVIR FRONTEND (SPA) ===
// Qualquer rota que NÃO seja API ou arquivo estático → serve index.html
app.get('*', (req, res) => {
    // Ignora arquivos estáticos (.css, .js, .png, etc.) e rotas /api
    if (
        req.path.includes('.') ||           // arquivos com extensão
        req.path.startsWith('/api') ||      // rotas API
        req.path.startsWith('/socket.io')   // Socket.IO
    ) {
        return res.status(404).send('Not found');
    }

    // Serve o frontend
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === SOCKET.IO ===
setupSocket(io);

// === BANCO DE DADOS ===
connectDB();

// === EXPORT ===
export { app, server };