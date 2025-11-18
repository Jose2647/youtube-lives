// JogoCRUD.js - Função adicionarJogo CORRIGIDA
function adicionarJogo(dados, dadosJogo = {}) {
    const novoId = gerarNovoId(dados.jogos);
    
    // Obtém o usuário logado dinamicamente
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao"; // Valor padrão
    
    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        // CORREÇÃO: A senha está no objeto window.usuarioLogado
        senhaUsuario = window.usuarioLogado.senha; 
        console.log(`👤 Criando jogo como usuário logado:`, {
            nome: criadorNome,
            id: creatorId,
            temSenha: !!senhaUsuario,
            senha: senhaUsuario ? `${senhaUsuario.substring(0, 10)}...` : 'não'
        });
    } else {
        console.warn("⚠️ Nenhum usuário logado. Jogo será criado sem creatorId.");
    }

    const novoJogo = {
        id: novoId,
        nome: `Novo Jogo ${novoId}`,
        iframeUrl: '',
        estadios: [],
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← USA A SENHA DO USUÁRIO
        ...dadosJogo,
        id: novoId, // Garante que o ID não seja sobrescrito
    };
    
    dados.jogos.push(novoJogo);
    console.log(`✅ Jogo criado localmente com creatorId: ${creatorId} e senha`);
    return novoJogo;
}
function adicionarEstadio(dados, jogoId, dadosEstadio = {}) {
    const jogo = encontrarJogo(dados, jogoId);
    if (!jogo) return null;

    const novoId = gerarNovoId(jogo.estadios);
    
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao";

    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        senhaUsuario = window.usuarioLogado.senha; // ← SENHA DO USUÁRIO
    }

    const novoEstadio = {
        id: novoId,
        jogoId: jogoId,
        nome: `Novo Estádio ${novoId}`,
        iframeUrl: '',
        times: [],
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← ADICIONAR SENHA
        ...dadosEstadio,
        id: novoId,
    };

    jogo.estadios.push(novoEstadio);
    return novoEstadio;
}
function adicionarTime(dados, jogoId, estadioId, dadosTime = {}) {
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    if (!estadio) return null;

    const novoId = gerarNovoId(estadio.times);
    
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao";

    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        senhaUsuario = window.usuarioLogado.senha; // ← SENHA DO USUÁRIO
    }

    const novoTime = {
        id: novoId,
        estadioId: estadioId,
        nome: `Novo Time ${novoId}`,
        iframeUrl: '',
        lives: [],
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← ADICIONAR SENHA
        ...dadosTime,
        id: novoId,
    };

    estadio.times.push(novoTime);
    return novoTime;
}
function adicionarLive(dados, jogoId, estadioId, timeId, dadosLive = {}) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    if (!time) return null;

    const novoId = gerarNovoId(time.lives);
    
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao";

    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        senhaUsuario = window.usuarioLogado.senha; // ← SENHA DO USUÁRIO
    }

    const novaLive = {
        id: novoId,
        timeId: timeId,
        titulo: `Nova Live ${novoId}`,
        descricao: '',
        status: 'offline',
        iframeUrl: '',
        divsHorizontais: [],
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← ADICIONAR SENHA
        dataCriacao: new Date(),
        ...dadosLive,
        id: novoId,
    };

    time.lives.push(novaLive);
    return novaLive;
}
function adicionarDiv(dados, jogoId, estadioId, timeId, liveId, dadosDiv = {}) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    if (!live) return null;

    const novoId = gerarNovoId(live.divsHorizontais);
    
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao";

    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        senhaUsuario = window.usuarioLogado.senha; // ← SENHA DO USUÁRIO
    }

    const novaDiv = {
        id: novoId,
        liveId: liveId,
        titulo: `Nova Div ${novoId}`,
        tamanho: '100%',
        cards: [],
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← ADICIONAR SENHA
        ...dadosDiv,
        id: novoId,
    };

    live.divsHorizontais.push(novaDiv);
    return novaDiv;
}
function adicionarCard(dados, jogoId, estadioId, timeId, liveId, divId, dadosCard = {}) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    if (!div) return null;

    const novoId = gerarNovoId(div.cards);
    
    let creatorId = null;
    let criadorNome = "Usuário Anônimo";
    let senhaUsuario = "senha_padrao";

    if (window.usuarioLogado) {
        creatorId = window.usuarioLogado.id;
        criadorNome = window.usuarioLogado.nome || window.usuarioLogado.email;
        senhaUsuario = window.usuarioLogado.senha; // ← SENHA DO USUÁRIO
    }

    const novoCard = {
        id: novoId,
        divHorizontalId: divId,
        titulo: `Novo Card ${novoId}`,
        iframeUrl: '',
        creatorId: creatorId,
        criador: criadorNome,
        senha: senhaUsuario, // ← ADICIONAR SENHA
        ...dadosCard,
        id: novoId,
    };

    div.cards.push(novoCard);
    return novoCard;
}
// ===== AÇÕES ATUALIZADAS COM BACKEND SYNC =====
async function acaoAdicionarJogo() {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar jogos!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar jogo");
        return;
    }
    
    try {
        const novoJogo = adicionarJogo(dados);
        salvarDados(); // Save local
        await criarJogoBackend(novoJogo); // Sync to backend
        await carregarJogos();
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Novo jogo adicionado!', 'sucesso');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar jogo:', error);
    }
}
async function acaoAdicionarEstadio(jogoId) {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar estádios!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar estádio");
        return;
    }
    
    try {
        const novoEstadio = adicionarEstadio(dados, jogoId);
        salvarDados();
        await criarEstadioBackend(novoEstadio); // ← NOVO BACKEND CALL
        carregarEstadiosDoJogo(jogoId);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Novo estádio adicionado!', 'sucesso');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar estádio:', error);
    }
}
async function acaoAdicionarTime(jogoId, estadioId) {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar times!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar time");
        return;
    }
    
    try {
        const novoTime = adicionarTime(dados, jogoId, estadioId);
        salvarDados();
        await criarTimeBackend(novoTime); // ← NOVO BACKEND CALL
        carregarTimesDoEstadio(jogoId, estadioId);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Novo time adicionado!', 'sucesso');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar time:', error);
    }
}
async function acaoAdicionarLive(jogoId, estadioId, timeId) {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar lives!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar live");
        return;
    }
    
    try {
        const novaLive = adicionarLive(dados, jogoId, estadioId, timeId);
        salvarDados();
        await criarLiveBackend(novaLive); // ← NOVO BACKEND CALL
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Nova live adicionada!', 'sucesso');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar live:', error);
    }
}
async function acaoAdicionarDiv(jogoId, estadioId, timeId, liveId) {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar divs!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar div");
        return;
    }
    
    try {
        const novaDiv = adicionarDiv(dados, jogoId, estadioId, timeId, liveId);
        salvarDados();
        await criarDivBackend(novaDiv); // ← NOVO BACKEND CALL
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Nova Div adicionada!', 'sucesso');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar div:', error);
    }
}
async function acaoAdicionarCard(jogoId, estadioId, timeId, liveId, divId) {
    // Verifica se o usuário está logado
    if (!window.usuarioLogado) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você precisa estar logado para adicionar cards!', 'erro');
        }
        console.warn("❌ Usuário não logado - não pode adicionar card");
        return;
    }
    
    try {
        const novoCard = adicionarCard(dados, jogoId, estadioId, timeId, liveId, divId);
        if (novoCard) {
            salvarDados();
            await criarCardBackend(novoCard); // ← NOVO BACKEND CALL
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Novo Card adicionado!', 'sucesso');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar card:', error);
    }
}







