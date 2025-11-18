async function acaoExcluirJogo(jogoId) {
    console.log(`🗑️ Tentativa de excluir jogo ID: ${jogoId}`);
    
    const jogo = encontrarJogo(dados, jogoId);
    if (!jogo) {
        console.error(`❌ Jogo não encontrado: ${jogoId}`);
        return alert('Jogo não encontrado');
    }

    // Verifica se o usuário tem permissão para excluir
    if (!usuarioPodeEditarItem(jogo)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para excluir este jogo!', 'erro');
        }
        console.warn("❌ Tentativa de exclusão sem permissão");
        return;
    }

    // Verifica se o usuário está logado e tem senha
    if (!window.usuarioLogado || !window.usuarioLogado.senha) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Erro: usuário não autenticado ou sem senha.', 'erro');
        }
        console.error("❌ Usuário não logado ou sem senha para exclusão");
        return;
    }

    if (confirm('Tem certeza que deseja excluir este Jogo? ISSO APAGA TUDO DENTRO DELE.')) {
        console.log(`✅ Excluindo jogo: ${jogo.nome} (ID: ${jogoId})`);
        
        try {
            // Remove localmente
            const sucesso = excluirJogo(dados, jogoId);
            
            if (sucesso) {
                salvarDados();
                console.log(`✅ Jogo ${jogoId} excluído localmente`);
                
                // Tenta excluir no backend
                await excluirJogoBackend(jogoId);
                console.log(`✅ Jogo ${jogoId} excluído no backend`);
                
                // Atualiza a interface
                if (typeof carregarJogos === 'function') {
                    await carregarJogos();
                    console.log(`✅ Interface atualizada após exclusão`);
                }
                
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao('Jogo excluído!', 'sucesso');
                }
            }
        } catch (error) {
            console.error(`❌ Erro durante exclusão do jogo ${jogoId}:`, error);
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Erro ao excluir jogo no servidor.', 'erro');
            }
        }
    }
}
function acaoExcluirEstadio(jogoId, estadioId) {
    console.log(`🗑️ Tentativa de excluir estádio ID: ${estadioId}`);
    
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    if (!estadio) return alert('Estádio não encontrado');

    // Verifica permissão
    if (!usuarioPodeEditarItem(estadio)) {
        mostrarNotificacao && mostrarNotificacao('Você não tem permissão para excluir este estádio!', 'erro');
        console.warn("❌ Tentativa de exclusão sem permissão");
        return;
    }

    if (confirm('Tem certeza que deseja excluir este Estádio? ISSO APAGA TUDO DENTRO DELE.')) {
        
        // 1. Remove localmente (usando sua função)
        const sucesso = excluirEstadio(dados, jogoId, estadioId);
        
        if (sucesso) {
            // 2. Salva estado local (sem o estádio)
            salvarDados();
            console.log(`✅ Estádio ${estadioId} excluído localmente`);
            
            // 3. Tenta excluir no backend (ESTA PARTE ESTAVA FALTANDO)
            if (window.usuarioLogado) {
                excluirEstadioBackend(estadioId).catch(err => {
                    console.error(`Falha grave ao excluir estádio ${estadioId} no backend:`, err);
                    // Aqui você poderia reverter a exclusão local ou notificar o usuário
                });
            }
            
            // 4. Atualiza a interface
            carregarEstadiosDoJogo(jogoId); // Recarrega a visão de estádios
            mostrarNotificacao && mostrarNotificacao('Estádio excluído!', 'sucesso');
        }
    }
}
async function acaoExcluirTime(jogoId, estadioId, timeId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    if (!time) return alert('Time não encontrado');

    // Verifica se o usuário tem permissão para excluir
    if (!usuarioPodeEditarItem(time)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para excluir este time!', 'erro');
        }
        console.warn("❌ Tentativa de exclusão sem permissão");
        return;
    }

    if (confirm('Tem certeza que deseja excluir este Time?')) {
        
        // 1. Remove localmente
        const sucesso = excluirTime(dados, jogoId, estadioId, timeId);
        
        if (sucesso) {
            // 2. Salva estado local
            salvarDados();
            console.log(`✅ Time ${timeId} excluído localmente`);

            // 3. Tenta excluir no backend (ISSO ESTAVA FALTANDO)
            if (window.usuarioLogado) {
                try {
                    await excluirTimeBackend(timeId);
                    console.log(`✅ Time ${timeId} excluído no backend`);
                } catch (err) {
                    console.error(`Falha ao excluir time ${timeId} no backend:`, err);
                    mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar exclusão com o servidor.', 'erro');
                }
            }

            // 4. Atualiza a interface
            carregarTimesDoEstadio(jogoId, estadioId);
            
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Time excluído!', 'sucesso');
            }
        }
    }
}
function acaoExcluirLive(jogoId, estadioId, timeId, liveId) {
    console.log(`🗑️ Tentativa de excluir live ID: ${liveId}`);
    
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    if (!live) return alert('Live não encontrada');

    // Verifica permissão
    if (!usuarioPodeEditarItem(live)) {
        mostrarNotificacao && mostrarNotificacao('Você não tem permissão para excluir esta live!', 'erro');
        return;
    }

    if (confirm('Tem certeza que deseja excluir esta Live? ISSO APAGA TUDO DENTRO DELA.')) {
        
        // 1. Remove localmente (usando sua função)
        const sucesso = excluirLive(dados, jogoId, estadioId, timeId, liveId);
        
        if (sucesso) {
            // 2. Salva estado local (sem a live)
            salvarDados();
            console.log(`✅ Live ${liveId} excluída localmente`);
            
            // 3. Tenta excluir no backend
            if (window.usuarioLogado) {
                excluirLiveBackend(liveId).catch(err => {
                    console.error(`Falha grave ao excluir live ${liveId} no backend:`, err);
                });
            }
            
            // 4. Atualiza a interface (recarregando o time)
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            mostrarNotificacao && mostrarNotificacao('Live excluída!', 'sucesso');
        }
    }
}
function acaoExcluirDiv(jogoId, estadioId, timeId, liveId, divId) {
    console.log(`🗑️ Tentativa de excluir div ID: ${divId}`);
    
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    if (!div) return alert('Div não encontrada');

    // Verifica permissão
    if (!usuarioPodeEditarItem(div)) {
        mostrarNotificacao && mostrarNotificacao('Você não tem permissão para excluir esta div!', 'erro');
        return;
    }

    if (confirm('Tem certeza que deseja excluir esta Div (linha horizontal)? ISSO APAGA TODOS OS CARDS DENTRO DELA.')) {
        
        // 1. Remove localmente (usando sua função)
        const sucesso = excluirDiv(dados, jogoId, estadioId, timeId, liveId, divId);
        
        if (sucesso) {
            // 2. Salva estado local
            salvarDados();
            console.log(`✅ Div ${divId} excluída localmente`);
            
            // 3. Tenta excluir no backend
            if (window.usuarioLogado) {
                excluirDivBackend(divId).catch(err => {
                    console.error(`Falha grave ao excluir div ${divId} no backend:`, err);
                });
            }
            
            // 4. Atualiza a interface (recarregando o time)
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            mostrarNotificacao && mostrarNotificacao('Div excluída!', 'sucesso');
        }
    }
}
async function acaoExcluirCard(jogoId, estadioId, timeId, liveId, divId, cardId) {
    const card = encontrarCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
    if (!card) return alert('Card não encontrado');

    // Verifica se o usuário tem permissão para excluir
    if (!usuarioPodeEditarItem(card)) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Você não tem permissão para excluir este card!', 'erro');
        }
        console.warn("❌ Tentativa de exclusão sem permissão");
        return;
    }

    if (confirm('Tem certeza que deseja excluir este Card?')) {
        
        // 1. Remove localmente
        const sucesso = excluirCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId);
        
        if (sucesso) {
            // 2. Salva no localStorage
            salvarDados();
            console.log(`✅ Card ${cardId} excluído localmente`);

            // 3. Tenta excluir no backend (ADICIONADO AQUI)
            if (window.usuarioLogado) {
                try {
                    await excluirCardBackend(cardId);
                    console.log(`✅ Card ${cardId} excluído no backend`);
                } catch (err) {
                    console.error(`Falha ao excluir card ${cardId} no backend:`, err);
                    // Não interrompe o fluxo visual, mas loga o erro
                }
            }

            // 4. Atualiza a interface
            carregarEstruturaTimeComDados(jogoId, estadioId, timeId);
            
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Card excluído!', 'sucesso');
            }
        }
    }
}



function excluirJogo(dados, jogoId) {
    dados.jogos = dados.jogos.filter(j => j.id !== jogoId);
    return true;
}
function excluirEstadio(dados, jogoId, estadioId) {
    const jogo = encontrarJogo(dados, jogoId);
    if (!jogo) return false;
    jogo.estadios = jogo.estadios.filter(e => e.id !== estadioId);
    return true;
}
function excluirTime(dados, jogoId, estadioId, timeId) {
    const estadio = encontrarEstadio(dados, jogoId, estadioId);
    if (!estadio) return false;
    estadio.times = estadio.times.filter(t => t.id !== timeId);
    return true;
}
function excluirLive(dados, jogoId, estadioId, timeId, liveId) {
    const time = encontrarTime(dados, jogoId, estadioId, timeId);
    if (!time) return false;
    time.lives = time.lives.filter(l => l.id !== liveId);
    return true;
}
function excluirDiv(dados, jogoId, estadioId, timeId, liveId, divId) {
    const live = encontrarLive(dados, jogoId, estadioId, timeId, liveId);
    if (!live) return false;
    live.divsHorizontais = live.divsHorizontais.filter(d => d.id !== divId);
    return true;
}
function excluirCard(dados, jogoId, estadioId, timeId, liveId, divId, cardId) {
    const div = encontrarDiv(dados, jogoId, estadioId, timeId, liveId, divId);
    if (!div) return false;
    div.cards = div.cards.filter(c => c.id !== cardId);
    return true;
}


async function excluirJogoBackend(jogoId) {
    try {
        // Verifica se o usuário está logado e tem senha
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/jogo/${jogoId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha // ← ENVIA A SENHA DO USUÁRIO
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir jogo no backend');
        }
        
        console.log('✅ Jogo excluído no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir jogo no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar exclusão do jogo. Verifique permissões.', 'erro');
        throw error;
    }
}
async function excluirEstadioBackend(estadioId) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/estadio/${estadioId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir estádio no backend');
        }
        
        console.log('✅ Estádio excluído no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir estádio no backend:', error);
        throw error;
    }
}
async function excluirTimeBackend(timeId) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/time/${timeId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir time no backend');
        }
        
        console.log('✅ Time excluído no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir time no backend:', error);
        throw error;
    }
}
async function excluirLiveBackend(liveId) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/live/${liveId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir live no backend');
        }
        
        console.log('✅ Live excluída no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir live no backend:', error);
        throw error;
    }
}
async function excluirDivBackend(divId) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/div/${divId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir div no backend');
        }
        
        console.log('✅ Div excluída no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir div no backend:', error);
        throw error;
    }
}
async function excluirCardBackend(cardId) {
    try {
        if (!window.usuarioLogado || !window.usuarioLogado.senha) {
            throw new Error('Usuário não logado ou sem senha');
        }

        const response = await fetch(`${API_BASE}/api/card/${cardId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: window.usuarioLogado.senha
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao excluir card no backend');
        }
        
        console.log('✅ Card excluído no backend');
    } catch (error) {
        console.error('❌ Erro ao excluir card no backend:', error);
        throw error;
    }
}
