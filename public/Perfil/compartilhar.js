/*
console.log("______compartilhar.js")


// Funções de compatibilidade - mantenha por enquanto
function compartilharJogo(jogoId) {
    compartilharLocal({ jogoId }, false);
}
function compartilharAppSintonizadaJogo(jogoId) {
    compartilharLocal({ jogoId }, true);
}
function compartilharEstadio(jogoId, estadioId) {
    compartilharLocal({ jogoId, estadioId }, false);
}
function compartilharTime(jogoId, estadioId, timeId) {
    compartilharLocal({ jogoId, estadioId, timeId }, false);
}
function compartilharLive(jogoId, estadioId, timeId, liveId) {
    compartilharLocal({ jogoId, estadioId, timeId, liveId }, false);
}
function compartilharAppSintonizadaJogo(jogoId) {
    if (!window.usuarioLogado || !window.usuarioLogado.token) {
        alert('Você precisa estar logado para gerar um link sincronizado.');
        return;
    }

    fetch(`${API_BASE}/generate-invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.usuarioLogado.token}`
        },
        body: JSON.stringify({ jogoId, sync: true })  // Adiciona flag para sync, se o backend suportar
    })
    .then(response => response.json())
    .then(data => {
        if (data.inviteCode) {
            const shareUrl = `${window.location.origin}/accept-invite/${data.inviteCode}?sync=true`;  // Adiciona query param para sync
            if (navigator.share) {
                navigator.share({
                    title: 'Compartilhar App Sincronizada',
                    text: 'Junte-se ao jogo sincronizado!',
                    url: shareUrl
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    if (typeof mostrarNotificacao === 'function') {
                        mostrarNotificacao('Link sincronizado copiado para a área de transferência!', 'sucesso');
                    }
                });
            }
        } else {
            alert('Erro ao gerar convite sincronizado.');
        }
    })
    .catch(err => {
        console.error('Erro ao compartilhar app sincronizada:', err);
        alert('Falha na conexão com o servidor.');
    });
}


function compartilharLocal(ids = {}, sync = false) {
    if (!window.usuarioLogado || !window.usuarioLogado.token) {
        alert('Você precisa estar logado para gerar um link de compartilhamento.');
        return;
    }

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
        const text = await response.text();               // ← lê como texto primeiro
        console.log("Resposta bruta do /generate-invite:", text);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${text || 'Sem corpo'}`);
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Resposta não é JSON válido:", text);
            throw new Error("Resposta inválida do servidor (não JSON)");
        }

        return data;
    })
    .then(data => {
        if (!data.inviteCode && !data.inviteLink) {
            throw new Error('Servidor não retornou inviteCode nem inviteLink');
        }

const shareUrl = data.inviteLink || `https://youtube-lives.onrender.com/invite/${data.inviteCode}`;
// Dentro de .then(data => { ... }) após const shareUrl = ...

// Construir texto dinâmico baseado nos ids
let customText = sync ? 'Estamos assistindo juntos em tempo real!' : 'Olha que legal!';
if (ids.jogoId) {
    const jogo = window.dados?.jogos?.find(j => j.id === ids.jogoId);
    customText += ` Esse jogo: ${jogo?.nome || 'desconhecido'}!`;
}
if (ids.estadioId) {
    const estadio = encontrarEstadio(window.dados, ids.jogoId, ids.estadioId);
    customText += ` No estádio: ${estadio?.nome || 'desconhecido'}!`;
}
if (ids.timeId) {
    const time = encontrarTime(window.dados, ids.jogoId, ids.estadioId, ids.timeId);
    customText += ` Do time: ${time?.nome || 'desconhecido'}!`;
}
if (ids.liveId) {
    const live = encontrarLive(window.dados, ids.jogoId, ids.estadioId, ids.timeId, ids.liveId);
    customText += ` Na live: ${live?.titulo || 'desconhecida'}!`;
}
if (ids.divId) {
    const div = encontrarDiv(window.dados, ids.jogoId, ids.estadioId, ids.timeId, ids.liveId, ids.divId);
    customText += ` Na div horizontal: ${div?.titulo || 'desconhecida'}!`;
}
if (ids.cardId) {
    const card = encontrarCard(window.dados, ids.jogoId, ids.estadioId, ids.timeId, ids.liveId, ids.divId, ids.cardId);
    customText += ` No card: ${card?.titulo || 'desconhecido'}!`;
}

// Agora use customText no navigator.share
if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
    navigator.share({
        title: sync ? 'App Sincronizada – Junte-se a mim!' : 'Vem ver esse jogo ao vivo!',
        text: customText,  // Usando o texto dinâmico aqui
        url: shareUrl
    })
    .then(() => console.log('Compartilhado com sucesso'))
    .catch(err => {
        console.warn('Web Share cancelado ou falhou, copiando para área de transferência...', err);
        fallbackCopy();
    });
} else {
    fallbackCopy();
}
// Tenta usar a Web Share API nativa
if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
    navigator.share({
        title: sync ? 'App Sincronizada – Junte-se a mim!' : 'Vem ver esse jogo ao vivo!',
        text: sync ? 'Estamos assistindo juntos em tempo real!' : 'Olha que legal esse jogo/estádio/time!',
        url: shareUrl
    })
    .then(() => console.log('Compartilhado com sucesso'))
    .catch(err => {
        console.warn('Web Share cancelado ou falhou, copiando para área de transferência...', err);
        fallbackCopy();
    });
} else {
    // Fallback imediato: copia o link
    fallbackCopy();
}

function fallbackCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Link copiado para a área de transferência ✅', 'sucesso');
        } else {
            alert('Link copiado!\n' + shareUrl);
        }
    }).catch(() => {
        // Último recurso caso até clipboard falhe (raro)
        prompt('Não foi possível copiar automaticamente. Copie manualmente:', shareUrl);
    });
}
    })
    .catch(err => {
        console.error('Erro ao compartilhar:', err);
        alert('Erro ao gerar link: ' + err.message);
    });
}

function handleInvite(code) {
    fetch(`${API_BASE}/accept-invite/${code}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const { jogoId, estadioId, timeId, liveId, divId, cardId } = data;  // IDs do invite
                if (jogoId) {
                    if (estadioId) {
                        if (timeId) {
                            if (liveId) {
                                if (divId) {
                                    if (cardId) {
                                        // Navega para card específico
                                        verCardEspecifico(jogoId, estadioId, timeId, liveId, divId, cardId);
                                    } else {
                                        // Para div
                                        verDivEspecifica(jogoId, estadioId, timeId, liveId, divId);
                                    }
                                } else {
                                    // Para live
                                    verLivesDoTime(jogoId, estadioId, timeId);  // Ajuste para live específica
                                }
                            } else {
                                // Para time
                                verTimesDoEstadio(jogoId, estadioId);
                            }
                        } else {
                            // Para estadio
                            verEstadiosDoJogo(jogoId);
                        }
                    } else {
                        // Para jogo
                        verJogoEspecifico(jogoId);
                    }
                }
            } else {
                alert('Invite inválido.');
            }
        })
        .catch(err => console.error('Erro ao aceitar invite:', err));
}
// Chame handleInvite ao carregar a página se URL tiver /invite/{code}
if (window.location.pathname.startsWith('/invite/')) {
    const code = window.location.pathname.split('/invite/')[1];
    handleInvite(code);
}

////////////
////////////
////////////
////////////
// ===== SISTEMA DE CONVITES INTELIGENTES =====


// Função para obter parâmetros da URL
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Processar convite quando a aplicação carregar
async function inicializarSistemaConvites() {
    const inviteCode = getURLParameter('invite');
    
    if (inviteCode) {
        console.log('Processando convite:', inviteCode);
        await processarConvite(inviteCode);
        
        // Limpar o parâmetro da URL sem recarregar a página
        const novaURL = window.location.pathname;
        window.history.replaceState({}, document.title, novaURL);
    }
}

async function processarConvite(inviteCode) {
    try {
        mostrarLoadingConvite();
        
        const response = await fetch(`${API_BASE}/invite-details/${inviteCode}`);
        if (!response.ok) {
            throw new Error('Convite inválido ou expirado');
        }
        
        const inviteData = await response.json();
        await navegarParaDestinoConvite(inviteData);
        
    } catch (error) {
        console.error('Erro ao processar convite:', error);
        mostrarNotificacao('Erro ao processar convite: ' + error.message, 'erro');
    } finally {
        esconderLoadingConvite();
    }
}

async function navegarParaDestinoConvite(inviteData) {
    const { jogoId, estadioId, timeId, liveId, sync } = inviteData;
    
    // Aguardar a aplicação carregar completamente
    await aguardarAplicacaoPronta();
    
    // Hierarquia de navegação com await em todas as chamadas
    if (liveId && timeId && estadioId && jogoId) {
        await navegarParaLive(jogoId, estadioId, timeId, liveId, sync);
    } else if (timeId && estadioId && jogoId) {
        await navegarParaTime(jogoId, estadioId, timeId, sync);
    } else if (estadioId && jogoId) {
        await navegarParaEstadio(jogoId, estadioId, sync);
    } else if (jogoId) {
        await navegarParaJogo(jogoId, sync);
    } else {
        // Convite genérico - já estamos na home
        console.log('Convite genérico processado');
    }
    
    // Mostrar info do compartilhador se disponível
    if (inviteData.creatorId) {
        setTimeout(() => {
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Convite recebido!', 'sucesso');
            } else {
                console.log('Convite recebido! (Notificação não disponível)');
            }
        }, 1000);
    }
}
// Fix navegarParaJogo: Handle notification safely, remove duplicate hide
async function navegarParaJogo(jogoId) {
    mostrarLoadingConvite();

    await carregarDadosAplicacao(); 

    const jogo = window.dados.jogos.find(j => j.id === jogoId);
    
    if (!jogo) {
        console.error(`[CONVITE] Jogo com ID ${jogoId} não encontrado. Voltando para Jogos.`);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('O destino do convite (Jogo) não foi encontrado.', 'erro');
        } else {
            console.error('O destino do convite (Jogo) não foi encontrado.');
        }
        esconderLoadingConvite();
        mostrarSecao('jogos');
        return;
    }

    window.jogoSelecionadoId = jogoId;
    mostrarSecao('estadios');
    carregarEstadiosDoJogo(jogoId);
    console.log('Convite processado com sucesso! Jogo:', jogoId);
    esconderLoadingConvite();  // Only once
}

async function navegarParaEstadio(jogoId, estadioId, sync) {
    try {
        console.log('Navegando para estádio:', jogoId, estadioId);
        
        if (!window.dados) {
            await carregarDadosAplicacao();
        }
        
        const jogo = window.dados.jogos.find(j => j.id === jogoId);
        if (!jogo) throw new Error('Jogo não encontrado');
        
        const estadio = jogo.estadios.find(e => e.id === estadioId);
        if (!estadio) throw new Error('Estádio não encontrado');
        
        window.jogoSelecionadoId = jogoId;
        window.estadioSelecionadoId = estadioId;
        mostrarSecao('times');
        carregarTimesDoEstadio(jogoId, estadioId);  // Removi await desnecessário se não for async
        
        if (sync) {
            ativarModoSincronizado('estadio', jogoId, estadioId);
        }
    } catch (error) {
        console.error('Erro ao navegar para estádio:', error);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Erro ao carregar estádio do convite.', 'erro');
        }
        mostrarSecao('jogos');  // Volta para home em erro
    }
}
async function navegarParaTime(jogoId, estadioId, timeId, sync) {
    console.log('Navegando para time:', jogoId, estadioId, timeId);
    
    if (!window.dados) {
        await carregarDadosAplicacao();
    }
    
    const jogo = window.dados.jogos.find(j => j.id === jogoId);
    if (!jogo) throw new Error('Jogo não encontrado');
    
    const estadio = jogo.estadios.find(e => e.id === estadioId);
    if (!estadio) throw new Error('Estádio não encontrado');
    
    const time = estadio.times.find(t => t.id === timeId);
    if (!time) throw new Error('Time não encontrado');
    
    window.jogoSelecionadoId = jogoId;
    window.estadioSelecionadoId = estadioId;
    window.timeSelecionadoId = timeId;
    
    // Navegar para a estrutura do time
    await carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    
    if (sync) {
        ativarModoSincronizado('time', jogoId, estadioId, timeId);
    }
}
async function navegarParaLive(jogoId, estadioId, timeId, liveId, sync) {
    console.log('Navegando para live:', jogoId, estadioId, timeId, liveId);
    
    await navegarParaTime(jogoId, estadioId, timeId, sync);
    
    // Aguardar um pouco para a estrutura carregar e então destacar a live
    setTimeout(() => {
        const liveElement = document.querySelector(`[data-live-id="${liveId}"]`);
        if (liveElement) {
            liveElement.scrollIntoView({ behavior: 'smooth' });
            liveElement.style.border = '3px solid #28a745';
            liveElement.style.transition = 'border 0.5s ease';
        }
    }, 1500);
}
// Funções auxiliares
function aguardarAplicacaoPronta() {
    return new Promise((resolve) => {
        const checkReady = () => {
            if (window.dados && typeof mostrarSecao === 'function' && typeof carregarEstadiosDoJogo === 'function') {
                resolve();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    });
}
// Update carregarDadosAplicacao to use window.dados consistently


async function carregarDadosAplicacao() {
    if (!window.dados || !window.dados.jogos || window.dados.jogos.length === 0) { 
        console.log('Dados da aplicação ainda não carregados. Forçando carregamento...');
        await carregarDadosBackend(); 
        if (typeof carregarJogos === 'function') {
            await carregarJogos();
        }
    }
}
function mostrarLoadingConvite() {
    // Use seu sistema de loading existente ou crie um simples
    const existingLoading = document.getElementById('loading-convite');
    if (existingLoading) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-convite';
    loadingDiv.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 1.2em;
        z-index: 10000;
    `;
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 10px;">Carregando convite...</div>
            <div style="border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
    `;
    
    // Adicionar animação CSS se não existir
    if (!document.querySelector('#convite-loading-style')) {
        const style = document.createElement('style');
        style.id = 'convite-loading-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingDiv);
}
function esconderLoadingConvite() {
    const loadingDiv = document.getElementById('loading-convite');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}
function ativarModoSincronizado(tipo, ...ids) {
    console.log(`Modo sincronizado ativado para ${tipo}:`, ids);
    // Implemente sua lógica de sincronização aqui
}


// ====== SISTEMA DE NAVEGAÇÃO AUTOMÁTICA POR INVITE ======

// Chama automaticamente quando a página carrega
window.addEventListener('DOMContentLoaded', processarInviteDaURL);
// Ou se já estiver carregado:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processarInviteDaURL);
} else {
    processarInviteDaURL();
}
*/
console.log("______compartilhar.js carregado");

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
        
        // Texto dinâmico para o compartilhamento
        let customText = sync ? 'Estamos assistindo juntos em tempo real!' : 'Confira este conteúdo!';
        
        // Tenta usar Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
            navigator.share({
                title: 'Multi Stream App',
                text: customText,
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
// SISTEMA DE NAVEGAÇÃO AUTOMÁTICA (DEEP LINKING)
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
    await carregarEstadiosDoJogo(jogoId);
    window.jogoSelecionadoId = jogoId;
}

async function navegarParaEstadio(jogoId, estadioId) {
    await navegarParaJogo(jogoId); // Garante que estamos no jogo certo
    window.estadioSelecionadoId = estadioId;
    mostrarSecao('times');
    carregarTimesDoEstadio(jogoId, estadioId);
}

async function navegarParaTimeCompleto(jogoId, estadioId, timeId) {
    // Configura os IDs globais para que o botão "Voltar" funcione
    window.jogoSelecionadoId = jogoId;
    window.estadioSelecionadoId = estadioId;
    window.timeSelecionadoId = timeId;

    // Mostra a seção de lives
    mostrarSecao('lives');
    
    // Carrega a estrutura do time (Isso cria o DOM das lives e cards)
    // Importante: carregarEstruturaTimeComDados deve ser síncrono ou retornar Promise
    await carregarEstruturaTimeComDados(jogoId, estadioId, timeId); 
    
    // Pequeno delay para garantir renderização do DOM
    return new Promise(resolve => setTimeout(resolve, 500));
}

async function focarNaLive(liveId) {
    // Procura pelo elemento da live. 
    // Nota: No seu HTML generator, certifique-se de que a div da live tenha algum ID ou atributo identificável.
    // Sugestão: Adicione id="live-CONTAINER_ID" ou data-live-id na criação
    
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
    // A função gerarUniqueCardId no seu index.html cria IDs únicos
    // Vamos recriar a lógica aqui ou assumir o formato
    // Assumindo formato: iframe-liveId-divId-cardId ou similar
    
    // O seu gerador cria: id="card-${uniqueCardId}"
    // Precisamos da função gerarUniqueCardId disponível globalmente ou recriá-la
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