/*
User, Aposta, Desafio, Chat, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Notificacao, Evento
} from '../models/index.js';
import bcrypt from 'bcryptjs';

// ===== FUNÇÃO PARA POPULAR DADOS FAKES =====
export async function popularMongoDBComDadosFakes() {
    try {
        console.log('🗑️  Limpando dados existentes no MongoDB...');
        
        // Limpar todas as coleções
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
        
        console.log('✅ Dados antigos removidos');
        
        // Criar usuários fakes
        const usuariosFakes = [
            {
                id: 1,
                nome: "Usuário Teste",
                usuario: "usuario_teste",
                email: "usuario_teste@email.com",
                senha: await bcrypt.hash("123456", 10),
                contaBancaria: "12345-6",
                chavePix: "usuario_teste@email.com",
                merito: 500,
                desafiosCumpridos: 0,
                desafiosFalhados: 0,
                pagamentosRealizados: 0,
                pagamentosPendentes: 0,
                amigos: [],
                imagem: "default-usuario.png"
            },
            {
                id: 2,
                nome: "Usuário Teste2", 
                usuario: "usuario_teste2",
                email: "usuario_teste2@email.com",
                senha: await bcrypt.hash("123456", 10),
                contaBancaria: "67890-1",
                chavePix: "usuario_teste2@email.com",
                merito: 450,
                desafiosCumpridos: 0,
                desafiosFalhados: 0,
                pagamentosRealizados: 0,
                pagamentosPendentes: 0,
                amigos: [],
                imagem: "default-usuario.png"
            },
            {
                id: 3,
                nome: "Usuário Teste3",
                usuario: "usuario_teste3", 
                email: "usuario_teste3@email.com",
                senha: await bcrypt.hash("123456", 10),
                contaBancaria: "54321-0",
                chavePix: "usuario_teste3@email.com",
                merito: 500,
                desafiosCumpridos: 0,
                desafiosFalhados: 0,
                pagamentosRealizados: 0,
                pagamentosPendentes: 0,
                amigos: [],
                imagem: "default-usuario.png"
            },
            {
                id: 4,
                nome: "Streamer A",
                usuario: "streamer_a",
                email: "streamer_a@email.com",
                senha: await bcrypt.hash("123456", 10),
                contaBancaria: "98765-4",
                chavePix: "streamer_a@email.com",
                merito: 1000,
                desafiosCumpridos: 0,
                desafiosFalhados: 0,
                pagamentosRealizados: 0,
                pagamentosPendentes: 0,
                amigos: [],
                imagem: "default-streamer.png"
            }
        ];
        
        await User.insertMany(usuariosFakes);
        console.log('✅ Usuários fakes criados');

        // Criar apostas
        const apostasFakes = [
            {
                cardId: "card-VHJhbnNt-1",
                apostas: [
                    {
                        id: 1,
                        titulo: "Quem ganha o clássico?",
                        descricao: "Aposta no vencedor do Flamengo vs Vasco. Dica: Flamengo está em casa!",
                        opcoes: ["Flamengo", "Vasco", "Empate"],
                        valor: 100,
                        dataEncerramento: new Date("2025-10-26T20:00:00"),
                        criador: "usuario_teste",
                        participantes: [
                            {
                                usuario: "usuario_teste2",
                                opcao: "Flamengo", 
                                data: new Date("2025-10-25T20:00:00")
                            }
                        ],
                        status: "aberta",
                        dataCriacao: new Date("2025-10-25T19:00:00"),
                        opcaoVencedora: null,
                        comprovantes: []
                    }
                ],
                criador: "usuario_teste",
                dataCriacao: new Date("2025-10-25T18:00:00")
            }
        ];
        
        await Aposta.insertMany(apostasFakes);
        console.log('✅ Apostas fakes criadas');

        // Criar desafios
        const desafiosFakes = [
            {
                cardId: "card-VHJhbnNt-1", 
                desafios: [
                    {
                        id: 1,
                        titulo: "Quem faz o primeiro gol?",
                        descricao: "Desafio para prever o time que marca primeiro no clássico.",
                        opcoes: ["Flamengo", "Vasco", "Nenhum"],
                        valor: 100,
                        dataEncerramento: new Date("2025-10-26T20:00:00"),
                        criador: "usuario_teste",
                        participantes: [
                            {
                                usuario: "usuario_teste2",
                                opcao: "Flamengo",
                                data: new Date("2025-10-25T20:00:00")
                            }
                        ],
                        status: "aberto",
                        dataCriacao: new Date("2025-10-25T19:00:00"),
                        opcaoVencedora: null,
                        comprovantes: []
                    }
                ],
                criador: "usuario_teste",
                dataCriacao: new Date("2025-10-25T18:00:00")
            }
        ];
        
        await Desafio.insertMany(desafiosFakes);
        console.log('✅ Desafios fakes criados');

        // Criar chats fakes
        const chatsFakes = [
            {
                cardId: "card-VHJhbnNt-1",
                messages: [
                    {
                        usuario: "usuario_teste",
                        mensagem: "Alguém mais acha que o Flamengo vai ganhar?",
                        data: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        readBy: ["usuario_teste", "usuario_teste2"]
                    }
                ],
                voiceParticipants: []
            }
        ];
        
        await Chat.insertMany(chatsFakes);
        console.log('✅ Chats fakes criados');

        // CRIAR ESTRUTURA DE JOGOS DE FORMA SIMPLIFICADA E VERIFICADA
        console.log('🎮 Criando estrutura de jogos...');
        
        // 1. Criar jogo
        const jogo = await Jogo.create({
            id: 1,
            nome: "Campeonato Brasileiro 2023",
            imagem: "default-jogo.png"
        });
        console.log('✅ Jogo criado:', jogo.id);

        // 2. Criar estádio
        const estadio = await Estadio.create({
            id: 1,
            jogoId: 1,
            nome: "Maracanã",
            imagem: "default-estadio.png"
        });
        console.log('✅ Estádio criado:', estadio.id);

        // 3. Criar time
        const time = await Time.create({
            id: 1,
            estadioId: 1,
            nome: "Flamengo",
            imagem: "default-time.png"
        });
        console.log('✅ Time criado:', time.id);

        // 4. Criar live
        const live = await Live.create({
            id: 1,
            timeId: 1,
            titulo: "Flamengo vs Vasco - Jogo Principal",
            descricao: "Transmissão oficial do clássico carioca",
            status: "ativa",
            criador: "streamer_a"
        });
        console.log('✅ Live criada:', live.id);

        // 5. Criar divs horizontais
        const div1 = await DivHorizontal.create({
            id: 1,
            liveId: 1,
            titulo: "Transmissões Principais",
            tamanho: "grande",
            criador: "streamer_a"
        });

        const div2 = await DivHorizontal.create({
            id: 2,
            liveId: 1,
            titulo: "Ângulos da Torcida",
            tamanho: "medio",
            criador: "usuario_teste"
        });
        console.log('✅ Divs horizontais criadas:', [div1.id, div2.id]);

        // 6. Criar cards
        const cards = await Card.insertMany([
            { id: 1, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a" },
            { id: 2, divHorizontalId: 1, titulo: "Replay dos Gols", iframeUrl: "https://www.youtube.com/embed/8XPV9g3Qccs", criador: "streamer_a" },
            { id: 3, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a" },
            { id: 4, divHorizontalId: 1, titulo: "Replay dos Gols", iframeUrl: "https://www.youtube.com/embed/8XPV9g3Qccs", criador: "streamer_a" },
            { id: 5, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a" },
            { id: 6, divHorizontalId: 1, titulo: "Replay dos Gols", iframeUrl: "https://www.youtube.com/embed/8XPV9g3Qccs", criador: "streamer_a" },
            { id: 7, divHorizontalId: 2, titulo: "Torcida do Flamengo", iframeUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ", criador: "usuario_teste" },
            { id: 8, divHorizontalId: 2, titulo: "Torcida do Vasco", iframeUrl: "https://www.youtube.com/embed/0KSOMA3QBU0", criador: "usuario_teste" },
            { id: 9, divHorizontalId: 2, titulo: "Torcida do Flamengo", iframeUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ", criador: "usuario_teste" },
            { id: 10, divHorizontalId: 2, titulo: "Torcida do Vasco", iframeUrl: "https://www.youtube.com/embed/0KSOMA3QBU0", criador: "usuario_teste" }
        ]);
        console.log('✅ Cards criados:', cards.length);

        // 7. Criar streamers
        const streamer = await Streamer.create({
            id: 1,
            liveId: 1,
            nome: "Streamer A",
            usuario: "streamer_a",
            senha: "123456",
            online: true,
            imagem: "default-streamer.png",
            chavePix: "streamer_a@email.com",
            merito: 1000
        });
        console.log('✅ Streamer criado:', streamer.id);

        // VERIFICAR SE OS DADOS FORAM CRIADOS CORRETAMENTE
        console.log('🔍 Verificando dados criados...');
        const totalJogos = await Jogo.countDocuments();
        const totalEstadios = await Estadio.countDocuments();
        const totalTimes = await Time.countDocuments();
        const totalLives = await Live.countDocuments();
        const totalDivs = await DivHorizontal.countDocuments();
        const totalCards = await Card.countDocuments();
        const totalStreamers = await Streamer.countDocuments();

        console.log('📊 Verificação final:');
        console.log(`   ⚽ Jogos: ${totalJogos}`);
        console.log(`   🏟️ Estádios: ${totalEstadios}`);
        console.log(`   ⚽ Times: ${totalTimes}`);
        console.log(`   📺 Lives: ${totalLives}`);
        console.log(`   📦 Divs: ${totalDivs}`);
        console.log(`   🎴 Cards: ${totalCards}`);
        console.log(`   🎤 Streamers: ${totalStreamers}`);

        console.log('✅ Estrutura de jogos criada com sucesso');

        console.log('🎉 MongoDB populado com dados fakes!');
        
        return {
            success: true,
            message: 'MongoDB populado com dados fakes!',
            summary: {
                usuarios: usuariosFakes.length,
                apostas: apostasFakes.length,
                desafios: desafiosFakes.length, 
                chats: chatsFakes.length,
                jogos: totalJogos,
                estadios: totalEstadios,
                times: totalTimes,
                lives: totalLives,
                divs: totalDivs,
                cards: totalCards,
                streamers: totalStreamers
            }
        };
        
    } catch (error) {
        console.error('❌ Erro ao popular MongoDB com dados fakes:', error);
        return {
            success: false, 
            message: 'Erro ao popular MongoDB: ' + error.message
        };
    }
}

// ===== FUNÇÃO PARA MONTAR ESTRUTURA COMPLETA DOS JOGOS =====
export async function montarEstruturaJogos() {
    try {
        console.log('🔍 Montando estrutura completa dos jogos...');
        
        const jogos = await Jogo.find();
        console.log(`📋 Jogos encontrados: ${jogos.length}`);
        
        if (jogos.length === 0) {
            console.log('⚠️ Nenhum jogo encontrado no banco de dados');
            return [];
        }

        const jogosCompletos = await Promise.all(
            jogos.map(async (jogo) => {
                console.log(`🎮 Processando jogo: ${jogo.nome} (ID: ${jogo.id})`);
                
                const estadios = await Estadio.find({ jogoId: jogo.id });
                console.log(`   🏟️ Estádios encontrados para jogo ${jogo.id}: ${estadios.length}`);
                
                const estadiosComTimes = await Promise.all(
                    estadios.map(async (estadio) => {
                        console.log(`      Processando estádio: ${estadio.nome} (ID: ${estadio.id})`);
                        
                        const times = await Time.find({ estadioId: estadio.id });
                        console.log(`         ⚽ Times encontrados para estádio ${estadio.id}: ${times.length}`);
                        
                        const timesComLives = await Promise.all(
                            times.map(async (time) => {
                                console.log(`            Processando time: ${time.nome} (ID: ${time.id})`);
                                
                                const lives = await Live.find({ timeId: time.id });
                                console.log(`               📺 Lives encontradas para time ${time.id}: ${lives.length}`);
                                
                                const livesComDivs = await Promise.all(
                                    lives.map(async (live) => {
                                        console.log(`                  Processando live: ${live.titulo} (ID: ${live.id})`);
                                        
                                        const divsHorizontais = await DivHorizontal.find({ liveId: live.id });
                                        console.log(`                     📦 Divs encontradas para live ${live.id}: ${divsHorizontais.length}`);
                                        
                                        const divsComCards = await Promise.all(
                                            divsHorizontais.map(async (div) => {
                                                console.log(`                        Processando div: ${div.titulo} (ID: ${div.id})`);
                                                
                                                const cards = await Card.find({ divHorizontalId: div.id });
                                                console.log(`                           🎴 Cards encontrados para div ${div.id}: ${cards.length}`);
                                                
                                                return {
                                                    id: div.id,
                                                    titulo: div.titulo,
                                                    tamanho: div.tamanho,
                                                    criador: div.criador,
                                                    cards: cards.map(card => ({
                                                        id: card.id,
                                                        titulo: card.titulo,
                                                        iframeUrl: card.iframeUrl,
                                                        criador: card.criador
                                                    }))
                                                };
                                            })
                                        );
                                        
                                        const streamers = await Streamer.find({ liveId: live.id });
                                        console.log(`                     🎤 Streamers encontrados para live ${live.id}: ${streamers.length}`);
                                        
                                        return {
                                            id: live.id,
                                            titulo: live.titulo,
                                            descricao: live.descricao,
                                            status: live.status,
                                            criador: live.criador,
                                            divsHorizontais: divsComCards,
                                            streamers: streamers.map(streamer => ({
                                                id: streamer.id,
                                                nome: streamer.nome,
                                                usuario: streamer.usuario,
                                                online: streamer.online,
                                                imagem: streamer.imagem,
                                                chavePix: streamer.chavePix,
                                                merito: streamer.merito
                                            })),
                                            usuariosOnline: []
                                        };
                                    })
                                );
                                
                                return {
                                    id: time.id,
                                    nome: time.nome,
                                    imagem: time.imagem,
                                    lives: livesComDivs
                                };
                            })
                        );
                        
                        return {
                            id: estadio.id,
                            nome: estadio.nome,
                            imagem: estadio.imagem,
                            times: timesComLives
                        };
                    })
                );
                
                return {
                    id: jogo.id,
                    nome: jogo.nome,
                    imagem: jogo.imagem,
                    estadios: estadiosComTimes
                };
            })
        );
        
        console.log('✅ Estrutura de jogos montada com sucesso');
        return jogosCompletos;
        
    } catch (error) {
        console.error('❌ Erro ao montar estrutura de jogos:', error);
        return [];
    }
}

*/

// src/services/index.js
import {
    User, Aposta, Desafio, Chat, Jogo, Estadio, Time, Live, DivHorizontal, Card, Streamer, Notificacao, Evento
} from '../models/index.js';
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
        
        console.log('Dados antigos removidos');

        // === USUÁRIOS FAKES ===
        const usuariosFakes = [
            { id: 1, nome: "Usuário Teste", usuario: "usuario_teste", email: "usuario_teste@email.com", senha: await bcrypt.hash("123456", 10), merito: 500, imagem: "default-usuario.png" },
            { id: 2, nome: "Usuário Teste2", usuario: "usuario_teste2", email: "usuario_teste2@email.com", senha: await bcrypt.hash("123456", 10), merito: 450, imagem: "default-usuario.png" },
            { id: 3, nome: "Usuário Teste3", usuario: "usuario_teste3", email: "usuario_teste3@email.com", senha: await bcrypt.hash("123456", 10), merito: 500, imagem: "default-usuario.png" },
            { id: 4, nome: "Streamer A", usuario: "streamer_a", email: "streamer_a@email.com", senha: await bcrypt.hash("123456", 10), merito: 1000, imagem: "default-streamer.png" }
        ];
        
        await User.insertMany(usuariosFakes);
        console.log('Usuários fakes criados');

        // === APOSTAS E DESAFIOS ===
        const apostasFakes = [{
            cardId: "card-1",
            apostas: [{
                id: 1,
                titulo: "Quem ganha o clássico?",
                opcoes: ["Flamengo", "Vasco", "Empate"],
                valor: 100,
                dataEncerramento: new Date("2025-10-26T20:00:00"),
                criador: "usuario_teste",
                participantes: [{ usuario: "usuario_teste2", opcao: "Flamengo", data: new Date() }],
                status: "aberta"
            }],
            criador: "usuario_teste",
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
                criador: "usuario_teste",
                participantes: [{ usuario: "usuario_teste2", opcao: "Flamengo", data: new Date() }],
                status: "aberto"
            }],
            criador: "usuario_teste",
            dataCriacao: new Date()
        }];

        await Aposta.insertMany(apostasFakes);
        await Desafio.insertMany(desafiosFakes);
        console.log('Apostas e desafios fakes criados');

        // === ESTRUTURA DE JOGOS ===
        const jogo = await Jogo.create({ id: 1, nome: "Campeonato Brasileiro 2023", imagem: "default-jogo.png" });
        const estadio = await Estadio.create({ id: 1, jogoId: 1, nome: "Maracanã", imagem: "default-estadio.png" });
        const time = await Time.create({ id: 1, estadioId: 1, nome: "Flamengo", imagem: "default-time.png" });
        const live = await Live.create({ id: 1, timeId: 1, titulo: "Flamengo vs Vasco", status: "ativa", criador: "streamer_a" });

        const div1 = await DivHorizontal.create({ id: 1, liveId: 1, titulo: "Transmissões", tamanho: "grande", criador: "streamer_a" });
        const div2 = await DivHorizontal.create({ id: 2, liveId: 1, titulo: "Torcida", tamanho: "medio", criador: "usuario_teste" });

        await Card.insertMany([
            { id: 1, divHorizontalId: 1, titulo: "Transmissão Oficial", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4", criador: "streamer_a" },
            { id: 2, divHorizontalId: 2, titulo: "Torcida do Flamengo", iframeUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ", criador: "usuario_teste" }
        ]);

        await Streamer.create({ id: 1, liveId: 1, nome: "Streamer A", usuario: "streamer_a", online: true, imagem: "default-streamer.png", merito: 1000 });

        console.log('Estrutura de jogos criada');

        // === CHAT TOTALMENTE REFEITO: UMA MENSAGEM POR REGISTRO, COM `room` ===
        const mensagensFakes = [
            { room: "live-1-visitante", usuario: "usuario_teste", mensagem: "Bora Flamengo!", data: new Date(Date.now() - 3600000) },
            { room: "live-1-visitante", usuario: "usuario_teste2", mensagem: "Vai que é tua, Vascão!", data: new Date(Date.now() - 3000000) },
            { room: "live-1-visitante", usuario: "streamer_a", mensagem: "Transmissão ao vivo começando!", data: new Date(Date.now() - 2400000) },
            { room: "live-1-500", usuario: "usuario_teste", mensagem: "Alguém com mérito alto aqui?", data: new Date(Date.now() - 1800000) },
            { room: "jogo-1-visitante", usuario: "usuario_teste3", mensagem: "Clássico pegado hoje!", data: new Date(Date.now() - 1200000) },
            { room: "card-1-visitante", usuario: "usuario_teste", mensagem: "Esse card tá top!", data: new Date(Date.now() - 600000) }
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

        console.log('VERIFICAÇÃO FINAL:', counts);
        console.log('MongoDB populado com sucesso!');

        return { success: true, message: 'Dados fakes inseridos!', summary: counts };

    } catch (error) {
        console.error('ERRO AO POPULAR:', error);
        return { success: false, message: error.message };
    }
}

// ===== MONTAR ESTRUTURA DE JOGOS (INALTERADA, SÓ LOGS MELHORADOS) =====
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
                                            divsHorizontais: divsComCards,
                                            streamers: streamers.map(s => ({
                                                id: s.id,
                                                nome: s.nome,
                                                usuario: s.usuario,
                                                online: s.online,
                                                imagem: s.imagem,
                                                merito: s.merito
                                            }))
                                        };
                                    })
                                );
                                return { id: time.id, nome: time.nome, imagem: time.imagem, lives: livesComDivs };
                            })
                        );
                        return { id: estadio.id, nome: estadio.nome, imagem: estadio.imagem, times: timesComLives };
                    })
                );
                return { id: jogo.id, nome: jogo.nome, imagem: jogo.imagem, estadios: estadiosComTimes };
            })
        );

        return jogosCompletos;
    } catch (error) {
        console.error('ERRO AO MONTAR ESTRUTURA:', error);
        return [];
    }
}