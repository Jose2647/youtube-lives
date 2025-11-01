import { server } from './app.js';

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔓 Modo: Autenticação opcional - Visitantes podem acessar a maioria das funcionalidades`);
    console.log(`📊 Para popular dados: http://localhost:${PORT}/populate-fake-data`);
});