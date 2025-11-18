
//////////////
// src/services/index.js
import {
    User, Aposta, Desafio, Chat, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Notificacao, Evento
} from '../models/models.js';
import bcrypt from 'bcryptjs';

// ===== FUNÇÃO PARA POPULAR DADOS FAKES (COM CHAT ATUALIZADO) =====
export async function popularMongoDBComDadosFakes() {
    try {
        console.log('Limpando dados existentes no MongoDB...');
        
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
        
        // Drop índice antigo 'usuario_1' se existir (para evitar duplicate key em null)
        try {
            await User.collection.dropIndex('usuario_1');
            console.log('Índice antigo "usuario_1" removido com sucesso.');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('Índice "usuario_1" não encontrado (já removido ou inexistente).');
            } else {
                console.error('Erro ao dropar índice:', error);
                throw error; // Propaga erro se não for IndexNotFound
            }
        }

        // === USUÁRIOS FAKES (sem o campo 'usuario') ===
        const usuariosFakes = [
            { id: 1, nome: "Usuário Teste", email: "usuario_teste@email.com", senha: await bcrypt.hash("123456", 10), merito: 500, imagem: "default-usuario.png" },
            { id: 2, nome: "Usuário Teste2", email: "usuario_teste2@email.com", senha: await bcrypt.hash("123456", 10), merito: 450, imagem: "default-usuario.png" },
            { id: 3, nome: "Usuário Teste3", email: "usuario_teste3@email.com", senha: await bcrypt.hash("123456", 10), merito: 500, imagem: "default-usuario.png" },
            { id: 4, nome: "Streamer A", email: "streamer_a@email.com", senha: await bcrypt.hash("123456", 10), merito: 1000, imagem: "default-streamer.png" }
        ];
        
        await User.insertMany(usuariosFakes);
        console.log('Usuários fakes criados');

        // === APOSTAS E DESAFIOS (referenciando por email) ===
        const apostasFakes = [{
            cardId: "card-1",
            apostas: [{
                id: 1,
                titulo: "Quem ganha o clássico?",
                opcoes: ["Flamengo", "Vasco", "Empate"],
                valor: 100,
                dataEncerramento: new Date("2025-10-26T20:00:00"),
                criador: "usuario_teste@email.com", // <-- Mudou
                participantes: [{ email: "usuario_teste2@email.com", opcao: "Flamengo", data: new Date() }], // <-- Mudou
                status: "aberta"
            }],
            criador: "usuario_teste@email.com", // <-- Mudou
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
                criador: "usuario_teste@email.com", // <-- Mudou
                participantes: [{ email: "usuario_teste2@email.com", opcao: "Flamengo", data: new Date() }], // <-- Mudou
                status: "aberto"
            }],
            criador: "usuario_teste@email.com", // <-- Mudou
            dataCriacao: new Date()
        }];

        await Aposta.insertMany(apostasFakes);
        await Desafio.insertMany(desafiosFakes);
        console.log('Apostas e desafios fakes criados');

        // === ESTRUTURA DE JOGOS (sem alterações aqui) ===
        const jogo = await Jogo.insertMany([
            { id: 1, nome: "Grand Theft Auto V", iframeUrl: "https://www.youtube.com/embed/QkkoHAzjnUs?autoplay=0&mute=1&controls=0" },
            { id: 2, nome: "Fortnite",  iframeUrl: "https://www.youtube.com/embed/Ts-8u-Vacgg?autoplay=0&mute=1&controls=0" },
            { id: 3, nome: "Minecraft",  iframeUrl: "https://www.youtube.com/embed/MmB9b5njVbA?autoplay=0&mute=1&controls=0" },
            { id: 4, nome: "The Witcher 3: Wild Hunt",  iframeUrl: "https://www.youtube.com/embed/XHrskkHf958?autoplay=0&mute=1&controls=0" },
            { id: 5, nome: "Red Dead Redemption 2", iframeUrl: "https://www.youtube.com/embed/gmA6MrX81z4?autoplay=0&mute=1&controls=0" },
            { id: 6, nome: "God of War (2018)",  iframeUrl: "https://www.youtube.com/embed/K0u_kAWLJOA?autoplay=0&mute=1&controls=0" },
            { id: 7, nome: "Cyberpunk 2077",  iframeUrl: "https://www.youtube.com/embed/qIcTM8WXFjk?autoplay=0&mute=1&controls=0" },
            { id: 8, nome: "Among Us",  iframeUrl: "https://www.youtube.com/embed/0YKjFoGxbec?autoplay=0&mute=1&controls=0" },
            { id: 9, nome: "PUBG: Battlegrounds",  iframeUrl: "https://www.youtube.com/embed/OUeQjwzSbc4?autoplay=0&mute=1&controls=0" },
            { id: 10, nome: "Assassin’s Creed Valhalla", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0" }
            // Sugestão: Adicione mais 10 jogos aqui se necessário para matching com estádios 11-20, ex.: { id: 11, nome: "Jogo Extra", iframeUrl: "..." }, etc.
        ]);
        
        const estadio = await Estadio.insertMany([
            { id: 1, jogoId: 1, nome: "Maracanã", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0" },
            { id: 2, jogoId: 2, nome: "Estádio do Morumbi", iframeUrl: "https://www.youtube.com/embed/0x8xvAVm6jU?autoplay=0&mute=1&controls=0" },
            { id: 3, jogoId: 3, nome: "Allianz Parque", iframeUrl: "https://www.youtube.com/embed/ObQJg8BEMM4?autoplay=0&mute=1&controls=0" },
            { id: 4, jogoId: 4, nome: "Mineirão", iframeUrl: "https://www.youtube.com/embed/oI_N9Nf2lE4?autoplay=0&mute=1&controls=0" },
            { id: 5, jogoId: 5, nome: "Arena Castelão", iframeUrl: "https://www.youtube.com/embed/YkE8VnX3jE4?autoplay=0&mute=1&controls=0" },
            { id: 6, jogoId: 6, nome: "Estádio Beira-Rio", iframeUrl: "https://www.youtube.com/embed/sKOVzUj8WKU?autoplay=0&mute=1&controls=0" },
            { id: 7, jogoId: 7, nome: "Arena da Baixada", iframeUrl: "https://www.youtube.com/embed/4yq4uS4qgCQ?autoplay=0&mute=1&controls=0" },
            { id: 8, jogoId: 8, nome: "Fonte Nova", iframeUrl: "https://www.youtube.com/embed/s0pD7FftEyg?autoplay=0&mute=1&controls=0" },
            { id: 9, jogoId: 9, nome: "Estádio Nilton Santos (Engenhão)", iframeUrl: "https://www.youtube.com/embed/wYtJ0z5L2oI?autoplay=0&mute=1&controls=0" },
            { id: 10, jogoId: 10, nome: "Arena Pernambuco", iframeUrl: "https://www.youtube.com/embed/n1uGg8zEtrU?autoplay=0&mute=1&controls=0" },
            { id: 11, jogoId: 11, nome: "Camp Nou", iframeUrl: "https://www.youtube.com/embed/Z1Hk6hFJ8jA?autoplay=0&mute=1&controls=0" },
            { id: 12, jogoId: 12, nome: "Santiago Bernabéu", iframeUrl: "https://www.youtube.com/embed/lE8yR0VnW3U?autoplay=0&mute=1&controls=0" },
            { id: 13, jogoId: 13, nome: "Wembley Stadium", iframeUrl: "https://www.youtube.com/embed/tXvLzL5lrC8?autoplay=0&mute=1&controls=0" },
            { id: 14, jogoId: 14, nome: "Estádio Olímpico de Tóquio", iframeUrl: "https://www.youtube.com/embed/ZXuCkZK3kJ8?autoplay=0&mute=1&controls=0" },
            { id: 15, jogoId: 15, nome: "Estádio Nacional de Pequim (Ninho de Pássaro)", iframeUrl: "https://www.youtube.com/embed/Qq4Wg4s_QVU?autoplay=0&mute=1&controls=0" },
            { id: 16, jogoId: 16, nome: "Stade de France", iframeUrl: "https://www.youtube.com/embed/ptbSmN6M8Yw?autoplay=0&mute=1&controls=0" },
            { id: 17, jogoId: 17, nome: "San Siro", iframeUrl: "https://www.youtube.com/embed/Xt1e6F5qncY?autoplay=0&mute=1&controls=0" },
            { id: 18, jogoId: 18, nome: "Old Trafford", iframeUrl: "https://www.youtube.com/embed/vAbY5PjRjzA?autoplay=0&mute=1&controls=0" },
            { id: 19, jogoId: 19, nome: "Estádio Olímpico de Berlim", iframeUrl: "https://www.youtube.com/embed/EI7A6zJe3I0?autoplay=0&mute=1&controls=0" },
            { id: 20, jogoId: 20, nome: "Estádio Luzhniki", iframeUrl: "https://www.youtube.com/embed/JwS8zRzBfY8?autoplay=0&mute=1&controls=0" }
        ]);

        const time = await Time.insertMany([
            { id: 1, estadioId: 1, nome: "Flamengo Esports", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0" },
            { id: 2, estadioId: 2, nome: "LOUD", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/Z9hZ8MZl9x4?autoplay=0&mute=1&controls=0" },
            { id: 3, estadioId: 3, nome: "FURIA", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/_Hq6-w3GmTo?autoplay=0&mute=1&controls=0" },
            { id: 4, estadioId: 4, nome: "Pain Gaming", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/QgYwW7j8o5I?autoplay=0&mute=1&controls=0" },
            { id: 5, estadioId: 5, nome: "INTZ", imagem: "default-time.png", iframeUrl: "https://www.youtube.com/embed/0fIuK8P6UL4?autoplay=0&mute=1&controls=0" },
            // ... (insira o resto da lista truncada aqui, assumindo que continua com mais times)
        ]);

        // Assumindo insert de Live, DivHorizontal, Card aqui (baseado no truncado)
        // Exemplo: await Live.insertMany([...]);
        // await DivHorizontal.insertMany([...]);
        await Card.insertMany([
            { id: 5, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a@email.com" },
            { id: 6, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a@email.com" },
            { id: 7, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a@email.com" },
            { id: 8, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a@email.com" },
            { id: 1, divHorizontalId: 2, titulo: "Torcida do Flamengo", iframeUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ", criador: "usuario_teste@email.com" }
        ]);

        // === STREAMER (referenciando por email) ===
        await Streamer.create({ id: 1, liveId: 1, nome: "Streamer A", email: "streamer_a@email.com", online: true, imagem: "default-streamer.png", merito: 1000 });
        await Streamer.create({ id: 2, liveId: 1, nome: "Streamer B", email: "streamer_b@email.com", online: true, imagem: "default-streamer.png", merito: 1000 }); // Corrigido ID duplicado

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
        console.log('Mensagens de chat fakes criadas (por room)');

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
            streamers: await Streamer.countDocuments()
        };

        return { success: true, message: 'Dados fakes inseridos!', summary: counts };

    } catch (error) {
        console.error('ERRO AO POPULAR:', error);
        return { success: false, message: error.message, summary: null };
    }
}

// ===== MONTAR ESTRUTURA DE JOGOS (Atualizado para 'email' no Streamer) =====
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
                                                    criador: div.criador,
                                                    cards: cards.map(c => ({
                                                        id: c.id,
                                                        titulo: c.titulo,
                                                        iframeUrl: c.iframeUrl,
                                                        criador: c.criador
                                                    }))
                                                };
                                            })
                                        );
                                        const streamers = await Streamer.find({ liveId: live.id });
                                        return {
                                            id: live.id,
                                            titulo: live.titulo,
                                            
                                            status: live.status,
                                            criador: live.criador,
                                           iframeUrl: live.iframeUrl, 
                                           divsHorizontais: divsComCards,
                                            streamers: streamers.map(s => ({
                                                id: s.id,
                                                nome: s.nome,
                                                email: s.email, // <-- MUDANÇA AQUI
                                                online: s.online,
                                                imagem: s.imagem,
                                                merito: s.merito
                                            }))
                                        };
                                    })
                                );
                                return { id: time.id, nome: time.nome,
                              iframeUrl: time.iframeUrl,
                                imagem: time.imagem, lives: livesComDivs };
                            })
                        );
                        return { id: estadio.id, nome: estadio.nome, 
                        iframeUrl: estadio.iframeUrl,
                        imagem: estadio.imagem, times: timesComLives };
                    })
                );
                return { id: jogo.id,
                nome: jogo.nome, 
                iframeUrl: jogo.iframeUrl,
                imagem: jogo.imagem, 
                estadios: estadiosComTimes };
            })
        );
console.log("__&___jogos",jogos)
        return jogosCompletos;
    } catch (error) {
        console.error('ERRO AO MONTAR ESTRUTURA:', error);
        return [];
    }
}

async function inicializarDados() {
    try {
        console.log('--- Iniciando População dos Dados Fakes ---');
        const resultadoPop = await popularMongoDBComDadosFakes();
        console.log(resultadoPop.message);
        console.log('Resumo:', resultadoPop.summary);
        console.log('-------------------------------------------');
        
        console.log('--- Iniciando Montagem da Estrutura de Jogos ---');
        const jogos = await montarEstruturaJogos();
        console.log(`Estrutura de jogos montada. ${jogos.length} jogos encontrados.`);
         console.log('Estrutura Completa:', JSON.stringify(jogos, null, 2)); // Descomente para ver o objeto todo
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Erro durante a inicialização dos dados:', error);
    }
}

// Executa a função principal
inicializarDados();