
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

    fetch(`${API_BASE}/api/generate-invite`, {
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

// REMOVA as funções compartilharJogo e compartilharAppSintonizadaJogo
// E SUBSTITUA por esta:

/**
 * Gera um link de convite para um local específico no app (jogo, estádio, time, etc.)
 * @param {object} ids - Um objeto contendo os IDs. Ex: { jogoId: 1, estadioId: 2 }
 * @param {boolean} sync - Se deve ser um link sincronizado.
 */

function compartilharLocal(ids = {}, sync = false) {
    if (!window.usuarioLogado || !window.usuarioLogado.token) {
        alert('Você precisa estar logado para gerar um link de compartilhamento.');
        return;
    }

    const body = { ...ids, sync };

    fetch(`${API_BASE}/api/generate-invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.usuarioLogado.token}`
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        let shareUrl;
        
        if (data.inviteCode) {
            // Use a URL do invite que redireciona para a aplicação principal
            shareUrl = `${window.location.origin}/invite/${data.inviteCode}`;
        } else if (data.inviteLink) {
            shareUrl = data.inviteLink;
        } else {
            throw new Error('Resposta inválida do servidor');
        }

        // Compartilhar ou copiar
        if (navigator.share) {
            navigator.share({
                title: sync ? 'App Sincronizada' : 'Compartilhar Localização',
                text: sync ? 'Junte-se a mim no jogo!' : 'Confira esta localização!',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao('Link copiado!', 'sucesso');
                }
            });
        }
    })
    .catch(err => {
        console.error('Erro ao compartilhar:', err);
        alert('Erro ao gerar link de compartilhamento.');
    });
}