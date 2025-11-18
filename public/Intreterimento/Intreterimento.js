console.log("_____intreterento")
// Adicione em auth.js
function getGuestUser() {
    let guest = JSON.parse(localStorage.getItem('guestUser'));
    if (!guest) {
        guest = {
            id: Date.now(),
            nome: "Convidado_" + Date.now().toString().slice(-5),
            email: "guest@" + Date.now() + ".temp",
            merito: 100, // Pontos iniciais para convidados
            isGuest: true // Importante para diferenciar
        };
        localStorage.setItem('guestUser', JSON.stringify(guest));
    }
    return guest;
}

// Use esta função para pegar o usuário logado OU um convidado
function getActiveUser() {
    if (window.usuarioLogado) {
        return window.usuarioLogado;
    }
    return getGuestUser();
}




function calcularMeritoMaximoAposta(usuario) {
    if (!usuario) return 0;
    
    // Regras mais realistas:
    // - Máximo de 50% do mérito atual
    // - Mínimo de 10 méritos para poder apostar
    // - Máximo absoluto de 1000 méritos por aposta
    
    const maximoPercentual = Math.floor(usuario.merito * 0.5);
    const maximo = Math.min(maximoPercentual, 1000);
    
    return Math.max(maximo, 10); // Mínimo de 10 méritos
}
async function adicionarNotificacaoAposta(titulo, mensagem, tipo = 'info') {
    const notificacao = {
        id: Date.now(),
        titulo: `💰 ${titulo}`,
        mensagem: mensagem,
        tipo: tipo,
        lida: false,
        data: new Date().toLocaleString(),
        categoria: 'apostas'
    };
    
    // Sua lógica existente de notificações
    if (!notificacoes) notificacoes = [];
    notificacoes.unshift(notificacao);
    
    // Limitar a 50 notificações
    if (notificacoes.length > 50) {
        notificacoes = notificacoes.slice(0, 50);
    }
    
    // Atualizar badge
    atualizarBadgeNotificacoes();
    
    // Mostrar toast
    mostrarToastNotificacao(notificacao);
}
/*
async function confirmarCriacaoAposta(cardId) {
    const titulo = document.getElementById('tituloAposta').value.trim();
    const valor = parseInt(document.getElementById('valorAposta').value);
    const dataEncerramento = document.getElementById('dataEncerramentoAposta').value;
    const opcoesText = document.getElementById('opcoesAposta').value.trim();

    // Validações
    if (!titulo) {
        alert('Digite um título para a aposta!');
        return;
    }

    if (!valor || valor < 1) {
        alert('Digite um valor válido para a aposta!');
        return;
    }

    if (!dataEncerramento) {
        alert('Selecione uma data de encerramento!');
        return;
    }

    const opcoes = opcoesText.split('\n').filter(opcao => opcao.trim()).map(opcao => opcao.trim());
    if (opcoes.length < 2) {
        alert('Digite pelo menos 2 opções para a aposta!');
        return;
    }

    const usuario = usuarioLogado;
    if (!usuario) {
        alert('Você precisa estar logado!');
        return;
    }

    // Verifica mérito suficiente
    if (valor > calcularMeritoMaximoAposta(usuario)) {
        alert(`Mérito insuficiente! Você pode apostar no máximo ${calcularMeritoMaximoAposta(usuario)} méritos`);
        return;
    }

    // Encontra ou cria sala de apostas para este card
    let apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
    if (!apostaSala) {
        apostaSala = {
            cardId: cardId,
            criador: usuario.usuario,
            dataCriacao: new Date().toISOString(),
            apostas: []
        };
        dados.apostasUsuarios.push(apostaSala);
    }

    // Cria nova aposta
    const novaAposta = {
        id: Date.now(),
        titulo: titulo,
        valor: valor,
        dataEncerramento: new Date(dataEncerramento).toISOString(),
        opcoes: opcoes,
        criador: usuario.usuario,
        status: 'aberta',
        participantes: [],
        apostas: [],
        comprovantes: []
    };

    apostaSala.apostas.push(novaAposta);

    // Sincroniza e salva
    syncDataToPeers();
    salvarDados();

    // Fecha modais
    window.fecharFormularioAposta();
    const apostasModal = document.querySelector('[style*="z-index: 12000"]');
    if (apostasModal) apostasModal.remove();

    adicionarNotificacao(
        '💰 Aposta Criada!',
        `Sua aposta "${titulo}" foi criada com sucesso!`,
        'sucesso'
    );

    // Atualiza indicadores
    atualizarIndicadoresApostas();
    
    alert('🎉 Aposta criada com sucesso!');
}
*/
async function confirmarCriacaoAposta(cardId, usuario, titulo, valor, descricao, isFreeBet) {
    // Validações
    if (!titulo) {
        alert('Digite um título para a aposta!');
        return;
    }

    if (isFreeBet) {
        if (valor !== 0) {
            alert('Para Free Bets, o valor deve ser 0!');
            return;
        }
    } else {
        if (!valor || valor < 1) {
            alert('Digite um valor válido para a aposta!');
            return;
        }
    }

    // Obtém data de encerramento do DOM (assumindo que ainda é necessário; ajuste se passar como param)
    const dataEncerramento = document.getElementById('dataEncerramentoAposta').value;
    if (!dataEncerramento) {
        alert('Selecione uma data de encerramento!');
        return;
    }

    // Obtém opções do DOM (assumindo que ainda é necessário; ajuste se passar como param)
    const opcoesText = document.getElementById('opcoesAposta').value.trim();
    const opcoes = opcoesText.split('\n').filter(opcao => opcao.trim()).map(opcao => opcao.trim());
    if (opcoes.length < 2) {
        alert('Digite pelo menos 2 opções para a aposta!');
        return;
    }

    if (!usuario) {
        alert('Erro ao obter usuário ativo!');
        return;
    }

    // Para Free Bets ou convidados, ignora verificação de mérito
    if (!isFreeBet && !usuario.isGuest) {
        // Verifica mérito suficiente para apostas pagas
        if (valor > calcularMeritoMaximoAposta(usuario)) {
            alert(`Mérito insuficiente! Você pode apostar no máximo ${calcularMeritoMaximoAposta(usuario)} méritos`);
            return;
        }
    }

    // Encontra ou cria sala de apostas para este card
    let apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
    if (!apostaSala) {
        apostaSala = {
            cardId: cardId,
            criador: usuario.usuario || 'Convidado', // Usa 'Convidado' se não logado
            dataCriacao: new Date().toISOString(),
            apostas: []
        };
        dados.apostasUsuarios.push(apostaSala);
    }

    // Cria nova aposta
    const novaAposta = {
        id: Date.now(),
        titulo: titulo,
        valor: isFreeBet ? 0 : valor,
        dataEncerramento: new Date(dataEncerramento).toISOString(),
        opcoes: opcoes,
        criador: usuario.usuario || 'Convidado',
        status: 'aberta',
        participantes: [],
        apostas: [],
        comprovantes: [],
        isFreeBet: isFreeBet, // Adiciona flag para identificar Free Bet
        descricao: descricao || '' // Descrição opcional
    };

    apostaSala.apostas.push(novaAposta);

    // Sincroniza e salva
    syncDataToPeers();
    salvarDados();

    // Fecha modais
    window.fecharFormularioAposta();
    const apostasModal = document.querySelector('[style*="z-index: 12000"]');
    if (apostasModal) apostasModal.remove();

    adicionarNotificacao(
        '💰 Aposta Criada!',
        `Sua aposta "${titulo}" foi criada com sucesso!`,
        'sucesso'
    );

    // Atualiza indicadores
    atualizarIndicadoresApostas();
    
    alert('🎉 Aposta criada com sucesso!');
}

/**
 * (Arquivo: Intreterimento.js)
 * Confirma a participação do usuário (logado ou convidado) em uma aposta
 * e desconta seus méritos/pontos.
 */
async function confirmarParticipacaoAposta(cardId, apostaId) {
    const apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
    if (!apostaSala) {
        alert('Sala de apostas não encontrada!');
        return;
    }

    const aposta = apostaSala.apostas.find(a => a.id == apostaId);
    if (!aposta) {
        alert('Aposta não encontrada!');
        return;
    }

    // --- CORREÇÃO: Usa getActiveUser() para aceitar convidados ---
    const usuario = getActiveUser();

    // Verifica se já participou (usando email, que é único para logados e guests)
    if (aposta.participantes?.some(p => p.email === usuario.email)) {
        alert('Você já está participando desta aposta!');
        return;
    }

    // Verifica mérito suficiente
    if (aposta.valor > usuario.merito) {
        alert(`Mérito/Pontos insuficientes! Você tem ${usuario.merito} e precisa de ${aposta.valor}`);
        return;
    }

    // --- CORREÇÃO: 'mostrarSelecaoOpcoesAposta' é async e precisa de 'await' ---
    const opcaoEscolhida = await mostrarSelecaoOpcoesAposta(aposta);
    
    if (!opcaoEscolhida) {
        // Usuário fechou o modal de seleção
        return;
    }

    // Registra participação
    const participacao = {
        usuario: usuario.nome, // Nome de exibição
        email: usuario.email,  // Identificador único (guest ou real)
        isGuest: !!usuario.isGuest, // Marca se é convidado
        opcao: opcaoEscolhida,
        data: new Date().toISOString(),
        valor: aposta.valor,
        _id: `part_${Date.now()}`
    };

    if (!aposta.participantes) aposta.participantes = [];
    aposta.participantes.push(participacao);

    // Atualiza mérito do usuário (na variável local)
    usuario.merito -= aposta.valor;

    // --- CORREÇÃO: Salva o mérito do Convidado no localStorage ---
    if (usuario.isGuest) {
        localStorage.setItem('guestUser', JSON.stringify(usuario));
    } else {
        // Se for logado, salva no banco (ou onde 'salvarDados' salva o usuário)
        salvarDados(); 
    }

    // Sincroniza a *aposta* (que foi modificada) com os peers
    syncDataToPeers();
    // salvarDados(); // Descomente se 'salvarDados' for o P2P sync

    adicionarNotificacao(
        '🎉 Aposta Realizada!',
        `Você apostou ${aposta.valor} ${usuario.isGuest ? 'pontos' : 'méritos'} em "${opcaoEscolhida}"`,
        'sucesso'
    );

    atualizarIndicadoresApostas();
    
    alert('✅ Aposta realizada com sucesso!');
}
function verTransacoes() {
    alert("Funcionalidade de transações em desenvolvimento...");
}
function enviarComprovantePix(jogoId, estadioId, timeId, liveId, streamerId, desafioId) {
    const streamer = encontrarStreamer(jogoId, estadioId, timeId, liveId, streamerId);
    if (!streamer) return;
    
    let desafio;
    if (streamer.desafiosEnviados) {
        desafio = streamer.desafiosEnviados.find(d => d.id === desafioId);
    }
    
    if (!desafio) {
        alert("Desafio não encontrado!");
        return;
    }
    
    const comprovante = prompt("URL ou descrição do comprovante PIX:");
    if (comprovante) {
        desafio.comprovantePix = comprovante;
        carregarStreamersDaLive(jogoId, estadioId, timeId, liveId);
        alert("Comprovante enviado!");
    }
}
// ===== INICIALIZAÇÃO =====

    // Função inicializadora

function verTransacoes() {
    alert("Funcionalidade de transações em desenvolvimento...");
}


 

