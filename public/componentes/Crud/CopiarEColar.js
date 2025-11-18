function copiarItem(tipo, itemData) {
    console.log(`[COPIAR - INÍCIO] Tentativa de copiar item do tipo: ${tipo}`);

    if (!itemData) {
        console.error('[COPIAR - ERRO] Item nulo ou indefinido.');
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Falha ao copiar: Item nulo.', 'erro');
        }
        return;
    }
    
    try {
        // 1. LIMPEZA DOS DADOS: Remove IDs e referências circulares
        const dadosLimpos = JSON.parse(JSON.stringify(itemData));
        
        // CORREÇÃO: Remove TODOS os IDs recursivamente
        const removerIdsRecursivamente = (obj) => {
            if (obj && typeof obj === 'object') {
                // Remove ID do objeto atual
                if (obj.id !== undefined) {
                    delete obj.id;
                }
                if (obj.cardId !== undefined) {
                    delete obj.cardId;
                }
                
                // Processa arrays recursivamente
                Object.keys(obj).forEach(key => {
                    if (Array.isArray(obj[key])) {
                        obj[key].forEach(removerIdsRecursivamente);
                    } else if (obj[key] && typeof obj[key] === 'object') {
                        removerIdsRecursivamente(obj[key]);
                    }
                });
            }
        };
        
        removerIdsRecursivamente(dadosLimpos);
        console.log(`[COPIAR] Todos os IDs removidos do item ${tipo}`);
        
        // 2. SALVA NA VARIÁVEL GLOBAL
        clipboard.tipo = tipo;
        clipboard.dados = dadosLimpos;
        
        console.log(`[COPIAR - GLOBAL] Item salvo. Tipo: ${clipboard.tipo}`);
        
        // 3. SALVA NO SESSION STORAGE para WebRTC
        const itemName = itemData.nome || itemData.titulo || 'Item Sem Nome';
        const shareableData = {
            itemType: tipo,
            itemName: itemName,
            payload: JSON.stringify(dadosLimpos)
        };
        
        const serializedShareData = JSON.stringify(shareableData);
        sessionStorage.setItem('webrtc_clipboard', serializedShareData);
        
        console.log(`[COPIAR - SUCCESS] Item salvo no sessionStorage. Tamanho: ${serializedShareData.length} bytes`);
        
        // 4. Notificação
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} "${itemName}" copiado! ✓`, 'sucesso');
        }
        
    } catch (e) {
        console.error('[COPIAR - ERRO] Falha ao copiar:', e);
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Falha ao copiar item.', 'erro');
        }
    }
}
// CORREÇÃO DA FUNÇÃO colarItem - VERSÃO MELHORADA
async function colarItem(dados, tipoAlvo, parentIds = {}) {
    if (clipboard.tipo !== tipoAlvo || !clipboard.dados) {
        alert(`Nada para colar ou tipo incompatível. (Esperando: ${tipoAlvo})`);
        return null;
    }

    let novoItem = null;
    const dadosParaColar = JSON.parse(JSON.stringify(clipboard.dados));

    try {
        console.log(`📋 Iniciando colagem de ${tipoAlvo} com parentIds:`, parentIds);

        // CORREÇÃO: Validação dos parentIds antes de prosseguir
        if (!validarParentIds(tipoAlvo, parentIds)) {
            throw new Error(`IDs parentais inválidos para colar ${tipoAlvo}`);
        }

        // CORREÇÃO: Gera novos IDs ANTES de adicionar à estrutura
        console.log(`🆔 Iniciando geração de IDs para ${tipoAlvo}...`);
        gerarNovosIdsRecursivamente(dadosParaColar, tipoAlvo, dados, parentIds);
        
        // Atualiza informações do criador
        if (window.usuarioLogado) {
            dadosParaColar.creatorId = window.usuarioLogado.id;
            dadosParaColar.criador = window.usuarioLogado.nome || window.usuarioLogado.email;
            dadosParaColar.senha = window.usuarioLogado.senha;
        } else {
            dadosParaColar.creatorId = null;
            dadosParaColar.criador = "Usuário Anônimo";
            dadosParaColar.senha = "senha_padrao";
        }

        // CORREÇÃO: Verifica se os parentIds existem antes de tentar colar
        switch (tipoAlvo) {
            case 'jogo':
                novoItem = adicionarJogo(dados, dadosParaColar);
                break;
            case 'estadio':
                if (!parentIds.jogoId) throw new Error('jogoId é necessário para colar um estádio.');
                if (!encontrarJogo(dados, parentIds.jogoId)) throw new Error(`Jogo ${parentIds.jogoId} não encontrado`);
                novoItem = adicionarEstadio(dados, parentIds.jogoId, dadosParaColar);
                break;
            case 'time':
                if (!parentIds.jogoId || !parentIds.estadioId) throw new Error('jogoId e estadioId são necessários para colar um time.');
                if (!encontrarEstadio(dados, parentIds.jogoId, parentIds.estadioId)) throw new Error(`Estádio ${parentIds.estadioId} não encontrado no jogo ${parentIds.jogoId}`);
                novoItem = adicionarTime(dados, parentIds.jogoId, parentIds.estadioId, dadosParaColar);
                break;
            case 'live':
                if (!parentIds.jogoId || !parentIds.estadioId || !parentIds.timeId) throw new Error('jogoId, estadioId e timeId são necessários para colar uma live.');
                if (!encontrarTime(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId)) throw new Error(`Time ${parentIds.timeId} não encontrado`);
                novoItem = adicionarLive(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId, dadosParaColar);
                break;
            case 'div':
                if (!parentIds.jogoId || !parentIds.estadioId || !parentIds.timeId || !parentIds.liveId) throw new Error('IDs pais são necessários para colar uma div.');
                if (!encontrarLive(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId, parentIds.liveId)) throw new Error(`Live ${parentIds.liveId} não encontrada`);
                novoItem = adicionarDiv(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId, parentIds.liveId, dadosParaColar);
                break;
            case 'card':
                if (!parentIds.jogoId || !parentIds.estadioId || !parentIds.timeId || !parentIds.liveId || !parentIds.divId) throw new Error('IDs pais são necessários para colar um card.');
                if (!encontrarDiv(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId, parentIds.liveId, parentIds.divId)) throw new Error(`Div ${parentIds.divId} não encontrada`);
                novoItem = adicionarCard(dados, parentIds.jogoId, parentIds.estadioId, parentIds.timeId, parentIds.liveId, parentIds.divId, dadosParaColar);
                break;
            default:
                alert('Tipo de item desconhecido para colar.');
        }
        
        if (novoItem) {
            console.log(`✅ ${tipoAlvo} colado com ID: ${novoItem.id}`);
            
            // Verifica se todos os IDs foram gerados corretamente
            verificarIDsRecursivamente(novoItem, tipoAlvo);
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                try {
                    switch (tipoAlvo) {
                        case 'jogo':
                            await criarJogoBackend(novoItem);
                            break;
                        case 'estadio':
                            await criarEstadioBackend(novoItem);
                            break;
                        case 'time':
                            await criarTimeBackend(novoItem);
                            break;
                        case 'live':
                            await criarLiveBackend(novoItem);
                            break;
                        case 'div':
                            await criarDivBackend(novoItem);
                            break;
                        case 'card':
                            await criarCardBackend(novoItem);
                            break;
                    }
                    console.log(`✅ ${tipoAlvo} sincronizado com backend`);
                } catch (error) {
                    console.error(`❌ Erro ao sincronizar ${tipoAlvo} no backend:`, error);
                }
            }
            
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao(`${tipoAlvo} colado com sucesso!`, 'sucesso');
            }
        }
        return novoItem;

    } catch (e) {
        console.error(`❌ Erro ao colar ${tipoAlvo}:`, e);
        console.error(`📌 Mensagem detalhada: ${e.message}`);
        alert(`Erro ao colar ${tipoAlvo}: ${e.message}`);
        return null;
    }
}

// FUNÇÃO AUXILIAR PARA VALIDAR PARENT IDs
function validarParentIds(tipoAlvo, parentIds) {
    const validacoes = {
        'jogo': () => true, // Jogo não precisa de parent
        'estadio': () => !!parentIds.jogoId,
        'time': () => !!(parentIds.jogoId && parentIds.estadioId),
        'live': () => !!(parentIds.jogoId && parentIds.estadioId && parentIds.timeId),
        'div': () => !!(parentIds.jogoId && parentIds.estadioId && parentIds.timeId && parentIds.liveId),
        'card': () => !!(parentIds.jogoId && parentIds.estadioId && parentIds.timeId && parentIds.liveId && parentIds.divId)
    };

    if (!validacoes[tipoAlvo] || !validacoes[tipoAlvo]()) {
        console.error(`❌ ParentIds inválidos para ${tipoAlvo}:`, parentIds);
        return false;
    }
    return true;
}

// FUNÇÃO PARA VERIFICAR IDs RECURSIVAMENTE (DEBUG)
function verificarIDsRecursivamente(item, tipo, nivel = 0) {
    const indent = '  '.repeat(nivel);
    console.log(`${indent}🔍 Verificando ${tipo}: ID = ${item.id || 'NULL'}`);
    
    if (!item.id) {
        console.error(`${indent}❌ ${tipo} SEM ID!`);
    }
    
    // Verifica filhos recursivamente
    const filhos = {
        'jogo': item.estadios,
        'estadio': item.times,
        'time': item.lives,
        'live': item.divsHorizontais,
        'div': item.cards
    };
    
    if (filhos[tipo]) {
        filhos[tipo]?.forEach((filho, index) => {
            const tipoFilho = {
                'jogo': 'estadio',
                'estadio': 'time',
                'time': 'live',
                'live': 'div',
                'div': 'card'
            }[tipo];
            
            verificarIDsRecursivamente(filho, tipoFilho, nivel + 1);
        });
    }
}

// Atualize estas funções para serem async
async function acaoColarJogo() {
    const novoItem = await colarItem(dados, 'jogo');
    if (novoItem) {
        salvarDados();
        await carregarJogos();
    }
}

async function acaoColarEstadio(jogoId) {
    const novoItem = await colarItem(dados, 'estadio', { jogoId });
    if (novoItem) {
        salvarDados();
        carregarEstadiosDoJogo(jogoId);
    }
}

async function acaoColarTime(jogoId, estadioId) {
    const novoItem = await colarItem(dados, 'time', { jogoId, estadioId });
    if (novoItem) {
        salvarDados();
        carregarTimesDoEstadio(jogoId, estadioId);
    }
}

async function acaoColarLive(jogoId, estadioId, timeId) {
    const novoItem = await colarItem(dados, 'live', { jogoId, estadioId, timeId });
    if (novoItem) {
        salvarDados();
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    }
}

async function acaoColarDiv(jogoId, estadioId, timeId, liveId) {
    const novoItem = await colarItem(dados, 'div', { jogoId, estadioId, timeId, liveId });
    if (novoItem) {
        salvarDados();
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    }
}

async function acaoColarCard(jogoId, estadioId, timeId, liveId, divId) {
    const novoItem = await colarItem(dados, 'card', { jogoId, estadioId, timeId, liveId, divId });
    if (novoItem) {
        salvarDados();
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    }
}
/////////////
/////////////
/////////////

async function acaoCopiarJogo(jogoId) {
    const jogo = encontrarJogo(dados, jogoId);
    
    // Verifica se o usuário tem permissão para copiar
    if (!usuarioPodeEditarItem(jogo)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para copiar este jogo!', 'erro');
        }
        console.warn("❌ Tentativa de cópia sem permissão");
        return;
    }
    
    copiarItem('jogo', jogo);
  await  carregarJogos();
}
function acaoCopiarEstadio(jogoId, estadioId) {
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    
    // Verifica se o usuário tem permissão para copiar
    if (!usuarioPodeEditarItem(estadio)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para copiar este estádio!', 'erro');
        }
        console.warn("❌ Tentativa de cópia sem permissão");
        return;
    }
    
    copiarItem('estadio', estadio);
    
    // Força o refresh da interface após um pequeno delay
    setTimeout(() => {
        carregarEstadiosDoJogo(jogoId);
    }, 100);
}
function acaoCopiarTime(jogoId, estadioId, timeId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    
    // Verifica se o usuário tem permissão para copiar
    if (!usuarioPodeEditarItem(time)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para copiar este time!', 'erro');
        }
        console.warn("❌ Tentativa de cópia sem permissão");
        return;
    }
    
    copiarItem('time', time);
    
    // Força o refresh da interface após um pequeno delay
    setTimeout(() => {
        carregarTimesDoEstadio(jogoId, estadioId);
    }, 100);
}
function acaoCopiarLive(jogoId, estadioId, timeId, liveId) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    copiarItem('live', live);
    carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
}
function acaoCopiarDiv(jogoId, estadioId, timeId, liveId, divId) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    copiarItem('div', div);
    
    // Força o refresh da interface após um pequeno delay
    setTimeout(() => {
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    }, 100);
}
function acaoCopiarCard(jogoId, estadioId, timeId, liveId, divId, cardId) {
    const card = encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
    copiarItem('card', card);
    
    // Força o refresh da interface após um pequeno delay
    setTimeout(() => {
        carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
    }, 100);
}

