// Funções de geração de botões atualizadas
function gerarNovoId(array) {
    if (!array || array.length === 0) {
        return 1;
    }
    const maxId = Math.max(...array.map(item => item.id || 0));
    return maxId + 1;
}
function encontrarJogo(dados, jogoId) {
    return dados.jogos.find(j => j.id === jogoId);
}
function encontrarEstadio(dados, jogoId, estadioId) {
    const jogo = encontrarJogo(dados, jogoId);
    return jogo?.estadios.find(e => e.id === estadioId);
}
function encontrarTime(dados, jogoId, estadioId, timeId) {
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    return estadio?.times.find(t => t.id === timeId);
}
function encontrarLive(dados, jogoId, estadioId, timeId, liveId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    return time?.lives.find(l => l.id === liveId);
}
function encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    return live?.divsHorizontais.find(d => d.id === divId);
}
function encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    return div?.cards.find(c => c.id === cardId);
}



function gerarHTMLCardEstadio(jogo, estadio, modoGeral = false) {
    const jogoId = jogo.id;
    const estadioId = estadio.id;

    // Estado do toggle
    const toggleStates = {};
    const isExpanded = toggleStates[estadioId] || false;

    // === CONTAINER PRINCIPAL ===
    const cardHTML = `
        <div class="estadio-item" style="border:1px solid #ddd; margin:15px 0; padding:15px; border-radius:8px; background:#fafafa;">
            <!-- HEADER -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    ${estadio.iframeUrl ? `
                        <div style="position: relative; width:90%; height:90%; overflow:hidden; border-radius:8px; cursor:pointer;">
                            <iframe src="${estadio.iframeUrl}" 
                                    style="width:100%; height:100%; border:none; border-radius:8px;"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    loading="lazy"
                                    title="${estadio.nome}">
                            </iframe>
                            <div style="position: absolute; top:0; left:0; width:100%; height:100%; 
                                        background: transparent; z-index: 1; cursor: pointer;"
                                 onclick="verTimesDoEstadio(${jogoId}, ${estadioId})"></div>
                        </div>
                    ` : `
                        <div style="width:120px; height:80px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer;"
                             onclick="verTimesDoEstadio(${jogoId}, ${estadioId})">
                            🏟️
                        </div>
                    `}
                    <div>
                        <h3 style="margin:0; cursor:pointer; color:#007bff; font-size:1.1em;" 
                            onclick="verTimesDoEstadio(${jogoId}, ${estadioId})">
                            ${estadio.nome}
                        </h3>
                        <p style="margin:3px 0; color:#555; font-size:0.9em;">
                            ID: ${estadioId}${modoGeral ? ` | Jogo: ${jogo.nome}` : ''}
                            | Times: ${estadio.times.length}
                        </p>
                    </div>
                </div>
                <button id="toggle-${estadioId}" 
                        style="width:36px; height:36px; border:none; border-radius:50%; background:#007bff; color:white; font-weight:bold; font-size:1.2em; cursor:pointer; display:flex; align-items:center; justify-content:center;"
                        onclick="toggleEstadioBotoes(${estadioId})">
                    ${isExpanded ? '−' : '+'}
                </button>
            </div>

            <!-- BOTÕES (ocultáveis) -->
            <div id="botoes-estadio-${estadioId}" 
                 style="display:${isExpanded ? 'flex' : 'none'}; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px; padding:10px; background:#f8f9fa; border-radius:6px;">
                ${gerarBotoesEstadio(jogoId, estadioId)}
            </div>
            <hr>
        </div>
    `;

    return cardHTML;
}
function gerarHTMLCardTime(jogo, estadio, time, mostrarLocal = false) {
  console.log("toggleTimeBotoes__>gerarHTMLCardTime")
    const timeId = time.id;
    const localInfo = mostrarLocal ? 
        `<div style="font-size: 0.8em; color: #666; margin-bottom: 8px;">
            Jogo: ${jogo.nome} | Estádio: ${estadio.nome}
        </div>` : '';

    // Estado do toggle
    const toggleStates = {};
    const isExpanded = toggleStates[timeId] || false;

    // === BLOCO DE IFRAME ===
    const iframeBlock = `
        ${time.iframeUrl ? `
            <div style="position: relative; width:120px; height:80px; overflow:hidden; border-radius:8px; cursor:pointer; flex-shrink: 0;">
                <iframe src="${time.iframeUrl}" 
                        style="width:100%; height:100%; border:none; border-radius:8px;"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        loading="lazy"
                        title="${time.nome}">
                </iframe>
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; 
                            background: transparent; z-index: 1; cursor: pointer;"
                     onclick="verLivesDoTime(${jogo.id}, ${estadio.id}, ${time.id})"></div>
            </div>
        ` : `
            <div style="width:120px; height:80px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer; flex-shrink: 0;"
                 onclick="verLivesDoTime(${jogo.id}, ${estadio.id}, ${time.id})">
                🏆
            </div>
        `}
    `;

    // ... (início da função gerarHTMLCardTime) ...

    // === CARD DO TIME ===
    return `
        <div class="card-time" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${localInfo}
            
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    ${iframeBlock}
                    <div>
                        <h4 style="margin:0; color:#333;">${time.nome}</h4>
                        <p style="margin:3px 0; color:#666; font-size:0.9em;">${time.descricao || 'Sem descrição'}</p>
                    </div>
                </div>
                
                <button id="toggle-time-${timeId}" 
                        style="width:36px; height:36px; border:none; border-radius:50%; background:#007bff; color:white; font-weight:bold; font-size:1.2em; cursor:pointer; display:flex; align-items:center; justify-content:center;"
                        onclick="toggleTimeBotoes(${timeId})">
                    ${isExpanded ? '−' : '+'}
                </button>
            </div>

            <div id="botoes-time-${timeId}" 
                 style="display:${isExpanded ? 'flex' : 'none'}; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px; padding:10px; background:#f8f9fa; border-radius:6px;">
                 
                 ${gerarBotoesTime(jogo.id, estadio.id, time.id)} 
            </div>

        </div>
    `;

}
function gerarUniqueCardId(liveId, divId, cardId) {
    return `${liveId}-${divId}-${cardId}`;
}
function gerarBotoesEstadio(jogoId, estadioId) {
    const jogo = encontrarJogo(dados, jogoId);
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    if (!estadio) return '';

    const isCopiado = clipboard.tipo === 'estadio' && clipboard.originalId === estadioId;

    let botoes = `
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#17a2b8; cursor:pointer; font-size:0.85em;" 
                onclick="verTimesDoEstadio(${jogoId}, ${estadioId})">Ver Times</button>
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#ffc107; cursor:pointer; font-size:0.85em;" 
                onclick="acaoEditarEstadio(${jogoId}, ${estadioId})">Editar</button>
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#6c757d; cursor:pointer; font-size:0.85em;" 
                onclick="alterarImagemEstadio(${jogoId}, ${estadioId})">Imagem</button>
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#dc3545; cursor:pointer; font-size:0.85em;" 
                onclick="acaoExcluirEstadio(${jogoId}, ${estadioId})">Excluir</button>
        
        <!-- BOTÕES DE COMPARTILHAR ADICIONADOS -->
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#007bff; cursor:pointer; font-size:0.85em;" 
                onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId} })">Compartilhar Link</button>
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#28a745; cursor:pointer; font-size:0.85em;" 
                onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId} }, true)">Link App Sinc.</button>
        
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; background:#9c27b0; cursor:pointer; font-size:0.85em;" 
                onclick="abrirChatParaItem('estadio', ${estadio.id}, '${escapeStringForHTML(estadio.nome)}')">💬 Chat estádio</button>
    `;

    botoes += `
        <button style="padding:6px 10px; border:none; border-radius:5px; color:white; cursor:pointer; font-size:0.85em; background:${isCopiado ? '#28a745' : '#6f42c1'};"
                onclick="acaoCopiarEstadio(${jogoId}, ${estadioId})">
            ${isCopiado ? 'Copiado' : 'Copiar'}
        </button>
    `;

    return botoes;
}
function gerarBotoesTime(jogoId, estadioId, timeId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    if (!time) return '';

    const isCopiado = clipboard.tipo === 'time' && clipboard.originalId === timeId;
    const commonStyle = "padding:6px 10px; border:none; border-radius:5px; color:white; cursor:pointer; font-size:0.85em;";

    return `
        <button style="${commonStyle} background:#17a2b8;" 
                onclick="verLivesDoTime(${jogoId}, ${estadioId}, ${timeId})">Ver Lives</button>
        <button style="${commonStyle} background:#ffc107;" 
                onclick="acaoEditarTime(${jogoId}, ${estadioId}, ${timeId})">Editar</button>
        <button style="${commonStyle} background:#dc3545;" 
                onclick="acaoExcluirTime(${jogoId}, ${estadioId}, ${timeId})">Excluir</button>
        
        <!-- BOTÕES DE COMPARTILHAR ADICIONADOS -->
        <button style="${commonStyle} background:#007bff;" 
                onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId} })">Compartilhar Link</button>
        <button style="${commonStyle} background:#28a745;" 
                onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId} }, true)">Link App Sinc.</button>
        
        <button style="${commonStyle} background:${isCopiado ? '#28a745' : '#6f42c1'};" 
                onclick="acaoCopiarTime(${jogoId}, ${estadioId}, ${timeId})">
            ${isCopiado ? 'Copiado' : 'Copiar'}
        </button>
        <button style="${commonStyle} background:#9c27b0;" 
                onclick="abrirChatParaItem('time', ${timeId}, '${escapeStringForHTML(time.nome)}')">💬 Chat Time</button>
    `;
}
function gerarBotoesLive(jogoId, estadioId, timeId, liveId) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    if (!live) return '';

    const isCopiado = clipboard.tipo === 'live' && clipboard.originalId === liveId;
    
    return `
        <button style="${commonBtnStyle} background:#28a745;" onclick="acaoAdicionarDiv(${jogoId}, ${estadioId}, ${timeId}, ${liveId})">+ Add Div</button>
        <button style="${commonBtnStyle} background:#ffc107;" onclick="acaoEditarLive(${jogoId}, ${estadioId}, ${timeId}, ${liveId})">Editar Live</button>
        <button style="${commonBtnStyle} background:#dc3545;" onclick="acaoExcluirLive(${jogoId}, ${estadioId}, ${timeId}, ${liveId})">Excluir Live</button>
        <button style="${commonBtnStyle} background:${isCopiado ? '#28a745' : '#6f42c1'};" onclick="acaoCopiarLive(${jogoId}, ${estadioId}, ${timeId}, ${liveId})">
            ${isCopiado ? 'Copiado' : 'Copiar'}
        </button>
        
        <!-- BOTÕES DE COMPARTILHAR ADICIONADOS -->
        <button style="${commonBtnStyle} background:#007bff;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId} })">Compartilhar Link</button>
        <button style="${commonBtnStyle} background:#28a745;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId} }, true)">Link App Sinc.</button>
        
        ${clipboard.tipo === 'div' ? `
            <button style="${commonBtnStyle} background:#6f42c1;" onclick="acaoColarDiv(${jogoId}, ${estadioId}, ${timeId}, ${liveId})">Colar Div</button>
        ` : ''}
        
        <button class="toggle-headers-btn" style="${commonBtnStyle} background:#ffc107; color:white;" onclick="toggleCardHeadersGlobais()">
            ${globalHeadersVisiveis ? 'Esconder Headers' : 'Mostrar Headers'}
        </button>

        <button style="${commonBtnStyle} background:#9c27b0;" 
                onclick="abrirChatParaItem('live', ${liveId}, '${escapeStringForHTML(live.titulo)}')">💬 Chat Live</button>
    `;
}
function gerarBotoesDiv(jogoId, estadioId, timeId, liveId, divId) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    if (!div) return '';

    const isCopiado = clipboard.tipo === 'div' && clipboard.originalId === divId;
    
    return `
        <button style="${commonBtnStyle} background:#28a745;" onclick="acaoAdicionarCard(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId})">+ Add Card</button>
        <button style="${commonBtnStyle} background:#ffc107;" onclick="acaoEditarDiv(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId})">Editar Div</button>
        <button style="${commonBtnStyle} background:#dc3545;" onclick="acaoExcluirDiv(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId})">Excluir Div</button>
        <button style="${commonBtnStyle} background:${isCopiado ? '#28a745' : '#6f42c1'};" onclick="acaoCopiarDiv(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId})">
            ${isCopiado ? 'Copiado' : 'Copiar'}
        </button>
        
        <!-- BOTÕES DE COMPARTILHAR ADICIONADOS -->
        <button style="${commonBtnStyle} background:#007bff;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId}, divId: ${divId} })">Compartilhar Link</button>
        <button style="${commonBtnStyle} background:#28a745;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId}, divId: ${divId} }, true)">Link App Sinc.</button>
        
        ${clipboard.tipo === 'card' ? `
            <button style="${commonBtnStyle} background:#6f42c1;" onclick="acaoColarCard(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId})">Colar Card</button>
        ` : ''}

        <button style="${commonBtnStyle} background:#9c27b0;" 
                onclick="abrirChatParaItem('div', ${divId}, '${escapeStringForHTML(div.titulo)}')">💬 Chat Div</button>
    `;
}
function gerarBotoesCard(jogoId, estadioId, timeId, liveId, divId, cardId) {
    const card = encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
    if (!card) return '';

    const isCopiado = clipboard.tipo === 'card' && clipboard.originalId === cardId;
    const uniqueId = `card-${jogoId}-${estadioId}-${timeId}-${liveId}-${divId}-${cardId}`;
    
    return `
        <button style="${commonBtnStyle} background:#ffc107;" onclick="acaoEditarCard(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId}, ${cardId})">Editar Card</button>
        <button style="${commonBtnStyle} background:#dc3545;" onclick="acaoExcluirCard(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId}, ${cardId})">Excluir Card</button>
        <button style="${commonBtnStyle} background:${isCopiado ? '#28a745' : '#6f42c1'};" onclick="acaoCopiarCard(${jogoId}, ${estadioId}, ${timeId}, ${liveId}, ${divId}, ${cardId})">
            ${isCopiado ? 'Copiado' : 'Copiar'}
        </button>
        
        <!-- BOTÕES DE COMPARTILHAR ADICIONADOS -->
        <button style="${commonBtnStyle} background:#007bff;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId}, divId: ${divId}, cardId: ${cardId} })">Compartilhar Link</button>
        <button style="${commonBtnStyle} background:#28a745;" onclick="compartilharLocal({ jogoId: ${jogoId}, estadioId: ${estadioId}, timeId: ${timeId}, liveId: ${liveId}, divId: ${divId}, cardId: ${cardId} }, true)">Link App Sinc.</button>

        <button style="${commonBtnStyle} background:#9c27b0;" 
                onclick="abrirChatParaItem('card', ${cardId}, '${escapeStringForHTML(card.titulo)}')">💬 Chat Card</button>
    `;
}

// === FUNÇÃO TOGGLE DOS COMPONENTERS  ===
function toggleEstadioBotoes(estadioId) {
    const container = document.getElementById(`botoes-estadio-${estadioId}`);
    const btn = document.getElementById(`toggle-${estadioId}`);
    const expanded = container.style.display === 'flex';
    container.style.display = expanded ? 'none' : 'flex';
    btn.innerHTML = expanded ? '+' : '−';
}
function toggleTimeBotoes(timeId) {
    const container = document.getElementById(`botoes-time-${timeId}`);
    const btn = document.getElementById(`toggle-time-${timeId}`);
    const expanded = container.style.display === 'flex';
    container.style.display = expanded ? 'none' : 'flex';
    btn.innerHTML = expanded ? '+' : '−';
}
function toggleLiveBotoes(liveId) {
    const container = document.getElementById(`botoes-live-${liveId}`);
    const btn = document.getElementById(`toggle-live-${liveId}`);
    const expanded = container.style.display === 'flex';
    
    container.style.display = expanded ? 'none' : 'flex';
    btn.innerHTML = expanded ? '+' : '−';
    toggleStatesLive[liveId] = !expanded;
}
function toggleScrollContainerBotoes(divId) {

      const container = document.getElementById(`botoes-scroll-${divId}`);
    const btn = document.getElementById(`toggle-scroll-${divId}`);
    const expanded = container.style.display === 'flex';
    
    container.style.display = expanded ? 'none' : 'flex';
    btn.innerHTML = expanded ? '+' : '−';
    toggleStatesDiv[divId] = !expanded;
}

function toggleCardHeadersGlobais() {
    // 1. Alterna o estado global
    globalHeadersVisiveis = !globalHeadersVisiveis;

    // 2. Define o estilo de display ('' reverte ao padrão do CSS)
    const newDisplayStyle = globalHeadersVisiveis ? '' : 'none';

    // 3. Seleciona os cabeçalhos dos cards
    const cardHeaders = document.querySelectorAll('.card .card-header');
    cardHeaders.forEach(header => {
        header.style.display = newDisplayStyle;
    });

    // 4. Seleciona os H4 (títulos) das DIVS
    const divH4Headers = document.querySelectorAll('.div-title-header'); 
    divH4Headers.forEach(header => { 
        header.style.display = newDisplayStyle; 
    }); 

    // 5. Seleciona os botões '+' dos cards
    const cardPlusButtons = document.querySelectorAll('.card [id^="toggle-"]');
    cardPlusButtons.forEach(btn => {
        btn.style.display = newDisplayStyle;
    });

    // 6. (NOVO) Seleciona TODOS os botões de Colar (Live, Div, Card)
    const colarButtons = document.querySelectorAll('.btn-colar-dinamico');
    colarButtons.forEach(btn => {
        btn.style.display = newDisplayStyle;
    });

    // 7. Seleciona os botões '+' das DIVS
    const divPlusButtons = document.querySelectorAll('[id^="toggle-div-"]');
    divPlusButtons.forEach(btn => {
        btn.style.display = newDisplayStyle;
    });

    // 8. Seleciona os "footers" (containers de botões) dos CARDS
    const cardFooters = document.querySelectorAll('.card [id^="botoes-"]');
    cardFooters.forEach(footer => {
        if (!globalHeadersVisiveis) {
            // Se estamos ESCONDENDO:
            // Forçamos o footer a se esconder, não importa seu estado atual.
            footer.style.display = 'none';
        }
    });

    // 9. Seleciona os "footers" (containers de botões) das DIVS
    const divFooters = document.querySelectorAll('[id^="botoes-div-"]');
    divFooters.forEach(footer => {
        if (!globalHeadersVisiveis) {
            // Se estamos ESCONDENDO:
            // Forçamos o footer a se esconder, não importa seu estado atual.
            footer.style.display = 'none';
        }
    });

    // 10. Atualiza o texto de todos os botões de toggle
    const toggleButtons = document.querySelectorAll('.toggle-headers-btn');
    const buttonText = globalHeadersVisiveis ? 'Esconder Headers' : 'Mostrar Headers';
    toggleButtons.forEach(btn => {
        btn.textContent = buttonText;
    });
}
function toggleDivBotoes(divId) {
    const container = document.getElementById(`botoes-div-${divId}`);
    const btn = document.getElementById(`toggle-div-${divId}`);
    const expanded = container.style.display === 'flex';
    
    container.style.display = expanded ? 'none' : 'flex';
    btn.innerHTML = expanded ? '+' : '−';
    toggleStatesDiv[divId] = !expanded;
}
function toggleIframerBotoes(uniqueCardId) {
        const container = document.getElementById(`botoes-${uniqueCardId}`);
        const btn = document.getElementById(`toggle-${uniqueCardId}`);
        if (!container || !btn) {
            console.error(`Elementos não encontrados para uniqueCardId: ${uniqueCardId}`);
            return;
        }
        const expanded = container.style.display === 'flex';
        container.style.display = expanded ? 'none' : 'flex';
        btn.innerHTML = expanded ? '+' : '−';
        toggleStatesIframer[uniqueCardId] = !expanded;
    }

function voltarParaJogos() {
    mostrarSecao('jogos');
    // Não limpa jogoSelecionadoId para manter contexto
}
function voltarParaEstadios() {
    mostrarSecao('estadios');
    // Não limpa estadioSelecionadoId para manter contexto
}
function voltarParaTimes() {
    mostrarSecao('times');
    // Não limpa timeSelecionadoId para manter contexto
}
function voltarParaLives() {
    mostrarSecao('lives');
}

function verEstadiosDoJogo(jogoId) {
    jogoSelecionadoId = jogoId;
    mostrarSecao('estadios');
    
    // LINHA ADICIONADA:
    // Esta função (que está em index.html) precisa ser chamada
    // para carregar os estádios corretos na seção.
    carregarEstadiosDoJogo(jogoId); 
}
function verTimesDoEstadio(jogoId, estadioId) {
    jogoSelecionadoId = jogoId;
    estadioSelecionadoId = estadioId;
    mostrarSecao('times');
    
    // LINHA ADICIONADA:
    // Esta função (que está em index.html) precisa ser chamada
    // para carregar os times corretos na seção.
    carregarTimesDoEstadio(jogoId, estadioId);
}
function verLivesDoTime(jogoId, estadioId, timeId) {
    // 1. Atualiza IDs selecionados
    jogoSelecionadoId = jogoId;
    estadioSelecionadoId = estadioId;
    timeSelecionadoId = timeId;
    
    // 2. Não salva no localStorage.
    
    // 3. Mostra a seção 'lives'
    mostrarSecao('lives');
    
    // 4. Chama a nova função de carregamento, passando os IDs (ESTA PARTE É ESSENCIAL)
    carregarEstruturaTimeComDados(jogoId, estadioId, timeId); // <-- Nova função
}


