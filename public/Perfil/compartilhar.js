console.log("______compartilhar.js carregado");

// ==========================================================
// FUNÇÕES DE BUSCA E CONTEXTO HIERÁRQUICO (Pedidas pelo usuário)
// ==========================================================

/**
 * Busca o objeto mais específico (Card, Div, Live, Time, Estádio ou Jogo)
 * dentro da estrutura window.dados, usando os IDs fornecidos.
 * @param {object} dados - O objeto global window.dados
 * @param {object} ids - Objeto com os IDs: {jogoId, estadioId, timeId, liveId, divId, cardId}
 * @returns {{type: string, data: object, context: object}} - Retorna o tipo, o objeto e todo o seu caminho hierárquico.
 */
function encontrarEntidadePorIds(dados, ids) {
    if (!dados || !dados.jogos || !ids.jogoId) {
        return { type: 'desconhecido', data: null, context: {} };
    }
    
    // Converte IDs para string para garantir comparação (assumindo que IDs no dados são strings)
    const normalizedIds = {
        jogoId: String(ids.jogoId),
        estadioId: ids.estadioId ? String(ids.estadioId) : null,
        timeId: ids.timeId ? String(ids.timeId) : null,
        liveId: ids.liveId ? String(ids.liveId) : null,
        divId: ids.divId ? String(ids.divId) : null,
        cardId: ids.cardId ? String(ids.cardId) : null,
    };

    let currentContext = {};
    
    // 1. Encontra Jogo
    const jogo = dados.jogos.find(j => String(j.id) === normalizedIds.jogoId);
    if (!jogo) return { type: 'desconhecido', data: null, context: {} };
    currentContext.jogo = jogo;
    
    // 2. Encontra Estádio
    if (normalizedIds.estadioId && jogo.estadios) {
        const estadio = jogo.estadios.find(e => String(e.id) === normalizedIds.estadioId);
        if (!estadio) return { type: 'jogo', data: jogo, context: currentContext };
        currentContext.estadio = estadio;

        // 3. Encontra Time
        if (normalizedIds.timeId && estadio.times) {
            const time = estadio.times.find(t => String(t.id) === normalizedIds.timeId);
            if (!time) return { type: 'estadio', data: estadio, context: currentContext };
            currentContext.time = time;

            // 4. Encontra Live
            if (normalizedIds.liveId && time.lives) {
                const live = time.lives.find(l => String(l.id) === normalizedIds.liveId);
                if (!live) return { type: 'time', data: time, context: currentContext };
                currentContext.live = live;

                // 5. Encontra Div Horizontal
                // Estrutura de dados: live.divsHorizontais.find(d => ...)
                if (normalizedIds.divId && live.divsHorizontais) {
                    const div = live.divsHorizontais.find(d => String(d.id) === normalizedIds.divId);
                    if (!div) return { type: 'live', data: live, context: currentContext };
                    currentContext.div = div;

                    // 6. Encontra Card
                    // Estrutura de dados: div.cards.find(c => ...)
                    if (normalizedIds.cardId && div.cards) {
                        const card = div.cards.find(c => String(c.id) === normalizedIds.cardId);
                        if (!card) return { type: 'div', data: div, context: currentContext };
                        currentContext.card = card;

                        return { type: 'card', data: card, context: currentContext };
                    }
                    return { type: 'div', data: div, context: currentContext };
                }
                return { type: 'live', data: live, context: currentContext };
            }
            return { type: 'time', data: time, context: currentContext };
        }
        return { type: 'estadio', data: estadio, context: currentContext };
    }
    return { type: 'jogo', data: jogo, context: currentContext };
}

/**
 * [FUNÇÃO PRINCIPAL SOLICITADA] Monta o objeto completo e o seu contexto hierárquico
 * para o local mais específico identificado pelos IDs.
 * @param {object} ids - Objeto com os IDs: {jogoId, estadioId, timeId, liveId, divId, cardId}
 * @returns {{tipo: string, entidade: object | null, contexto: object}}
 */
function montarObjetoCompletoDoLocal(ids) {
    // Certifica-se de que os dados foram carregados (aguardarDadosGlobais só resolve)
    if (!window.dados || !window.dados.jogos || window.dados.jogos.length === 0) {
        console.warn('Dados globais (window.dados) não disponíveis ao tentar montar objeto completo.');
        return { tipo: 'desconhecido', entidade: null, contexto: {} };
    }
    
    const { type, data, context } = encontrarEntidadePorIds(window.dados, ids);
    
    return {
        tipo: type,        // Ex: 'card', 'live', 'jogo'
        entidade: data,    // O objeto encontrado em si (ex: {id: 1, titulo: "Card X"})
        contexto: context  // O caminho completo (ex: {jogo: {}, estadio: {}, live: {}})
    };
}


/**
 * Cria o texto customizado para o compartilhamento usando o objeto completo.
 * @param {{tipo: string, entidade: object | null, contexto: object}} objCompleto - O objeto retornado por montarObjetoCompletoDoLocal.
 * @param {boolean} sync - Se é um link sincronizado.
 * @returns {string} O texto da mensagem de compartilhamento.
 */
function criarTextoCustomizado(objCompleto, sync) {
    let customText = sync ? 'Estamos assistindo juntos em tempo real! ' : 'Confira este conteúdo! ';

    const { contexto, tipo, entidade } = objCompleto;

    // Adiciona o caminho completo
    if (contexto.jogo) {
        customText += `Jogo: ${contexto.jogo.nome || 'desconhecido'}. `;
    }
    if (contexto.estadio) {
        customText += `Estádio: ${contexto.estadio.nome || 'desconhecido'}. `;
    }
    if (contexto.time) {
        customText += `Time: ${contexto.time.nome || 'desconhecido'}. `;
    }
    
    // Adiciona o elemento mais específico
    if (tipo !== 'desconhecido' && entidade) {
        switch (tipo) {
            case 'live':
                customText += `Live: ${entidade.titulo || 'desconhecida'}!`;
                break;
            case 'div':
                customText += `Div Horizontal: ${entidade.titulo || 'desconhecida'}!`;
                break;
            case 'card':
                customText += `Card: ${entidade.titulo || 'desconhecido'}!`;
                break;
        }
    } else {
         customText += 'Vem ver o que está rolando!';
    }
    
    return customText.trim();
}
// Fim das novas funções de contexto hierárquico
// ==========================================================


/**
 * Gera um link de convite para um local específico no app
 * Suporta: Jogo, Estádio, Time, Live, Div e Card
 */
function compartilharLocal(ids = {}, sync = false) {
    if (!window.usuarioLogado || !window.usuarioLogado.token) {
        alert('Você precisa estar logado para gerar um link de compartilhamento.');
        return;
    }

    // Garante que enviamos divId e cardId se existirem
    const body = { ...ids, sync };

    fetch(`${API_BASE}/generate-invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.usuarioLogado.token}`
        },
        body: JSON.stringify(body)
    })
    .then(async response => {
        const text = await response.text();
        if (!response.ok) throw new Error(`Erro ${response.status}: ${text}`);
        return JSON.parse(text);
    })
    .then(data => {
        const shareUrl = data.inviteLink || `https://youtube-lives.onrender.com/invite/${data.inviteCode}`;
        
        // NOVO: Usa a função centralizada para gerar o texto
        const objCompleto = montarObjetoCompletoDoLocal(ids);
        const customText = criarTextoCustomizado(objCompleto, sync);
        // FIM NOVO BLOCO
        
        // Tenta usar Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
            navigator.share({
                title: 'Multi Stream App',
                text: customText, // Usando o texto dinâmico e contextualizado
                url: shareUrl
            }).catch(console.warn);
        } else {
            // Fallback para área de transferência
            navigator.clipboard.writeText(shareUrl).then(() => {
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao('Link copiado para a área de transferência! 📋', 'sucesso');
                } else {
                    alert('Link copiado!');
                }
            });
        }
    })
    .catch(err => {
        console.error('Erro ao compartilhar:', err);
        alert('Erro ao gerar convite.');
    });
}

// ============================================================
// SISTEMA DE NAVEGAÇÃO AUTOMÁTICA (DEEP LINKING) - Mantido
// ============================================================

// Função principal chamada ao carregar a página
async function inicializarSistemaConvites() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');

    // Se tiver invite na URL, processa
    if (inviteCode) {
        console.log('🔄 Processando convite da URL:', inviteCode);
        await processarConvite(inviteCode);
        
        // Limpa a URL para ficar bonita
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function processarConvite(inviteCode) {
    try {
        mostrarLoadingConvite();
        
        // Busca os dados detalhados do convite (IDs específicos)
        const response = await fetch(`${API_BASE}/invite-details/${inviteCode}`);
        if (!response.ok) throw new Error('Convite inválido ou expirado');
        
        const inviteData = await response.json();
        console.log("📄 Dados do convite recebidos:", inviteData);

        await navegarParaDestinoConvite(inviteData);
        
    } catch (error) {
        console.error('Erro ao processar convite:', error);
        if(typeof mostrarNotificacao === 'function') mostrarNotificacao('Erro ao abrir convite.', 'erro');
    } finally {
        esconderLoadingConvite();
    }
}

async function navegarParaDestinoConvite(data) {
    // Agora o data.divId e data.cardId estão garantidos pelo backend atualizado
    const { jogoId, estadioId, timeId, liveId, divId, cardId, sync } = data;
    
    // 1. Aguarda os dados globais (jogos, usuários) estarem prontos
    await aguardarDadosGlobais();

    // 2. Navegação em Cascata
    // Verifica do mais específico para o mais genérico
    
    if (jogoId && estadioId && timeId) {
        // Se temos Jogo, Estádio e Time, carregamos a estrutura completa
        await navegarParaTimeCompleto(jogoId, estadioId, timeId);

        // Se temos Live, rolamos até ela
        if (liveId) {
            await focarNaLive(liveId);
            
            // Se temos Card específico dentro da Live
            if (divId && cardId) {
                await focarNoCard(liveId, divId, cardId);
            } else if (divId) {
                // Apenas Div
                // Implementar focarNaDiv se necessário
            }
        }
        
        if (sync) ativarModoSincronizado(data);
        
    } else if (jogoId && estadioId) {
        await navegarParaEstadio(jogoId, estadioId);
    } else if (jogoId) {
        await navegarParaJogo(jogoId);
    }
}

// --- Funções de Navegação Específicas ---

async function navegarParaJogo(jogoId) {
    mostrarSecao('estadios');
    // carregarEstadiosDoJogo precisa ser garantidamente disponível (assumindo que sim)
    if (typeof carregarEstadiosDoJogo === 'function') {
        await carregarEstadiosDoJogo(jogoId);
    } else {
         console.error('Função carregarEstadiosDoJogo não disponível.');
    }
    window.jogoSelecionadoId = jogoId;
}

async function navegarParaEstadio(jogoId, estadioId) {
    await navegarParaJogo(jogoId); // Garante que estamos no jogo certo
    window.estadioSelecionadoId = estadioId;
    mostrarSecao('times');
    // carregarTimesDoEstadio precisa ser garantidamente disponível (assumindo que sim)
    if (typeof carregarTimesDoEstadio === 'function') {
        carregarTimesDoEstadio(jogoId, estadioId);
    } else {
        console.error('Função carregarTimesDoEstadio não disponível.');
    }
}

async function navegarParaTimeCompleto(jogoId, estadioId, timeId) {
    // Configura os IDs globais para que o botão "Voltar" funcione
    window.jogoSelecionadoId = jogoId;
    window.estadioSelecionadoId = estadioId;
    window.timeSelecionadoId = timeId;

    // Mostra a seção de lives
    mostrarSecao('lives');
    
    // Carrega a estrutura do time (Isso cria o DOM das lives e cards)
    // carregarEstruturaTimeComDados precisa ser garantidamente disponível (assumindo que sim)
    if (typeof carregarEstruturaTimeComDados === 'function') {
        await carregarEstruturaTimeComDados(jogoId, estadioId, timeId); 
    } else {
        console.error('Função carregarEstruturaTimeComDados não disponível.');
    }
    
    // Pequeno delay para garantir renderização do DOM
    return new Promise(resolve => setTimeout(resolve, 500));
}

async function focarNaLive(liveId) {
    
    // Tentativa de encontrar pelo botão de toggle que contém o ID
    const btnToggle = document.getElementById(`toggle-live-${liveId}`);
    
    if (btnToggle) {
        const liveSection = btnToggle.closest('.live-section');
        if (liveSection) {
            liveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            liveSection.style.border = "2px solid #007bff"; // Realce visual
            liveSection.style.transition = "border 0.5s";
            setTimeout(() => liveSection.style.border = "none", 3000);
        }
    }
}

async function focarNoCard(liveId, divId, cardId) {
    // Reconstrução do ID único do Card: id="card-${uniqueCardId}"
    const uniqueId = `${liveId}-${divId}-${cardId}`; // Ajuste conforme sua lógica de ID
    const cardElement = document.getElementById(`card-${uniqueId}`);
    
    if (cardElement) {
        // Expande os botões se necessário
        const toggleBtn = document.getElementById(`toggle-${uniqueId}`);
        if(toggleBtn) toggleBtn.click(); // Simula clique para abrir controles

        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Efeito de destaque (Piscar)
        cardElement.animate([
            { boxShadow: '0 0 0 0 rgba(40, 167, 69, 0.7)' },
            { boxShadow: '0 0 0 20px rgba(40, 167, 69, 0)' }
        ], {
            duration: 1500,
            iterations: 2
        });
    } else {
        console.warn("Elemento do Card não encontrado no DOM:", uniqueId);
    }
}

// --- Utilitários ---

function aguardarDadosGlobais() {
    return new Promise(resolve => {
        if (window.dados && window.dados.jogos && window.dados.jogos.length > 0) {
            resolve();
        } else {
            // Tenta a cada 200ms
            const check = setInterval(() => {
                if (window.dados && window.dados.jogos && window.dados.jogos.length > 0) {
                    clearInterval(check);
                    resolve();
                }
            }, 200);
            
            // Timeout de segurança de 10s
            setTimeout(() => { clearInterval(check); resolve(); }, 10000);
        }
    });
}

function mostrarLoadingConvite() {
    if(document.getElementById('loading-convite')) return;
    const div = document.createElement('div');
    div.id = 'loading-convite';
    div.innerHTML = '<div style="background:rgba(0,0,0,0.9); color:white; padding:20px; border-radius:10px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:9999;">🚀 Viajando para o destino...</div>';
    document.body.appendChild(div);
}

function esconderLoadingConvite() {
    const div = document.getElementById('loading-convite');
    if(div) div.remove();
}

function ativarModoSincronizado(data) {
    console.log('Ativando modo sincronizado para:', data);
    if(typeof mostrarNotificacao === 'function') {
        mostrarNotificacao('Modo Sincronizado Ativo 🔴', 'info');
    }
}

// Inicialização
// Se carregado via script tag, chama automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaConvites);
} else {
    inicializarSistemaConvites();
}