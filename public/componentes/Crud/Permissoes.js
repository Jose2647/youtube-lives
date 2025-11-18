
// ADICIONE esta função se não existir no arquivo:
function usuarioPodeEditarItem(item) {
    if (!window.usuarioLogado) {
        console.log("❌ Usuário não logado - sem permissão");
        return false;
    }
    
    const ehCriador = item.creatorId === window.usuarioLogado.id;
    console.log(`🔐 Verificação de permissão: 
        - Usuário logado ID: ${window.usuarioLogado.id}
        - Item creatorId: ${item.creatorId}
        - Pode editar: ${ehCriador ? 'SIM' : 'NÃO'}`);
    
    return ehCriador;
}

function usuarioPodeEditarItem(item) {
    if (!window.usuarioLogado) {
        console.log("❌ Usuário não logado - sem permissão");
        return false;
    }
    
    const ehCriador = item.creatorId === window.usuarioLogado.id;
    console.log(`🔐 Verificação de permissão: 
        - Usuário logado ID: ${window.usuarioLogado.id}
        - Item creatorId: ${item.creatorId}
        - Pode editar: ${ehCriador ? 'SIM' : 'NÃO'}`);
    
    return ehCriador;
}
function obterUsuarioLogadoInfo() {
    if (!window.usuarioLogado) {
        return { id: null, nome: "Anônimo", email: null };
    }
    
    return {
        id: window.usuarioLogado.id,
        nome: window.usuarioLogado.nome,
        email: window.usuarioLogado.email
    };
}
// Adicione ao seu painel de debug
function testarSistemaPermissoes() {
    console.log("🔐 SISTEMA DE PERMISSÕES - TESTE");
    console.log("- Usuário logado:", obterUsuarioLogadoInfo());
    
    // Verifica alguns cards existentes
    if (window.dados && window.dados.jogos && window.dados.jogos[0]) {
        const primeiroJogo = window.dados.jogos[0];
        if (primeiroJogo.estadios && primeiroJogo.estadios[0]) {
            const primeiroEstadio = primeiroJogo.estadios[0];
            if (primeiroEstadio.times && primeiroEstadio.times[0]) {
                const primeiroTime = primeiroEstadio.times[0];
                if (primeiroTime.lives && primeiroTime.lives[0]) {
                    const primeiraLive = primeiroTime.lives[0];
                    if (primeiraLive.divsHorizontais && primeiraLive.divsHorizontais[0]) {
                        const primeiraDiv = primeiraLive.divsHorizontais[0];
                        if (primeiraDiv.cards && primeiraDiv.cards[0]) {
                            const primeiroCard = primeiraDiv.cards[0];
                            console.log("- Primeiro card:", primeiroCard);
                            console.log("- Posso editar?", usuarioPodeEditarItem(primeiroCard));
                        }
                    }
                }
            }
        }
    }
}
