function atualizarItem(item, novosDados) {
    if (!item) {
        console.error('Tentativa de atualizar item nulo.');
        return false;
    }
    // Object.assign mescla os novos dados no item existente
    // Remove o ID dos novosDados para evitar sobrescrever o ID original
    if (novosDados.id) {
        delete novosDados.id;
    }
    Object.assign(item, novosDados);
    return true;
}



function atualizarJogo(dados, jogoId, novosDados) {
    const jogo = encontrarJogo(dados, jogoId);
    return atualizarItem(jogo, novosDados);
}
function atualizarEstadio(dados, jogoId, estadioId, novosDados) {
    // Busca o estádio usando a função auxiliar que já existe no seu projeto
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    // Usa a função genérica para mesclar os dados
    return atualizarItem(estadio, novosDados);
}

function atualizarTime(dados, jogoId, estadioId, timeId, novosDados) {
    // Busca o time usando a hierarquia correta
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    return atualizarItem(time, novosDados);
}

function atualizarLive(dados, jogoId, estadioId, timeId, liveId, novosDados) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    return atualizarItem(live, novosDados);
}
function atualizarDiv(dados, jogoId, estadioId, timeId, liveId, divId, novosDados) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    return atualizarItem(div, novosDados);
}
function atualizarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId, novosDados) {
    const card = encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
    return atualizarItem(card, novosDados);
}


async function acaoEditarJogo(jogoId) {
    const jogo = encontrarJogo(dados, jogoId);
    if (!jogo) return alert('Jogo não encontrado');

    if (!usuarioPodeEditarItem(jogo)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar este jogo!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    abrirModalEdicao('Editar Jogo', [
        { label: 'Nome do Jogo', id: 'nome', value: jogo.nome },
        { label: 'URL do Iframe (YouTube)', id: 'iframeUrl', value: jogo.iframeUrl, type: 'url', placeholder: 'https://youtube.com/live/...' }
    ], async (valores) => {
        try {
            jogo.nome = valores.nome;
            jogo.iframeUrl = valores.iframeUrl;
            
            salvarDados();
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                await atualizarJogoBackend(jogoId, {
                    nome: valores.nome,
                    iframeUrl: valores.iframeUrl
                });
            }
            
            await carregarJogos();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar jogo:', error);
        }
    }, {
        item: jogo,
        origemTipo: 'Jogo', 
        origemId: jogoId
    });
}
async function acaoEditarEstadio(jogoId, estadioId) {
    console.log("🔍 DEBUG acaoEditarEstadio - Parâmetros:", { jogoId, estadioId });
    
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    if (!estadio) {
        console.error("❌ Estádio não encontrado:", { jogoId, estadioId });
        return alert('Estádio não encontrado');
    }

    if (!usuarioPodeEditarItem(estadio)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar este estádio!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    const idEstadioValido = estadioId || estadio.id;

    abrirModalEdicao('Editar Estádio', [
        { label: 'Nome do Estádio', id: 'nome', value: estadio.nome, required: true },
        { label: 'URL do Iframe (YouTube)', id: 'iframeUrl', value: estadio.iframeUrl, type: 'url', placeholder: 'https://youtube.com/live/...' }
    ], async (valores) => {
        try {
            estadio.nome = valores.nome;
            estadio.iframeUrl = valores.iframeUrl;
            
            salvarDados();
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                await atualizarEstadioBackend(idEstadioValido, {
                    nome: valores.nome,
                    iframeUrl: valores.iframeUrl
                });
            }
            
            carregarEstadiosDoJogo(jogoId);
            
        } catch (error) {
            console.error('❌ Erro ao atualizar estádio:', error);
        }
    }, {
        item: estadio,
        origemTipo: 'Estadio', 
        origemId: idEstadioValido,
        jogoId: jogoId
    });
}
async function acaoEditarTime(jogoId, estadioId, timeId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    if (!time) return alert('Time não encontrado');

    if (!usuarioPodeEditarItem(time)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar este time!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    abrirModalEdicao('Editar Time', [
        { label: 'Nome do Time', id: 'nome', value: time.nome },
        { label: 'URL do Iframe (YouTube)', id: 'iframeUrl', value: time.iframeUrl, type: 'url', placeholder: 'https://youtube.com/live/...' }
    ], async (valores) => {
        try {
            time.nome = valores.nome;
            time.iframeUrl = valores.iframeUrl;
            
            salvarDados();
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                await atualizarTimeBackend(timeId, {
                    nome: valores.nome,
                    iframeUrl: valores.iframeUrl
                });
            }
            
            carregarTimesDoEstadio(jogoId, estadioId);
            
        } catch (error) {
            console.error('❌ Erro ao atualizar time:', error);
        }
    }, {
        item: time,
        origemTipo: 'Time', 
        origemId: timeId,
        jogoId: jogoId,
        estadioId: estadioId
    });
}
async function acaoEditarLive(jogoId, estadioId, timeId, liveId) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    if (!live) return alert('Live não encontrada');

    if (!usuarioPodeEditarItem(live)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar esta live!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    abrirModalEdicao('Editar Live', [
        { label: 'Título da Live', id: 'titulo', value: live.titulo },
        { label: 'Descrição', id: 'descricao', value: live.descricao },
        { label: 'URL do Iframe (YouTube)', id: 'iframeUrl', value: live.iframeUrl, type: 'url', placeholder: 'https://youtube.com/live/...' }
    ], async (valores) => {
        try {
            live.titulo = valores.titulo;
            live.descricao = valores.descricao;
            live.iframeUrl = valores.iframeUrl;
            
            salvarDados();
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                await atualizarLiveBackend(liveId, {
                    titulo: valores.titulo,
                    descricao: valores.descricao,
                    iframeUrl: valores.iframeUrl
                });
            }
            
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            
        } catch (error) {
            console.error('❌ Erro ao atualizar live:', error);
        }
    }, {
        item: live,
        origemTipo: 'Live', 
        origemId: liveId,
        jogoId: jogoId,
        estadioId: estadioId,
        timeId: timeId
    });
}
async function acaoEditarDiv(jogoId, estadioId, timeId, liveId, divId) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    if (!div) return alert('Div não encontrada');

    if (!usuarioPodeEditarItem(div)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar esta div!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    abrirModalEdicao('Editar Div', [
        { label: 'Título da Div', id: 'titulo', value: div.titulo },
        { label: 'Tamanho', id: 'tamanho', value: div.tamanho }
    ], async (valores) => {
        try {
            div.titulo = valores.titulo;
            div.tamanho = valores.tamanho;
            
            salvarDados();
            
            // Sincroniza com backend
            if (window.usuarioLogado) {
                await atualizarDivBackend(divId, {
                    titulo: valores.titulo,
                    tamanho: valores.tamanho
                });
            }
            
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            
        } catch (error) {
            console.error('❌ Erro ao atualizar div:', error);
        }
    }, {
        item: div,
        origemTipo: 'Div', 
        origemId: divId,
        jogoId: jogoId,
        estadioId: estadioId,
        timeId: timeId,
        liveId: liveId
    });
}
async function acaoEditarCard(jogoId, estadioId, timeId, liveId, divId, cardId) {
    const card = encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
    if (!card) return alert('Card não encontrado');

    if (!usuarioPodeEditarItem(card)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para editar este card!', 'erro');
        }
        console.warn("❌ Tentativa de edição sem permissão");
        return;
    }

    const contextoDoItem = {
        item: card,
        origemTipo: 'Card',
        origemId: card.id,
        jogoId: jogoId,
        estadioId: estadioId,
        timeId: timeId,
        liveId: liveId,
        divId: divId
    };

    abrirModalEdicao(
        'Editar Card', 
        [
            { label: 'Título do Card', id: 'titulo', value: card.titulo },
            { label: 'URL do Iframe (YouTube)', id: 'iframeUrl', value: card.iframeUrl, type: 'url', placeholder: 'https://youtube.com/live/...' }
        ], 
        async (valores) => {
            try {
                card.titulo = valores.titulo;
                card.iframeUrl = valores.iframeUrl;
                
                salvarDados();
                
                // Sincroniza com backend
                if (window.usuarioLogado) {
                    await atualizarCardBackend(cardId, {
                        titulo: valores.titulo,
                        iframeUrl: valores.iframeUrl
                    });
                }
                
                carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
                
            } catch (error) {
                console.error('❌ Erro ao atualizar card:', error);
            }
        },
        contextoDoItem
    );
}







//////////////
//////////////
//////////////
//////////////
//////////////


// ===== FUNÇÕES DE ATUALIZAÇÃO =====
// Update game on backend (backend checks ownership AND password)
async function atualizarJogoBackend(jogoId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/jogo/${jogoId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha // ← ADICIONA SENHA NO BODY
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar jogo no backend');
        }
        
        const result = await response.json();
        console.log('✅ Jogo atualizado no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar jogo no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar atualização do jogo. Verifique permissões.', 'erro');
        throw error;
    }
}
// Update estadio on backend
async function atualizarEstadioBackend(estadioId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/estadio/${estadioId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar estádio no backend');
        }
        
        const result = await response.json();
        console.log('✅ Estádio atualizado no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar estádio no backend:', error);
        throw error;
    }
}
// Update time on backend
async function atualizarTimeBackend(timeId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/time/${timeId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar time no backend');
        }
        
        const result = await response.json();
        console.log('✅ Time atualizado no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar time no backend:', error);
        throw error;
    }
}
// Update live on backend
async function atualizarLiveBackend(liveId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/live/${liveId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar live no backend');
        }
        
        const result = await response.json();
        console.log('✅ Live atualizada no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar live no backend:', error);
        throw error;
    }
}
// Update div on backend
async function atualizarDivBackend(divId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/div/${divId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar div no backend');
        }
        
        const result = await response.json();
        console.log('✅ Div atualizada no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar div no backend:', error);
        throw error;
    }
}
// Update card on backend
async function atualizarCardBackend(cardId, updatedFields) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/card/${cardId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...updatedFields,
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao atualizar card no backend');
        }
        
        const result = await response.json();
        console.log('✅ Card atualizado no backend:', result);
    } catch (error) {
        console.error('❌ Erro ao atualizar card no backend:', error);
        throw error;
    }
}
