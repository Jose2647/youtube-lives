
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

        // Dentro do .then(data => { ... }) depois de montar o shareUrl
/*

const shareUrl = data.inviteCode 
    ? `${window.location.origin}/invite/${data.inviteCode}`
    : data.inviteLink;
*/
const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://youtube-lives.onrender.com';

let shareUrl = data.inviteLink || `${baseUrl}/invite/${data.inviteCode}`;
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