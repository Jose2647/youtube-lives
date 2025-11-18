import express from 'express';
import jwt from 'jsonwebtoken';
// Importa TODOS os models do seu arquivo models.js
import { 
    User, 
    Aposta, 
    Desafio, 
    Jogo, 
    Estadio, 
    Time, 
    Live, 
    DivHorizontal, 
    Card,
    Chat, 
    IframeRegistro // <-- ADICIONAR ESTA LINHA
} from '../models/models.js';
// Importa o serviço de popular (usado em /populate-fake-data)
// Importa os serviços necessários
import { popularMongoDBComDadosFakes, montarEstruturaJogos } from '../services/index.js';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Pego de routers01.js

// === MIDDLEWARE AUTH OPCIONAL (copiado de routers01.js) ===
const authOptional = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;  // { userId }
        } catch (e) {
            req.user = { userId: null, nome: 'Anônimo', merito: 0 };
        }
    } else {
        req.user = { userId: null, nome: 'Anônimo', merito: 0 };
    }
    next();
};



/**
 * Rota GET /jogos
 * Retorna todos os jogos E SUAS SUB-ESTRUTURAS (Estadios, Times, etc.)
 * usando o serviço montarEstruturaJogos.
 */
router.get('/jogos',  async (req, res) => {
    try {
        // Chama o serviço que busca e aninha os dados
        const jogosComEstrutura = await montarEstruturaJogos();
        
        // Envia a estrutura completa para o frontend
        res.json(jogosComEstrutura);

    } catch (err) {
        console.error('Erro ao montar estrutura de jogos:', err);
        res.status(500).json({ msg: 'Erro ao consultar e montar jogos', error: err.message });
    }
});
/**
 * Rota GET /jogos/:id
 * Retorna um jogo específico sem alterar o DB.
 */
router.get('/jogos/:id', async (req, res) => {
    try {
        const jogo = await Jogo.findOne({ id: parseInt(req.params.id) });
        if (!jogo) return res.status(404).json({ msg: 'Jogo não encontrado' });
        res.json(jogo);
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao consultar jogo', error: err.message });
    }
});

// === MIDDLEWARE AUTH OBRIGATÓRIO (para rotas sensíveis como POST/PUT) ===
const authRequired = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'Autenticação necessária' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;  // { userId }
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};

/**
 * Rota POST /jogos
 * Recebe o array [dados.jogos] COMPLETO do frontend e sincroniza
 * todo o estado com o MongoDB SEM LIMPAR TUDO.
 * Usa upsert para atualizar ou inserir.
 * (VERSÃO COM LOGS DETALHADOS)
 */
router.post('/jogos', authRequired, async (req, res) => {
    const novosJogos = req.body; // Este é o [dados.jogos] do frontend
    const userId = req.user.userId; // <-- Pega o ID do usuário logado

    // <-- LOG ADICIONADO
 //   console.log(`[SYNC_INICIADO] Usuário ${userId} está sincronizando ${novosJogos.length} jogos.`);

    if (!Array.isArray(novosJogos)) {
        return res.status(400).json({ msg: 'Formato de dados inválido. Esperava-se um array.' });
    }

    try {
        let totalAtualizados = 0;
        let totalInseridos = 0;

        for (const jogoData of novosJogos) {
            const { estadios, ...jogoInfo } = jogoData;
            const frontendIdJogo = jogoInfo.id;
            delete jogoInfo.id;

            // <-- LOG ADICIONADO
         //   console.log(`[SYNC_JOGO] User ${userId} | Processando Jogo ID ${frontendIdJogo}`);

            // Upsert Jogo
            const jogoUpsert = await Jogo.findOneAndUpdate(
                { id: frontendIdJogo },
                { ...jogoInfo, id: frontendIdJogo },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            totalAtualizados += jogoUpsert.wasUpdated ? 1 : 0;
            totalInseridos += jogoUpsert.wasInserted ? 1 : 0;

            if (estadios && Array.isArray(estadios)) {
                for (const estadioData of estadios) {
                    const { times, ...estadioInfo } = estadioData;
                    const frontendIdEstadio = estadioInfo.id;
                    delete estadioInfo.id;

                    // <-- LOG ADICIONADO
                 //   console.log(`  [SYNC_ESTADIO] User ${userId} | Jogo ${frontendIdJogo} | Estadio ID ${frontendIdEstadio}`);

                    const estadioUpsert = await Estadio.findOneAndUpdate(
                        { id: frontendIdEstadio, jogoId: jogoUpsert.id },
                        { ...estadioInfo, id: frontendIdEstadio, jogoId: jogoUpsert.id },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    if (times && Array.isArray(times)) {
                        for (const timeData of times) {
                            const { lives, ...timeInfo } = timeData;
                            const frontendIdTime = timeInfo.id;
                            delete timeInfo.id;

                            // <-- LOG ADICIONADO
                       //     console.log(`    [SYNC_TIME] User ${userId} | Estadio ${frontendIdEstadio} | Time ID ${frontendIdTime}`);

                            const timeUpsert = await Time.findOneAndUpdate(
                                { id: frontendIdTime, estadioId: estadioUpsert.id },
                                { ...timeInfo, id: frontendIdTime, estadioId: estadioUpsert.id },
                                { upsert: true, new: true, setDefaultsOnInsert: true }
                            );

                            if (lives && Array.isArray(lives)) {
                                for (const liveData of lives) {
                                    const { divsHorizontais, ...liveInfo } = liveData;
                                    const frontendIdLive = liveInfo.id;
                                    delete liveInfo.id;

                                    // <-- LOG ADICIONADO
                           //         console.log(`      [SYNC_LIVE] User ${userId} | Time ${frontendIdTime} | Live ID ${frontendIdLive}`);

                                    const liveUpsert = await Live.findOneAndUpdate(
                                        { id: frontendIdLive, timeId: timeUpsert.id },
                                        { ...liveInfo, id: frontendIdLive, timeId: timeUpsert.id },
                                        { upsert: true, new: true, setDefaultsOnInsert: true }
                                    );

                                    if (divsHorizontais && Array.isArray(divsHorizontais)) {
                                        for (const divData of divsHorizontais) {
                                            const { cards, ...divInfo } = divData;
                                            const frontendIdDiv = divInfo.id;
                                            delete divInfo.id;

                                            // <-- LOG ADICIONADO
                                //            console.log(`        [SYNC_DIV] User ${userId} | Live ${frontendIdLive} | Div ID ${frontendIdDiv}`);

                                            const divUpsert = await DivHorizontal.findOneAndUpdate(
                                                { id: frontendIdDiv, liveId: liveUpsert.id },
                                                { ...divInfo, id: frontendIdDiv, liveId: liveUpsert.id },
                                                { upsert: true, new: true, setDefaultsOnInsert: true }
                                            );

                                            if (cards && Array.isArray(cards)) {
                                                for (const cardData of cards) {
                                                    const frontendIdCard = cardData.id;
                                                    delete cardData.id;

                                                    // <-- LOG ADICIONADO
                                                    //console.log(`          [SYNC_CARD] User ${userId} | Div ${frontendIdDiv} | Card ID ${frontendIdCard}`);

                                                    const cardUpsert = await Card.findOneAndUpdate(
                                                        { id: frontendIdCard, divHorizontalId: divUpsert.id },
                                                        { ...cardData, id: frontendIdCard, divHorizontalId: divUpsert.id },
                                                        { upsert: true, new: true, setDefaultsOnInsert: true }
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // <-- LOG ADICIONADO
    //    console.log(`[SYNC_CONCLUÍDO] Sincronização do Usuário ${userId} finalizada. ${totalInseridos} inseridos, ${totalAtualizados} atualizados.`);

        res.status(201).json({ msg: 'Dados sincronizados com sucesso!', totalJogos: novosJogos.length, atualizados: totalAtualizados, inseridos: totalInseridos });

    } catch (err) {
        // <-- LOG ADICIONADO (melhorado)
        console.error(`[SYNC_ERRO] Erro durante sincronização do Usuário ${userId}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao salvar dados.', error: err.message });
    }
});


router.post('/jogo', authRequired, async (req, res) => {
    try {
        const dados = req.body;

        const novo = new Jogo({
            ...dados,
            creatorId: req.user.userId
        });
        console.log("o que chegou em router.post('/jogo', authRequired...",novo)

        await novo.save();
        res.json(novo);
        console.log("o novo depois de res.json(novo);...",novo)


    } catch (err) {
        res.status(500).json({ msg: 'Erro ao criar jogo', error: err.message });
    }
});
/**
 * Rota POST /estadio
 * Cria um novo estádio individualmente
 */
router.post('/estadio', authRequired, async (req, res) => {
    try {
        const dados = req.body;
        
        // Garante que o creatorId seja do usuário logado
        const novoEstadio = new Estadio({
            ...dados,
            creatorId: req.user.userId,
            // Se o frontend mandar senha, usa ela, senão pega do usuário (segurança extra)
            senha: dados.senha || req.user.senha 
        });

        await novoEstadio.save();
        res.json(novoEstadio);
        console.log(`[CRIAR_ESTADIO] ID: ${novoEstadio.id} criado por ${req.user.userId}`);

    } catch (err) {
        console.error('Erro ao criar estádio:', err);
        res.status(500).json({ msg: 'Erro ao criar estádio', error: err.message });
    }
});
/**
 * Rota POST /time
 * Cria um novo time individualmente
 */
router.post('/time', authRequired, async (req, res) => {
    try {
        const dados = req.body;
        
        const novoTime = new Time({
            ...dados,
            creatorId: req.user.userId,
            senha: dados.senha || req.user.senha
        });

        await novoTime.save();
        res.json(novoTime);
        console.log(`[CRIAR_TIME] ID: ${novoTime.id} criado por ${req.user.userId}`);

    } catch (err) {
        console.error('Erro ao criar time:', err);
        res.status(500).json({ msg: 'Erro ao criar time', error: err.message });
    }
});
/**
 * Rota POST /live
 * Cria uma nova live individualmente
 */
router.post('/live', authRequired, async (req, res) => {
    try {
        const dados = req.body;
        
        const novaLive = new Live({
            ...dados,
            creatorId: req.user.userId,
            senha: dados.senha || req.user.senha
        });

        await novaLive.save();
        res.json(novaLive);
        console.log(`[CRIAR_LIVE] ID: ${novaLive.id} criado por ${req.user.userId}`);

    } catch (err) {
        console.error('Erro ao criar live:', err);
        res.status(500).json({ msg: 'Erro ao criar live', error: err.message });
    }
});
/**
 * Rota POST /div
 * Cria uma nova DivHorizontal individualmente
 */
router.post('/div', authRequired, async (req, res) => {
    try {
        const dados = req.body;
        
        const novaDiv = new DivHorizontal({
            ...dados,
            creatorId: req.user.userId,
            senha: dados.senha || req.user.senha
        });

        await novaDiv.save();
        res.json(novaDiv);
        console.log(`[CRIAR_DIV] ID: ${novaDiv.id} criado por ${req.user.userId}`);

    } catch (err) {
        console.error('Erro ao criar div:', err);
        res.status(500).json({ msg: 'Erro ao criar div', error: err.message });
    }
});
/**
 * Rota POST /card
 * Cria um novo Card individualmente
 */
router.post('/card', authRequired, async (req, res) => {
    try {
        const dados = req.body;
        
        const novoCard = new Card({
            ...dados,
            creatorId: req.user.userId,
            senha: dados.senha || req.user.senha
        });

        await novoCard.save();
        res.json(novoCard);
        console.log(`[CRIAR_CARD] ID: ${novoCard.id} criado por ${req.user.userId}`);

    } catch (err) {
        console.error('Erro ao criar card:', err);
        res.status(500).json({ msg: 'Erro ao criar card', error: err.message });
    }
});


/**
 * Rota PUT /jogos/:id
 * Atualiza um jogo específico (e subestruturas se enviadas) sem limpar o DB.
 * Envie apenas os campos a atualizar no body.
 */
router.put('/jogos/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const jogo = await Jogo.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            updateData,
            { new: true }
        );
        if (!jogo) return res.status(404).json({ msg: 'Jogo não encontrado' });
        // Se houver subestruturas (estadios, etc.), adicione lógica similar ao POST, mas só para o jogo específico
        res.json({ msg: 'Jogo atualizado com sucesso', jogo });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao atualizar jogo', error: err.message });
    }
});
router.put('/jogo/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const jogo = await Jogo.findOne({ id: parseInt(req.params.id) });

        if (!jogo) return res.status(404).json({ msg: 'Jogo não encontrado' });

        if (jogo.creatorId !== req.user.userId)
            return res.status(403).json({ msg: 'Permissão negada' });

        Object.assign(jogo, updateData);
        await jogo.save();

        res.json({ msg: 'Jogo atualizado', jogo });

    } catch (err) {
        res.status(500).json({ msg: 'Erro ao atualizar jogo', error: err.message });
    }
});
// Em routers.js
/**
 * Rota PUT /estadio/:id
 * Atualiza um estádio específico.
 */
router.put('/estadio/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const estadioId = parseInt(req.params.id);
        
        // Encontra o estádio
        const estadio = await Estadio.findOne({ id: estadioId });
        if (!estadio) return res.status(404).json({ msg: 'Estádio não encontrado' });

        // Verificação de permissão (o usuário logado deve ser o criador)
        if (estadio.creatorId !== req.user.userId) {
            return res.status(403).json({ msg: 'Permissão negada. Você não é o criador deste estádio.' });
        }

        // Remove campos sensíveis ou imutáveis do updateData se necessário (ex: id)
        delete updateData.id;
        delete updateData.creatorId;
        delete updateData.senha; // O backend valida pelo Token, não pela senha no corpo

        // Atualiza e salva
        Object.assign(estadio, updateData);
        await estadio.save();

        res.json({ msg: 'Estádio atualizado com sucesso', estadio });

    } catch (err) {
        console.error(`Erro ao atualizar estádio ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro ao atualizar estádio', error: err.message });
    }
});
/**
 * Rota PUT /time/:id
 * Atualiza um time específico.
 */
router.put('/time/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const timeId = parseInt(req.params.id);

        const time = await Time.findOne({ id: timeId });
        if (!time) return res.status(404).json({ msg: 'Time não encontrado' });

        if (time.creatorId !== req.user.userId) {
            return res.status(403).json({ msg: 'Permissão negada. Você não é o criador deste time.' });
        }

        delete updateData.id;
        delete updateData.creatorId;
        delete updateData.senha;

        Object.assign(time, updateData);
        await time.save();

        res.json({ msg: 'Time atualizado com sucesso', time });

    } catch (err) {
        console.error(`Erro ao atualizar time ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro ao atualizar time', error: err.message });
    }
});
/**
 * Rota PUT /live/:id
 * Atualiza uma live específica.
 */
router.put('/live/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const liveId = parseInt(req.params.id);

        const live = await Live.findOne({ id: liveId });
        if (!live) return res.status(404).json({ msg: 'Live não encontrada' });

        if (live.creatorId !== req.user.userId) {
            return res.status(403).json({ msg: 'Permissão negada.' });
        }

        delete updateData.id;
        delete updateData.creatorId;
        delete updateData.senha;

        Object.assign(live, updateData);
        await live.save();

        res.json({ msg: 'Live atualizada com sucesso', live });

    } catch (err) {
        console.error(`Erro ao atualizar live ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro ao atualizar live', error: err.message });
    }
});
/**
 * Rota PUT /div/:id
 * Atualiza uma DivHorizontal.
 */
router.put('/div/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const divId = parseInt(req.params.id);

        const div = await DivHorizontal.findOne({ id: divId });
        if (!div) return res.status(404).json({ msg: 'Div não encontrada' });

        if (div.creatorId !== req.user.userId) {
            return res.status(403).json({ msg: 'Permissão negada.' });
        }

        delete updateData.id;
        delete updateData.creatorId;
        delete updateData.senha;

        Object.assign(div, updateData);
        await div.save();

        res.json({ msg: 'Div atualizada com sucesso', div });

    } catch (err) {
        console.error(`Erro ao atualizar div ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro ao atualizar div', error: err.message });
    }
});
/**
 * Rota PUT /card/:id
 * Atualiza um Card.
 */
router.put('/card/:id', authRequired, async (req, res) => {
    try {
        const updateData = req.body;
        const cardId = parseInt(req.params.id);

        const card = await Card.findOne({ id: cardId });
        if (!card) return res.status(404).json({ msg: 'Card não encontrado' });

        if (card.creatorId !== req.user.userId) {
            return res.status(403).json({ msg: 'Permissão negada.' });
        }

        delete updateData.id;
        delete updateData.creatorId;
        delete updateData.senha;

        Object.assign(card, updateData);
        await card.save();

        res.json({ msg: 'Card atualizado com sucesso', card });

    } catch (err) {
        console.error(`Erro ao atualizar card ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro ao atualizar card', error: err.message });
    }
});


/**
 * Rota DELETE /jogo/:id (SINGULAR)
 * Exclui um jogo. 
 * NOTA: Esta rota é singular ('/jogo') para corresponder ao JogoCRUD.js
 */
router.delete('/jogo/:id', authRequired, async (req, res) => {
    try {
        const jogoId = parseInt(req.params.id);
        const userId = req.user.userId;

        const jogo = await Jogo.findOne({ id: jogoId });

        if (!jogo) {
            return res.status(404).json({ msg: 'Jogo não encontrado' });
        }

        // Verificação de permissão
        if (jogo.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir jogo ${jogoId} do criador ${jogo.creatorId}`);
            return res.status(403).json({ msg: 'Permissão negada. Você não é o criador.' });
        }

        // Lógica de exclusão (simples)
        // ATENÇÃO: Isso exclui o Jogo, mas pode deixar Estádios, Times, etc. órfãos.
        // Uma exclusão em cascata completa seria mais complexa.
        await Jogo.findOneAndDelete({ id: jogoId });

        console.log(`[JOGO_EXCLUÍDO] Jogo ${jogoId} excluído pelo usuário ${userId}`);
        res.json({ msg: 'Jogo excluído com sucesso' });

    } catch (err) {
        console.error(`[DELETE_JOGO_ERRO] Erro ao excluir jogo ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir jogo.', error: err.message });
    }
});
/**
 * Rota DELETE /estadio/:id
 * Exclui um estádio.
 */
router.delete('/estadio/:id', authRequired, async (req, res) => {
    try {
        const estadioId = parseInt(req.params.id);
        const userId = req.user.userId;

        // Encontra o estádio
        const estadio = await Estadio.findOne({ id: estadioId });
        if (!estadio) return res.status(404).json({ msg: 'Estádio não encontrado' });

        // Verificação de permissão (assumindo que Estadio tem creatorId)
        if (estadio.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir estádio ${estadioId}`);
            return res.status(403).json({ msg: 'Permissão negada' });
        }

        // Exclui
        await Estadio.findOneAndDelete({ id: estadioId });
        // ATENÇÃO: Isso pode deixar Times/Lives órfãos. 
        // A exclusão em cascata completa exigiria apagar os filhos primeiro.
        
        console.log(`[ESTÁDIO_EXCLUÍDO] Estádio ${estadioId} excluído pelo usuário ${userId}`);
        res.json({ msg: 'Estádio excluído com sucesso' });

    } catch (err) {
        console.error(`[DELETE_ESTADIO_ERRO] Erro ao excluir estádio ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir estádio.', error: err.message });
    }
});
/**
 * Rota DELETE /time/:id
 * Exclui um time.
 */
router.delete('/time/:id', authRequired, async (req, res) => {
    try {
        const timeId = parseInt(req.params.id);
        const userId = req.user.userId;

        const time = await Time.findOne({ id: timeId });
        if (!time) return res.status(404).json({ msg: 'Time não encontrado' });

        // Verificação de permissão
        if (time.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir time ${timeId}`);
            return res.status(403).json({ msg: 'Permissão negada' });
        }

        await Time.findOneAndDelete({ id: timeId });
        console.log(`[TIME_EXCLUÍDO] Time ${timeId} excluído pelo usuário ${userId}`);
        res.json({ msg: 'Time excluído com sucesso' });

    } catch (err) {
        console.error(`[DELETE_TIME_ERRO] Erro ao excluir time ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir time.', error: err.message });
    }
});
/**
 * Rota DELETE /live/:id
 * Exclui uma live.
 */
router.delete('/live/:id', authRequired, async (req, res) => {
    try {
        const liveId = parseInt(req.params.id);
        const userId = req.user.userId;

        const live = await Live.findOne({ id: liveId });
        if (!live) return res.status(404).json({ msg: 'Live não encontrada' });

        // Verificação de permissão
        if (live.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir live ${liveId}`);
            return res.status(403).json({ msg: 'Permissão negada' });
        }

        // Exclui
        await Live.findOneAndDelete({ id: liveId });
        // ATENÇÃO: Isso pode deixar Divs e Cards órfãos no DB.
        
        console.log(`[LIVE_EXCLUÍDA] Live ${liveId} excluída pelo usuário ${userId}`);
        res.json({ msg: 'Live excluída com sucesso' });

    } catch (err) {
        console.error(`[DELETE_LIVE_ERRO] Erro ao excluir live ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir live.', error: err.message });
    }
});
/**
 * Rota DELETE /div/:id
 * Exclui uma DivHorizontal.
 */
router.delete('/div/:id', authRequired, async (req, res) => {
    try {
        const divId = parseInt(req.params.id);
        const userId = req.user.userId;

        const div = await DivHorizontal.findOne({ id: divId });
        if (!div) return res.status(404).json({ msg: 'Div não encontrada' });

        // Verificação de permissão
        if (div.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir div ${divId}`);
            return res.status(403).json({ msg: 'Permissão negada' });
        }

        // Exclui
        await DivHorizontal.findOneAndDelete({ id: divId });
        // ATENÇÃO: Isso pode deixar Cards órfãos no DB.
        
        console.log(`[DIV_EXCLUÍDA] Div ${divId} excluída pelo usuário ${userId}`);
        res.json({ msg: 'Div excluída com sucesso' });

    } catch (err) {
        console.error(`[DELETE_DIV_ERRO] Erro ao excluir div ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir div.', error: err.message });
    }
});
/**
 * Rota DELETE /card/:id
 * Exclui um card.
 */
router.delete('/card/:id', authRequired, async (req, res) => {
    try {
        const cardId = parseInt(req.params.id);
        const userId = req.user.userId;

        const card = await Card.findOne({ id: cardId });
        if (!card) return res.status(404).json({ msg: 'Card não encontrado' });

        // Verificação de permissão
        if (card.creatorId !== userId) {
            console.warn(`[PERMISSÃO_NEGADA] Usuário ${userId} tentando excluir card ${cardId}`);
            return res.status(403).json({ msg: 'Permissão negada' });
        }

        await Card.findOneAndDelete({ id: cardId });
        console.log(`[CARD_EXCLUÍDO] Card ${cardId} excluído pelo usuário ${userId}`);
        res.json({ msg: 'Card excluído com sucesso' });

    } catch (err) {
        console.error(`[DELETE_CARD_ERRO] Erro ao excluir card ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Erro no servidor ao excluir card.', error: err.message });
    }
});








 
router.post('/iframe-registro', authOptional, async (req, res) => {
    if (!req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária' });
    try {
        const { iframeUrl, origemTipo, origemId } = req.body;
        const novoRegistro = new IframeRegistro({
            iframeUrl,
            origemTipo,
            origemId,
            creatorId: req.user.userId // Agora Number
        });
        await novoRegistro.save();
        res.json({ msg: 'Iframe registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao registrar iframe', error: err.message });
    }
});
// POST: Criar item (auth opcional, mas obrigatório para 'dinheiro')
router.post('/sala/:cardId/:tipo', authOptional, async (req, res) => {
    try {
        const { cardId, tipo } = req.params;
        const itemData = req.body;  // { ..., tipoPagamento: 'pontos' | 'dinheiro' }
        const Model = tipo === 'apostas' ? Aposta : Desafio;

        // Se 'dinheiro', exige auth e validações extras
        if (itemData.tipoPagamento === 'dinheiro') {
            if (!req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para apostas com dinheiro' });
            const user = await User.findById(req.user.userId);
            if (!user.contaBancaria || !user.chavePix) return res.status(400).json({ msg: 'Conta bancária/Pix obrigatória para dinheiro' });
            if (itemData.valor > user.merito * 10) {  // Ex.: mérito em pontos converte para R$, ajuste lógica
                return res.status(400).json({ msg: 'Saldo insuficiente para aposta em dinheiro' });
            }
            user.merito -= itemData.valor / 10;  // Exemplo de conversão
            await user.save();
        } else {  // Pontos: anônimo ok, sem dedução
            if (req.user.userId) {
                const user = await User.findById(req.user.userId);
                if (itemData.valor > user.merito) return res.status(400).json({ msg: 'Saldo insuficiente em pontos' });
                user.merito -= itemData.valor;
                await user.save();
            }
        }

        let sala = await Model.findOne({ cardId });
        if (!sala) {
            sala = new Model({ cardId, [tipo]: [], criador: req.user.nome || 'Anônimo', dataCriacao: new Date() });
        }
        const novoItem = {
            id: sala[tipo].length + 1,
            ...itemData,
            status: tipo === 'apostas' ? 'aberta' : 'aberto',
            dataCriacao: new Date(),
            criador: req.user.userId || req.user.nome || 'Anônimo'
        };
        sala[tipo].push(novoItem);
        await sala.save();

        // Emit socket (se req.io configurado)
        if (req.io) {
            const room = `${cardId}-${tipo}-${req.user.merito || 0}`;
            const eventName = tipo === 'apostas' ? 'nova-aposta' : 'nova-desafio';
            req.io.to(room).emit(eventName, { cardId, [tipo === 'apostas' ? 'aposta' : 'desafio']: novoItem, sala });
        }

        res.json({ msg: `${tipo} criado (${itemData.tipoPagamento || 'pontos'})`, sala });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});
// PUT: Atualizar (similar, com check 'dinheiro')
router.put('/sala/:cardId/:tipo/:itemId', authOptional, async (req, res) => {
    try {
        const { cardId, tipo, itemId } = req.params;
        const updateData = req.body;
        const Model = tipo === 'apostas' ? Aposta : Desafio;
        const sala = await Model.findOne({ cardId });
        if (!sala) return res.status(404).json({ msg: 'Sala não encontrada' });

        const itemIndex = sala[tipo].findIndex(i => i.id === parseInt(itemId));
        if (itemIndex === -1) return res.status(404).json({ msg: 'Item não encontrado' });

        const item = sala[tipo][itemIndex];
        const userMerito = req.user.merito || 0;

        // Participar: Check mérito criador + saldo (pontos ou dinheiro)
        if (updateData.opcao) {
            const criadorItem = await User.findOne({ id: item.criador }).select('merito');
            if (criadorItem && criadorItem.merito !== userMerito) return res.status(400).json({ msg: 'Mérito incompatível' });
            if (item.tipoPagamento === 'dinheiro' && !req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para dinheiro' });
            const user = req.user.userId ? await User.findById(req.user.userId) : null;
            if (user && item.valor > (item.tipoPagamento === 'dinheiro' ? user.merito * 10 : user.merito)) {
                return res.status(400).json({ msg: `Saldo insuficiente (${item.tipoPagamento})` });
            }
            if (user) {
                user.merito -= item.valor / (item.tipoPagamento === 'dinheiro' ? 10 : 1);
                await user.save();
            }
            item.participantes.push({
                usuario: req.user.userId || req.user.nome || 'Anônimo',
                opcao: updateData.opcao,
                data: new Date()
            });
        }

        // Encerrar: Distribui mérito (sem mudanças, pois creator já validado)
        if (updateData.opcaoVencedora) {
            item.opcaoVencedora = updateData.opcaoVencedora;
            item.status = tipo === 'apostas' ? 'encerrada' : 'encerrado';
            const participantes = item.participantes;
            const vencedores = participantes.filter(p => p.opcao === item.opcaoVencedora);
            const totalPremio = item.valor * participantes.length;
            for (const vencedor of vencedores) {
                const userVencedor = await User.findOne({ id: vencedor.usuario });
                if (userVencedor) {
                    const premioPorUser = totalPremio / vencedores.length;
                    userVencedor.merito += item.tipoPagamento === 'dinheiro' ? premioPorUser / 10 : premioPorUser;  // Converte se dinheiro
                    await userVencedor.save();
                }
            }
        }

        // Comprovante (só para dinheiro)
        if (updateData.comprovante && item.tipoPagamento === 'dinheiro') {
            if (!req.user.userId) return res.status(401).json({ msg: 'Autenticação necessária para comprovante' });
            item.comprovantes = item.comprovantes || [];
            item.comprovantes.push({
                usuario: req.user.userId,
                comprovante: updateData.comprovante,
                data: new Date(),
                status: 'pendente'
            });
        }

        sala[tipo][itemIndex] = { ...item, ...updateData };
        await sala.save();

        if (req.io) {
            const room = `${cardId}-${tipo}-${userMerito}`;
            const eventName = tipo === 'apostas' ? 'aposta-atualizada' : 'desafio-atualizado';
            req.io.to(room).emit(eventName, { cardId, itemId, updates: updateData, sala });
        }

        res.json({ msg: `${tipo} atualizado`, sala });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


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

export default router;


