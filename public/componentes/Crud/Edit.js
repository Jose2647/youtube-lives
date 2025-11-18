
// utils.js ou no final de navegar.js

/**
 * Extrai o ID de um vídeo do YouTube a partir de uma URL.
 * @param {string} url - A URL do vídeo do YouTube.
 * @returns {string|null} O ID do vídeo ou null se não encontrado.
 */
function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/i,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    ];
    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}
/**
 * Processa uma URL do YouTube para retornar uma URL de embed com parâmetros.
 * Ativa a API JS com enablejsapi=1 e controla o mute (som ativado por padrão).
 * @param {string} inputUrl - A URL original do vídeo.
 * @param {boolean} [muted=false] - Se true, muta o áudio inicialmente (mute=1).
 * @returns {string} A URL de embed processada ou a original se não for YouTube.
 */
function processarUrlYouTube(inputUrl, muted = false) {
    const url = inputUrl.trim();
    const videoId = extractYouTubeId(url);
    if (videoId) {
        const muteParam = muted ? 'mute=1' : 'mute=0';
        return `https://www.youtube.com/embed/${videoId}?${muteParam}&enablejsapi=1`;
    }
    return url; // Retorna original se não for YouTube válido
}
// Função corrigida para registrar iframe
async function registrarIframe(iframeUrl, origemTipo, origemId) {
    let token = null;
    
    // Tenta obter o token do usuário logado
    if (window.usuarioLogado && window.usuarioLogado.token) {
        token = window.usuarioLogado.token;
    } 
    // Se não encontrou, tenta do localStorage
    else {
        const sessaoString = localStorage.getItem('sistemaSessao');
        if (sessaoString) {
            try {
                const sessao = JSON.parse(sessaoString);
                token = sessao.token;
            } catch (e) {
                console.error('Erro ao parsear sessão:', e);
            }
        }
    }
    
    if (!token) {
        console.error('Usuário não autenticado. Token não encontrado.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/iframe-registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                iframeUrl: iframeUrl,
                origemTipo: origemTipo,
                origemId: origemId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao registrar iframe:', errorData);
            throw new Error(errorData.msg || 'Erro ao registrar iframe');
        }

        const result = await response.json();
        console.log('Iframe registrado com sucesso:', result);
        return result;

    } catch (error) {
        console.error('Erro na requisição de registro de iframe:', error);
        throw error;
    }
}
// Função corrigida para salvar alteração de iframe
async function salvarAlteracaoIframe(item, origemTipo, origemId) {
    try {
        // 1. Salva sempre no localStorage primeiro
        salvarDados();
        
        // 2. Registra o iframe (sempre que houver URL)
        if (item.iframeUrl) {
            await registrarIframe(item.iframeUrl, origemTipo, origemId);
        }
        
        // 3. Se usuário está logado E é o criador do item, salva no backend
        if (window.usuarioLogado && item.creatorId === window.usuarioLogado.id) {
            await salvarDadosBackend();
        }
        
        console.log('Alteração de iframe salva com sucesso');
        
    } catch (error) {
        console.error('Erro ao salvar alteração de iframe:', error);
        // Não lançar o erro para não interromper o fluxo principal
        // Apenas logar o erro
    }
}
/**
 * Salva o estado completo dos 'dados.jogos' NO BACKEND.
 * ATENÇÃO: Esta é a rota POST /api/jogos que apaga e recria TUDO.
 * É uma operação "destrutiva" e lenta. Use com cuidado.
 */
// Atualize a função salvarDadosBackend se necessário
async function salvarDadosBackend() {
    try {
        let token = null;
        
        // Obtém o token da mesma forma que registrarIframe
        if (window.usuarioLogado && window.usuarioLogado.token) {
            token = window.usuarioLogado.token;
        } else {
            const sessaoString = localStorage.getItem('sistemaSessao');
            if (sessaoString) {
                try {
                    const sessao = JSON.parse(sessaoString);
                    token = sessao.token;
                } catch (e) {
                    console.error('Erro ao parsear sessão:', e);
                }
            }
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        // Adiciona o token se disponível
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Envia a estrutura completa de 'dados.jogos'
        const response = await fetch(`${API_BASE}/api/jogos`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(dados.jogos)
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        
        console.log('Dados sincronizados com o backend.');
        
    } catch (err) {
        console.error('Erro ao salvar no backend:', err);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar com servidor.', 'erro');
    }
}
function abrirModalEdicao(titulo, campos, onSalvar, itemContexto = null) {
    // Remove modal antigo
    const antigo = document.getElementById('modal-edicao-generico');
    if (antigo) antigo.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-edicao-generico';
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
        z-index: 10000; font-family: Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style = `
        background: white; padding: 20px; border-radius: 12px; width: 90%; max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    let html = `<h3 style="margin-top:0; color:#333;">${titulo}</h3>`;

    campos.forEach(campo => {
        html += `
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">
                    ${campo.label}
                </label>
                <input type="${campo.type || 'text'}" 
                       id="modal-${campo.id}" 
                       value="${campo.value || ''}" 
                       style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:1em;"
                       ${campo.placeholder ? `placeholder="${campo.placeholder}"` : ''}>
            </div>
        `;
    });

    html += `
        <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button id="btn-cancelar" style="padding:10px 16px; background:#ccc; color:#333; border:none; border-radius:6px; cursor:pointer;">
                Cancelar
            </button>
            <button id="btn-salvar" style="padding:10px 16px; background:#28a745; color:white; border:none; border-radius:6px; cursor:pointer;">
                Salvar
            </button>
        </div>
    `;

    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);

    // === EVENTOS ===
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnSalvar = document.getElementById('btn-salvar');

    btnCancelar.onclick = () => modal.remove();

// NO Edit.js - SUBSTITUA a função btnSalvar.onclick por esta versão corrigida:
btnSalvar.onclick = async () => {
    try {
        // Coleta os valores
        const valores = {};
        let valido = true;

        campos.forEach(campo => {
            const input = document.getElementById(`modal-${campo.id}`);
            const valor = campo.id === 'iframeUrl' ? processarUrlYouTube(input.value) : input.value.trim();

            if (campo.required && !valor) {
                valido = false;
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = '#ccc';
            }

            valores[campo.id] = valor;
        });

        if (!valido) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        // 1. Atualiza os dados no objeto
        onSalvar(valores);
        
        // 2. Atualiza o iframe se houver contexto
        if (valores.iframeUrl && itemContexto) {
            const { item, origemTipo, origemId, jogoId } = itemContexto;
            item.iframeUrl = valores.iframeUrl;
            
            console.log("🔍 DEBUG Contexto Completo:", {
                item, 
                origemTipo, 
                origemId,
                jogoId,
                itemTemId: item.id // ← Verificar se o item tem ID
            });
        }

        // 3. Salva os dados PRIMEIRO (localStorage)
        salvarDados();
        console.log("✅ Dados salvos no localStorage");

        // 4. Se há contexto E iframeUrl, salva no backend
        if (valores.iframeUrl && itemContexto) {
            const { item, origemTipo, origemId, jogoId } = itemContexto;
            
            // CORREÇÃO: Tentar múltiplas fontes para o ID
            const idParaRegistro = origemId || itemContexto.origemId || item.id;
            
            console.log("🔍 DEBUG - ID para registro:", idParaRegistro);
            
            if (!idParaRegistro) {
                console.error("❌ Nenhum ID válido encontrado para registro!", {
                    origemId,
                    itemContextoOrigemId: itemContexto.origemId,
                    itemId: item.id
                });
                // Não impedir o processo principal - apenas logar o erro
            } else {
                await salvarAlteracaoIframe(item, origemTipo, idParaRegistro).catch(err => {
                    console.warn('Erro não crítico ao salvar iframe:', err);
                });
            }
        }

        // 5. Fecha o modal
        modal.remove();

        // 6. Recarrega a interface
        console.log("🔄 Forçando atualização da interface...");
        
        if (typeof carregarJogos === 'function') {
            console.log("🔄 Recarregando interface completa...");
            setTimeout(() => {
                carregarJogos();
                console.log("✅ Interface completa recarregada");
            }, 300);
        }

        // 7. Feedback
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Salvo com sucesso!', 'sucesso');
        }

    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        alert('Erro ao salvar. Tente novamente.');
    }
};
}
// Adicione esta função para debug do localStorage
function verificarLocalStorage() {
    console.log("🔍 VERIFICANDO LOCALSTORAGE:");
    const dadosSalvos = localStorage.getItem('dadosApp');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        console.log("✅ localStorage contém dados");
        console.log("- Número de jogos:", dados.jogos?.length);
        // Verifica um card específico
        if (dados.jogos && dados.jogos[0] && dados.jogos[0].estadios) {
            const primeiroCard = dados.jogos[0].estadios[0]?.times[0]?.lives[0]?.divsHorizontais[0]?.cards[0];
            console.log("- Primeiro card no localStorage:", primeiroCard);
        }
    } else {
        console.log("❌ localStorage vazio");
    }
}
// Adicione esta função para verificar se a interface está sendo atualizada
function verificarAtualizacaoInterface() {
    console.log("🔍 VERIFICANDO ATUALIZAÇÃO DA INTERFACE:");
    console.log("- carregarJogos existe:", typeof carregarJogos === 'function');
    console.log("- carregarEstruturaTimeComDados existe:", typeof carregarEstruturaTimeComDados === 'function');
    console.log("- Dados atuais no window.dados:", window.dados?.jogos?.length, "jogos");
    
    // Verifica um card específico nos dados atuais
    if (window.dados?.jogos?.[0]?.estadios?.[0]?.times?.[0]?.lives?.[0]?.divsHorizontais?.[0]?.cards?.[0]) {
        const card = window.dados.jogos[0].estadios[0].times[0].lives[0].divsHorizontais[0].cards[0];
        console.log("- Primeiro card nos dados:", card);
    }
    
    // Verifica iframes na página
    const iframes = document.querySelectorAll('iframe');
    console.log("- Iframes na página:", iframes.length);
    iframes.forEach((iframe, index) => {
        console.log(`  Iframe ${index}: ${iframe.src}`);
    });
}

// Chame esta função após salvar para verificar

/*

function gerarNovosIdsRecursivamente(item, tipo, dados, contexto = {}) {
    console.log(`🆔 Gerando IDs para ${tipo}:`, item.nome || item.titulo || 'sem nome');
    
    // Gera ID para o item atual baseado no tipo
    item.id = gerarNovoIdParaTipo(item, tipo, dados, contexto);
    console.log(`   ✅ ${tipo} recebeu ID: ${item.id}`);
    
    // Processa filhos recursivamente baseado no tipo
    switch (tipo) {
        case 'jogo':
            if (item.estadios && Array.isArray(item.estadios)) {
                console.log(`   🔄 Processando ${item.estadios.length} estádios...`);
                item.estadios.forEach(estadio => {
                    gerarNovosIdsRecursivamente(estadio, 'estadio', dados, {
                        ...contexto,
                        jogoId: item.id
                    });
                });
            }
            break;
            
        case 'estadio':
            if (item.times && Array.isArray(item.times)) {
                console.log(`   🔄 Processando ${item.times.length} times...`);
                item.times.forEach(time => {
                    gerarNovosIdsRecursivamente(time, 'time', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: item.id
                    });
                });
            }
            break;
            
        case 'time':
            if (item.lives && Array.isArray(item.lives)) {
                console.log(`   🔄 Processando ${item.lives.length} lives...`);
                item.lives.forEach(live => {
                    gerarNovosIdsRecursivamente(live, 'live', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: item.id
                    });
                });
            }
            break;
            
        case 'live':
            if (item.divsHorizontais && Array.isArray(item.divsHorizontais)) {
                console.log(`   🔄 Processando ${item.divsHorizontais.length} divs...`);
                item.divsHorizontais.forEach(div => {
                    gerarNovosIdsRecursivamente(div, 'div', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: contexto.timeId,
                        liveId: item.id
                    });
                });
            }
            break;
            
        case 'div':
            if (item.cards && Array.isArray(item.cards)) {
                console.log(`   🔄 Processando ${item.cards.length} cards...`);
                item.cards.forEach(card => {
                    gerarNovosIdsRecursivamente(card, 'card', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: contexto.timeId,
                        liveId: contexto.liveId,
                        divId: item.id
                    });
                });
            }
            break;
            
        // 'card' não tem filhos, então não faz nada
    }
    
    return item;
}
function gerarNovoIdParaTipo(item, tipo, dados, contexto) {
    // Se já tem um ID numérico válido, mantém (não deve acontecer após copiar)
    if (item.id && typeof item.id === 'number' && item.id > 0) {
        return item.id;
    }
    
    // Estratégias diferentes baseadas no tipo
    switch (tipo) {
        case 'jogo':
            return gerarNovoId(dados.jogos);
            
        case 'estadio':
            if (contexto.jogoId) {
                const jogo = encontrarJogo(dados, contexto.jogoId);
                return jogo ? gerarNovoId(jogo.estadios) : Date.now();
            }
            break;
            
        case 'time':
            if (contexto.jogoId && contexto.estadioId) {
                const estadio = encontrarEstadio(dados, contexto.jogoId, contexto.estadioId);
                return estadio ? gerarNovoId(estadio.times) : Date.now();
            }
            break;
            
        case 'live':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId) {
                const time = encontrarTime(dados, contexto.jogoId, contexto.estadioId, contexto.timeId);
                return time ? gerarNovoId(time.lives) : Date.now();
            }
            break;
            
        case 'div':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId && contexto.liveId) {
                const live = encontrarLive(dados, contexto.jogoId, contexto.estadioId, contexto.timeId, contexto.liveId);
                return live ? gerarNovoId(live.divsHorizontais) : Date.now();
            }
            break;
            
        case 'card':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId && contexto.liveId && contexto.divId) {
                const div = encontrarDiv(dados, contexto.jogoId, contexto.estadioId, contexto.timeId, contexto.liveId, contexto.divId);
                return div ? gerarNovoId(div.cards) : Date.now();
            }
            break;
    }
    
    // Fallback: ID baseado em timestamp + random
    const novoId = Date.now() + Math.floor(Math.random() * 1000);
    console.log(`   🎲 ID fallback gerado: ${novoId}`);
    return novoId;
}
*/

function gerarNovoId(array) {
    if (!array || array.length === 0) return 1;
    
    const ids = array
        .map(item => item.id)
        .filter(id => id !== null && id !== undefined && typeof id === 'number' && id > 0);
    
    if (ids.length === 0) return 1;
    
    const maxId = Math.max(...ids);
    return maxId + 1;
}

/////////////////
/////////////////
/////////////////
/////////////////
/////////////////
/////////////////

/**
 * Gera novos IDs recursivamente para um item e todos os seus filhos - VERSÃO CORRIGIDA
 * @param {object} item - Item a ser processado
 * @param {string} tipo - Tipo do item (jogo, estadio, time, etc.)
 * @param {object} dados - Dados globais para referência
 * @param {object} contexto - Contexto com IDs parentais
 * @returns {object} Item com novos IDs
 */
function gerarNovosIdsRecursivamente(item, tipo, dados, contexto = {}) {
    console.log(`🆔 Gerando IDs para ${tipo}:`, item.nome || item.titulo || 'sem nome');
    console.log(`   📍 Contexto recebido:`, contexto);
    
    // CORREÇÃO: Gera ID para o item atual baseado no tipo
    const novoId = gerarNovoIdParaTipo(item, tipo, dados, contexto);
    item.id = novoId;
    console.log(`   ✅ ${tipo} recebeu ID: ${item.id}`);
    
    // CORREÇÃO: Processa filhos recursivamente baseado no tipo, passando contexto ATUALIZADO
    switch (tipo) {
        case 'jogo':
            if (item.estadios && Array.isArray(item.estadios)) {
                console.log(`   🔄 Processando ${item.estadios.length} estádios...`);
                item.estadios.forEach(estadio => {
                    gerarNovosIdsRecursivamente(estadio, 'estadio', dados, {
                        ...contexto,
                        jogoId: item.id // ← USA O NOVO ID DO JOGO
                    });
                });
            }
            break;
            
        case 'estadio':
            if (item.times && Array.isArray(item.times)) {
                console.log(`   🔄 Processando ${item.times.length} times...`);
                item.times.forEach(time => {
                    gerarNovosIdsRecursivamente(time, 'time', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: item.id // ← USA O NOVO ID DO ESTÁDIO
                    });
                });
            }
            break;
            
        case 'time':
            if (item.lives && Array.isArray(item.lives)) {
                console.log(`   🔄 Processando ${item.lives.length} lives...`);
                item.lives.forEach(live => {
                    gerarNovosIdsRecursivamente(live, 'live', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: item.id // ← USA O NOVO ID DO TIME
                    });
                });
            }
            break;
            
        case 'live':
            if (item.divsHorizontais && Array.isArray(item.divsHorizontais)) {
                console.log(`   🔄 Processando ${item.divsHorizontais.length} divs...`);
                item.divsHorizontais.forEach(div => {
                    gerarNovosIdsRecursivamente(div, 'div', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: contexto.timeId,
                        liveId: item.id // ← USA O NOVO ID DA LIVE
                    });
                });
            }
            break;
            
        case 'div':
            if (item.cards && Array.isArray(item.cards)) {
                console.log(`   🔄 Processando ${item.cards.length} cards...`);
                item.cards.forEach(card => {
                    gerarNovosIdsRecursivamente(card, 'card', dados, {
                        ...contexto,
                        jogoId: contexto.jogoId,
                        estadioId: contexto.estadioId,
                        timeId: contexto.timeId,
                        liveId: contexto.liveId,
                        divId: item.id // ← USA O NOVO ID DA DIV
                    });
                });
            }
            break;
    }
    
    return item;
}

/**
 * Gera um novo ID único baseado no tipo e contexto - VERSÃO CORRIGIDA
 */
function gerarNovoIdParaTipo(item, tipo, dados, contexto) {
    console.log(`   🔍 Buscando ID para ${tipo} com contexto:`, contexto);
    
    // Se já tem um ID numérico válido, mantém
    if (item.id && typeof item.id === 'number' && item.id > 0) {
        console.log(`   ✅ ${tipo} já tem ID válido: ${item.id}`);
        return item.id;
    }
    
    // CORREÇÃO: Estratégias diferentes baseadas no tipo com fallback melhorado
    let novoId = null;
    
    switch (tipo) {
        case 'jogo':
            novoId = gerarNovoId(dados.jogos);
            break;
            
        case 'estadio':
            if (contexto.jogoId) {
                const jogo = encontrarJogo(dados, contexto.jogoId);
                if (jogo && jogo.estadios) {
                    novoId = gerarNovoId(jogo.estadios);
                } else {
                    console.warn(`   ⚠️ Jogo ${contexto.jogoId} não encontrado para gerar ID de estádio`);
                }
            }
            break;
            
        case 'time':
            if (contexto.jogoId && contexto.estadioId) {
                const estadio = encontrarEstadio(dados, contexto.jogoId, contexto.estadioId);
                if (estadio && estadio.times) {
                    novoId = gerarNovoId(estadio.times);
                } else {
                    console.warn(`   ⚠️ Estádio ${contexto.estadioId} não encontrado para gerar ID de time`);
                }
            }
            break;
            
        case 'live':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId) {
                const time = encontrarTime(dados, contexto.jogoId, contexto.estadioId, contexto.timeId);
                if (time && time.lives) {
                    novoId = gerarNovoId(time.lives);
                } else {
                    console.warn(`   ⚠️ Time ${contexto.timeId} não encontrado para gerar ID de live`);
                }
            }
            break;
            
        case 'div':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId && contexto.liveId) {
                const live = encontrarLive(dados, contexto.jogoId, contexto.estadioId, contexto.timeId, contexto.liveId);
                if (live && live.divsHorizontais) {
                    novoId = gerarNovoId(live.divsHorizontais);
                } else {
                    console.warn(`   ⚠️ Live ${contexto.liveId} não encontrada para gerar ID de div`);
                }
            }
            break;
            
        case 'card':
            if (contexto.jogoId && contexto.estadioId && contexto.timeId && contexto.liveId && contexto.divId) {
                const div = encontrarDiv(dados, contexto.jogoId, contexto.estadioId, contexto.timeId, contexto.liveId, contexto.divId);
                if (div && div.cards) {
                    novoId = gerarNovoId(div.cards);
                } else {
                    console.warn(`   ⚠️ Div ${contexto.divId} não encontrada para gerar ID de card`);
                }
            }
            break;
    }
    
    // CORREÇÃO: Fallback melhorado
    if (novoId === null) {
        novoId = Date.now() + Math.floor(Math.random() * 1000);
        console.log(`   🎲 ID fallback gerado para ${tipo}: ${novoId}`);
    } else {
        console.log(`   🆔 ID sequencial gerado para ${tipo}: ${novoId}`);
    }
    
    return novoId;
}












