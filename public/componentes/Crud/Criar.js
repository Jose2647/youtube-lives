// ===== BACKEND CALLS PARA TODOS OS TIPOS =====
async function criarJogoBackend(novoJogo) {
    try {
        console.log("📤 Enviando jogo para backend - DETALHES:", {
            id: novoJogo.id,
            nome: novoJogo.nome,
            creatorId: novoJogo.creatorId,
            temSenha: !!novoJogo.senha,
            senha: novoJogo.senha ? `Hash: ${novoJogo.senha.substring(0, 20)}...` : 'NÃO TEM',
            camposEnviados: Object.keys(novoJogo)
        });
        
        const response = await fetch(`${API_BASE}/api/jogo`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novoJogo)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend:', {
                status: response.status,
                statusText: response.statusText,
                erro: errorData
            });
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Jogo criado no backend com sucesso:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro completo ao criar jogo:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação do jogo: ' + error.message, 'erro');
        throw error;
    }
}
// Create estadio on backend
async function criarEstadioBackend(novoEstadio) {
    try {
        console.log("📤 Enviando estádio para backend:", {
            id: novoEstadio.id,
            nome: novoEstadio.nome,
            jogoId: novoEstadio.jogoId,
            creatorId: novoEstadio.creatorId,
            temSenha: !!novoEstadio.senha
        });

        const response = await fetch(`${API_BASE}/api/estadio`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novoEstadio)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend (estádio):', errorData);
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Estádio criado no backend:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar estádio no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação do estádio.', 'erro');
        throw error;
    }
}
// Create time on backend
async function criarTimeBackend(novoTime) {
    try {
        console.log("📤 Enviando time para backend:", {
            id: novoTime.id,
            nome: novoTime.nome,
            estadioId: novoTime.estadioId,
            creatorId: novoTime.creatorId,
            temSenha: !!novoTime.senha
        });

        const response = await fetch(`${API_BASE}/api/time`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novoTime)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend (time):', errorData);
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Time criado no backend:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar time no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação do time.', 'erro');
        throw error;
    }
}
// Create live on backend
async function criarLiveBackend(novaLive) {
    try {
        console.log("📤 Enviando live para backend:", {
            id: novaLive.id,
            titulo: novaLive.titulo,
            timeId: novaLive.timeId,
            creatorId: novaLive.creatorId,
            temSenha: !!novaLive.senha
        });

        const response = await fetch(`${API_BASE}/api/live`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novaLive)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend (live):', errorData);
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Live criada no backend:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar live no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação da live.', 'erro');
        throw error;
    }
}
// Create div on backend
async function criarDivBackend(novaDiv) {
    try {
        console.log("📤 Enviando div para backend:", {
            id: novaDiv.id,
            titulo: novaDiv.titulo,
            liveId: novaDiv.liveId,
            creatorId: novaDiv.creatorId,
            temSenha: !!novaDiv.senha
        });

        const response = await fetch(`${API_BASE}/api/div`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novaDiv)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend (div):', errorData);
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Div criada no backend:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar div no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação da div.', 'erro');
        throw error;
    }
}
// Create card on backend
async function criarCardBackend(novoCard) {
    try {
        console.log("📤 Enviando card para backend:", {
            id: novoCard.id,
            titulo: novoCard.titulo,
            divHorizontalId: novoCard.divHorizontalId,
            creatorId: novoCard.creatorId,
            temSenha: !!novoCard.senha
        });

        const response = await fetch(`${API_BASE}/api/card`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(novoCard)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro detalhado do backend (card):', errorData);
            throw new Error(`Erro ${response.status}: ${errorData.msg || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Card criado no backend:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar card no backend:', error);
        mostrarNotificacao && mostrarNotificacao('Erro ao sincronizar criação do card.', 'erro');
        throw error;
    }
}


// ===== FUNÇÃO AUXILIAR PARA OBTER HEADERS =====

function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Pega o token do usuário logado
    if (window.usuarioLogado && window.usuarioLogado.token) {
        headers['Authorization'] = `Bearer ${window.usuarioLogado.token}`;
        console.log("🔐 Token incluído nos headers");
    } else {
        console.warn("⚠️ Nenhum token encontrado - requisição sem autenticação");
    }
    
    return headers;
}







