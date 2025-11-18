// src/services/index.js
import {
    User, Aposta, Desafio, Chat, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Notificacao, Evento,
    IframeRegistro // <-- 1. IMPORTAR NOVO MODELO
} from '../models/models.js';
import bcrypt from 'bcryptjs';

// ===== FUNÇÃO PARA POPULAR DADOS FAKES (COM CHAT ATUALIZADO) =====
export async function popularMongoDBComDadosFakes() {
    try {
        //console.log('Limpando dados existentes no MongoDB...');
        
        // LIMPAR TODAS AS COLEÇÕES
        await User.deleteMany({});
        await Aposta.deleteMany({});
        await Desafio.deleteMany({});
        await Chat.deleteMany({});
        await Jogo.deleteMany({});
        await Estadio.deleteMany({});
        await Time.deleteMany({});
        await Live.deleteMany({});
        await DivHorizontal.deleteMany({});
        await Card.deleteMany({});
        await Streamer.deleteMany({});
        await Notificacao.deleteMany({});
        await Evento.deleteMany({});
        await IframeRegistro.deleteMany({}); // <-- 2. LIMPAR NOVO MODELO

        // Drop índice antigo 'usuario_1' se existir (para evitar duplicate key em null)
        try {
            await User.collection.dropIndex('usuario_1');
        } catch (error) {
            if (error.codeName !== 'IndexNotFound') {
                console.error('Erro ao dropar índice:', error);
                throw error; 
            }
        }

        // === USUÁRIOS FAKES (sem o campo 'usuario') ===
        const usuariosFakes = [
            { id: 1, nome: "test", email: "test@gmail.com", senha: await bcrypt.hash("123456", 10), merito: 100, imagem: "default-usuario.png" },
            { id: 2, nome: "Usuário Teste2", email: "usuario_teste2@email.com", senha: await bcrypt.hash("123456", 10), merito: 100, imagem: "default-usuario.png" },
            { id: 3, nome: "Usuário Teste3", email: "usuario_teste3@email.com", senha: await bcrypt.hash("123456", 10), merito: 100, imagem: "default-usuario.png" },
            { id: 4, nome: "Streamer A", email: "streamer_a@email.com", senha: await bcrypt.hash("123456", 10), merito: 100, imagem: "default-streamer.png" }
        ];
        
        await User.insertMany(usuariosFakes);

        // === DADOS PARA ITENS COM CRIADOR E SENHA ===
        // (Usaremos ID 1 = Usuário Teste, ID 4 = Streamer A)
        const fakeCreatorId = 1; 
        const fakeHashedPassword = await bcrypt.hash("123456", 10); // Senha fake para todos os itens

        // === APOSTAS E DESAFIOS (referenciando por email) ===
        // (Estes não exigem creatorId/senha no seu models.js, então mantêm-se)
        const apostasFakes = [{
            cardId: "card-1",
            apostas: [{
                id: 1,
                titulo: "Quem ganha o clássico?",
                opcoes: ["Flamengo", "Vasco", "Empate"],
                valor: 100,
                dataEncerramento: new Date("2025-10-26T20:00:00"),
                criador: "usuario_teste@email.com", 
                participantes: [{ email: "usuario_teste2@email.com", opcao: "Flamengo", data: new Date() }], 
                status: "aberta"
            }],
            criador: "usuario_teste@email.com", 
            dataCriacao: new Date()
        }];
        const desafiosFakes = [{
            cardId: "card-1",
            desafios: [{
                id: 1,
                titulo: "Quem faz o primeiro gol?",
                opcoes: ["Flamengo", "Vasco", "Nenhum"],
                valor: 100,
                dataEncerramento: new Date("2025-10-26T20:00:00"),
                criador: "usuario_teste@email.com", 
                participantes: [{ email: "usuario_teste2@email.com", opcao: "Flamengo", data: new Date() }], 
                status: "aberto"
            }],
            criador: "usuario_teste@email.com", 
            dataCriacao: new Date()
        }];
        await Aposta.insertMany(apostasFakes);
        await Desafio.insertMany(desafiosFakes);


        // === ESTRUTURA DE JOGOS (ADICIONADO creatorId e senha) ===
        const jogosData = [
            { id: 1, nome: "Grand Theft Auto V", iframeUrl: "https://www.youtube.com/embed/QkkoHAzjnUs?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 2, nome: "Fortnite", iframeUrl: "https://www.youtube.com/embed/M2pyqnypx50?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 3, nome: "Minecraft", iframeUrl: "https://www.youtube.com/embed/MmB9b5njVbA?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 4, nome: "The Witcher 3: Wild Hunt", iframeUrl: "https://www.youtube.com/embed/XHrskkHf958?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 5, nome: "Red Dead Redemption 2", iframeUrl: "https://www.youtube.com/embed/gmA6MrX81z4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 6, nome: "God of War (2018)", iframeUrl: "https://www.youtube.com/embed/K0u_kAWLJOA?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 7, nome: "Cyberpunk 2077", iframeUrl: "https://www.youtube.com/embed/qIcTM8WXFjk?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 8, nome: "Among Us", iframeUrl: "https://www.youtube.com/embed/0YKjFoGxbec?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 9, nome: "PUBG: Battlegrounds", iframeUrl: "https://www.youtube.com/embed/OUeQjwzSbc4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 10, nome: "Assassin’s Creed Valhalla", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 11, nome: "League of Legends", iframeUrl: "https://www.youtube.com/embed/3Eu7x9Z32O4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 12, nome: "Valorant", iframeUrl: "https://www.youtube.com/embed/IggemLz0IuM?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 13, nome: "Call of Duty: Warzone", iframeUrl: "https://www.youtube.com/embed/0E44DClsX5Q?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 14, nome: "Overwatch 2", iframeUrl: "https://www.youtube.com/embed/FqnKB22pOC0?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 15, nome: "Apex Legends", iframeUrl: "https://www.youtube.com/embed/89p9u4Z7I0U?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 16, nome: "Counter-Strike 2", iframeUrl: "https://www.youtube.com/embed/cbiURIUOyV8?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 17, nome: "Dota 2", iframeUrl: "https://www.youtube.com/embed/-cSFPIwMeD4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 18, nome: "Rainbow Six Siege", iframeUrl: "https://www.youtube.com/embed/6wlvYh0h63k?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 19, nome: "Rocket League", iframeUrl: "https://www.youtube.com/embed/wz9mD3Y9PRI?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 20, nome: "FIFA 23", iframeUrl: "https://www.youtube.com/embed/o3zI4Hpj6U8?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword }
        ];
        await Jogo.insertMany(jogosData);

        const estadiosData = [
            { id: 1, jogoId: 1, nome: "Maracanã", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 2, jogoId: 2, nome: "Estádio do Morumbi", iframeUrl: "https://www.youtube.com/embed/0x8xvAVm6jU?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 3, jogoId: 3, nome: "Allianz Parque", iframeUrl: "https://www.youtube.com/embed/ObQJg8BEMM4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 4, jogoId: 4, nome: "Mineirão", iframeUrl: "https://www.youtube.com/embed/oI_N9Nf2lE4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 5, jogoId: 5, nome: "Arena Castelão", iframeUrl: "https://www.youtube.com/embed/YkE8VnX3jE4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 6, jogoId: 6, nome: "Estádio Beira-Rio", iframeUrl: "https://www.youtube.com/embed/sKOVzUj8WKU?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 7, jogoId: 7, nome: "Arena da Baixada", iframeUrl: "https://www.youtube.com/embed/4yq4uS4qgCQ?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 8, jogoId: 8, nome: "Fonte Nova", iframeUrl: "https://www.youtube.com/embed/s0pD7FftEyg?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 9, jogoId: 9, nome: "Estádio Nilton Santos (Engenhão)", iframeUrl: "https://www.youtube.com/embed/wYtJ0z5L2oI?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 10, jogoId: 10, nome: "Arena Pernambuco", iframeUrl: "https://www.youtube.com/embed/n1uGg8zEtrU?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 11, jogoId: 11, nome: "Camp Nou", iframeUrl: "https://www.youtube.com/embed/Z1Hk6hFJ8jA?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 12, jogoId: 12, nome: "Santiago Bernabéu", iframeUrl: "https://www.youtube.com/embed/lE8yR0VnW3U?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 13, jogoId: 13, nome: "Wembley Stadium", iframeUrl: "https://www.youtube.com/embed/tXvLzL5lrC8?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 14, jogoId: 14, nome: "Estádio Olímpico de Tóquio", iframeUrl: "https://www.youtube.com/embed/ZXuCkZK3kJ8?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 15, jogoId: 15, nome: "Estádio Nacional de Pequim (Ninho de Pássaro)", iframeUrl: "https://www.youtube.com/embed/Qq4Wg4s_QVU?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 16, jogoId: 16, nome: "Stade de France", iframeUrl: "https://www.youtube.com/embed/ptbSmN6M8Yw?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 17, jogoId: 17, nome: "San Siro", iframeUrl: "https://www.youtube.com/embed/Xt1e6F5qncY?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 18, jogoId: 18, nome: "Old Trafford", iframeUrl: "https://www.youtube.com/embed/vAbY5PjRjzA?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 19, jogoId: 19, nome: "Estádio Olímpico de Berlim", iframeUrl: "https://www.youtube.com/embed/EI7A6zJe3I0?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 20, jogoId: 20, nome: "Estádio Luzhniki", iframeUrl: "https://www.youtube.com/embed/JwS8zRzBfY8?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword }
        ];
        await Estadio.insertMany(estadiosData);

        const timesData = [
            { id: 1, estadioId: 1, nome: "Flamengo Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 2, estadioId: 2, nome: "LOUD", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/Z9hZ8MZl9x4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 3, estadioId: 3, nome: "FURIA", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/_Hq6-w3GmTo?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 4, estadioId: 4, nome: "Pain Gaming", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/QgYwW7j8o5I?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 5, estadioId: 5, nome: "INTZ", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/0fIuK8P6UL4?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 6, estadioId: 6, nome: "KaBuM! Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/kaBuM_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 7, estadioId: 7, nome: "RED Canids", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/red_canids_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 8, estadioId: 8, nome: "Netshoes Miners", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/netshoes_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 9, estadioId: 9, nome: "Los Grandes", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/los_grandes_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 10, estadioId: 10, nome: "Fluxo", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/fluxo_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 11, estadioId: 11, nome: "Vivo Keyd", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/vivo_keyd_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 12, estadioId: 12, nome: "Rensga Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/rensga_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 13, estadioId: 13, nome: "Miners.gg", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/miners_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 14, estadioId: 14, nome: "Liberty", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/liberty_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 15, estadioId: 15, nome: "Cruzeiro Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/cruzeiro_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 16, estadioId: 16, nome: "Corinthians Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/corinthians_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 17, estadioId: 17, nome: "Santos Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/santos_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 18, estadioId: 18, nome: "Botafogo Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/botafogo_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 19, estadioId: 19, nome: "Vasco Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/vasco_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword },
            { id: 20, estadioId: 20, nome: "Palmeiras Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/palmeiras_example?autoplay=0&mute=1&controls=0", creatorId: fakeCreatorId, senha: fakeHashedPassword }
        ];
        await Time.insertMany(timesData);

        const livesData = [
            { id: 1, timeId: 1, titulo: "Flamengo vs Vasco", descricao: "Clássico dos Milhões", status: "ao-vivo", iframeUrl: "https://www.youtube.com/embed/live_flamengo_vasco", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA (de 'criador' string para 'creatorId' num)
              senha: fakeHashedPassword } // <-- 3. ADICIONADO
        ];
        await Live.insertMany(livesData);

        const divsData = [
            { id: 1, liveId: 1, titulo: "Transmissão", tamanho: "grande", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword }, // <-- 3. ADICIONADO
            { id: 2, liveId: 1, titulo: "Torcida", tamanho: "pequeno", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword } // <-- 3. ADICIONADO
        ];
        await DivHorizontal.insertMany(divsData);

        const cardsData = [
            { id: 5, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword }, // <-- 3. ADICIONADO
            { id: 6, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword }, // <-- 3. ADICIONADO
            { id: 7, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword }, // <-- 3. ADICIONADO
            { id: 8, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/live/ML92dM2PDTU?si=1PSEq97PWrHGWlNW", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword }, // <-- 3. ADICIONADO
            { id: 1, divHorizontalId: 2, titulo: "Torcida do Flamengo", iframeUrl: "https://www.youtube.com/embed/ML92dM2PDTU", 
              creatorId: fakeCreatorId, // <-- 3. MUDANÇA
              senha: fakeHashedPassword } // <-- 3. ADICIONADO
        ];
        await Card.insertMany(cardsData);

        // === 4. POPULAR IframeRegistro ===
        const iframesParaRegistro = [
            // Mapeia Jogos
            ...jogosData.map(d => ({ iframeUrl: d.iframeUrl, origemTipo: 'Jogo', origemId: d.id, creatorId: d.creatorId })),
            // Mapeia Estadios
            ...estadiosData.map(d => ({ iframeUrl: d.iframeUrl, origemTipo: 'Estadio', origemId: d.id, creatorId: d.creatorId })),
            // Mapeia Times
            ...timesData.map(d => ({ iframeUrl: d.iframeUrl, origemTipo: 'Time', origemId: d.id, creatorId: d.creatorId })),
            // Mapeia Lives
            ...livesData.map(d => ({ iframeUrl: d.iframeUrl, origemTipo: 'Live', origemId: d.id, creatorId: d.creatorId })),
            // Mapeia Cards
            ...cardsData.map(d => ({ iframeUrl: d.iframeUrl, origemTipo: 'Card', origemId: d.id, creatorId: d.creatorId })),
        ];
        // Remove duplicados (caso o mesmo iframeUrl esteja em vários lugares)
        const iframesUnicos = Array.from(new Map(iframesParaRegistro.map(item => [item.iframeUrl, item])).values());
        
        await IframeRegistro.insertMany(iframesUnicos);


        // === STREAMER (referenciando por email) ===
        await Streamer.create({ id: 1, liveId: 1, nome: "Streamer A", email: "streamer_a@email.com", online: true, imagem: "default-streamer.png", merito: 100 });
        await Streamer.create({ id: 2, liveId: 1, nome: "Streamer B", email: "streamer_b@email.com", online: true, imagem: "default-streamer.png", merito: 100 }); 

        // === CHAT (referenciando por email) ===
        const mensagensFakes = [
            { room: "live-1-visitante", email: "usuario_teste@email.com", mensagem: "Bora Flamengo!", data: new Date(Date.now() - 3600000) },
            { room: "live-1-visitante", email: "usuario_teste2@email.com", mensagem: "Vai que é tua, Vascão!", data: new Date(Date.now() - 3000000) },
            { room: "live-1-visitante", email: "streamer_a@email.com", mensagem: "Transmissão ao vivo começando!", data: new Date(Date.now() - 2400000) },
            { room: "live-1-500", email: "usuario_teste@email.com", mensagem: "Alguém com mérito alto aqui?", data: new Date(Date.now() - 1800000) },
            { room: "jogo-1-visitante", email: "usuario_teste3@email.com", mensagem: "Clássico pegado hoje!", data: new Date(Date.now() - 1200000) },
            { room: "card-1-visitante", email: "usuario_teste@email.com", mensagem: "Esse card tá top!", data: new Date(Date.now() - 600000) }
        ];

        await Chat.insertMany(mensagensFakes);

        // === VERIFICAÇÃO FINAL ===
        const counts = {
            usuarios: await User.countDocuments(),
            apostas: await Aposta.countDocuments(),
            desafios: await Desafio.countDocuments(),
            chats: await Chat.countDocuments(),
            jogos: await Jogo.countDocuments(),
            estadios: await Estadio.countDocuments(),
            times: await Time.countDocuments(),
            lives: await Live.countDocuments(),
            divs: await DivHorizontal.countDocuments(),
            cards: await Card.countDocuments(),
            streamers: await Streamer.countDocuments(),
            iframes: await IframeRegistro.countDocuments() // <-- 5. ADICIONADO AO RESUMO
        };

        return { success: true, message: 'Dados fakes inseridos!', summary: counts };

    } catch (error) {
        console.error('ERRO AO POPULAR:', error);
        return { success: false, message: error.message, summary: null };
    }
}

export async function montarEstruturaJogos() {
    try {
        const jogos = await Jogo.find();
        if (!jogos.length) return [];

        const jogosCompletos = await Promise.all(
            jogos.map(async (jogo) => {
                const estadios = await Estadio.find({ jogoId: jogo.id });
                const estadiosComTimes = await Promise.all(
                    estadios.map(async (estadio) => {
                        const times = await Time.find({ estadioId: estadio.id });
                        const timesComLives = await Promise.all(
                            times.map(async (time) => {
                                const lives = await Live.find({ timeId: time.id });
                                const livesComDivs = await Promise.all(
                                    lives.map(async (live) => {
                                        const divs = await DivHorizontal.find({ liveId: live.id });
                                        const divsComCards = await Promise.all(
                                            divs.map(async (div) => {
                                                const cards = await Card.find({ divHorizontalId: div.id });
                                                return {
                                                    id: div.id,
                                                    titulo: div.titulo,
                                                    tamanho: div.tamanho,
                                                    creatorId: div.creatorId,
                                                    cards: cards.map(c => ({
                                                        id: c.id,
                                                        titulo: c.titulo,
                                                        iframeUrl: c.iframeUrl,
                                                        creatorId: c.creatorId
                                                    }))
                                                };
                                            })
                                        );
                                        const streamers = await Streamer.find({ liveId: live.id });
                                        return {
                                            id: live.id,
                                            titulo: live.titulo,
                                            
                                            status: live.status,
                                            creatorId: live.creatorId,
                                            iframeUrl: live.iframeUrl, 
                                            divsHorizontais: divsComCards,
                                            streamers: streamers.map(s => ({
                                                id: s.id,
                                                nome: s.nome,
                                                email: s.email,
                                                online: s.online,
                                                imagem: s.imagem,
                                                merito: s.merito
                                            }))
                                        };
                                    })
                                );
                                return { 
                                    id: time.id, 
                                    nome: time.nome,
                                    iframeUrl: time.iframeUrl,
                                    imagem: time.imagem, 
                                    creatorId: time.creatorId,  // Adicionado creatorId para time
                                    lives: livesComDivs 
                                };
                            })
                        );
                        return { 
                            id: estadio.id, 
                            nome: estadio.nome, 
                            iframeUrl: estadio.iframeUrl,
                            // imagem: estadio.imagem, // <-- 7. REMOVIDO (não existe no schema)
                            creatorId: estadio.creatorId,  // Adicionado creatorId para estadio
                            times: timesComLives 
                        };
                    })
                );
                return { 
                    id: jogo.id,
                    nome: jogo.nome, 
                    iframeUrl: jogo.iframeUrl,
                    // imagem: jogo.imagem, // <-- 7. REMOVIDO (não existe no schema)
                    creatorId: jogo.creatorId,  // Adicionado creatorId para jogo
                    estadios: estadiosComTimes 
                };
            })
        );
////console.log("__&___jogos",jogos)
        return jogosCompletos;
    } catch (error) {
        console.error('ERRO AO MONTAR ESTRUTURA:', error);
        return [];
    }
}
async function inicializarDados() {
    try {
        console.log('--- Iniciando População dos Dados Fakes ---');
    //    const resultadoPop = await popularMongoDBComDadosFakes();
        //console.log(resultadoPop.message);
        //console.log('Resumo:', resultadoPop.summary);
        //console.log('-------------------------------------------');
        
       // //console.log('--- Iniciando Montagem da Estrutura de Jogos ---');
        const jogos = await montarEstruturaJogos();
        //console.log(`Estrutura de jogos montada. ${jogos.length} jogos encontrados.`);
        // //console.log('Estrutura Completa:', JSON.stringify(jogos, null, 2)); // Descomente para ver o objeto todo
     //   //console.log('------------------------------------------------');

    } catch (error) {
        console.error('Erro durante a inicialização dos dados:', error);
    }
}


// Executa a função principal
inicializarDados();




