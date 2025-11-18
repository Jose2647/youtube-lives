// social.js - VERSÃO CORRIGIDA
function adicionarAmigo(usuarioAlvo) {
    if (!window.usuarioLogado) {
        alert("Faça login primeiro!");
        return;
    }
    
    if (usuarioAlvo === window.usuarioLogado.nome) {
        alert("Você não pode adicionar a si mesmo!");
        return;
    }
    
    if (!window.usuarioLogado.amigos) window.usuarioLogado.amigos = [];
    
    if (window.usuarioLogado.amigos.includes(usuarioAlvo)) {
        alert("Você já é amigo deste usuário!");
        return;
    }
    
    window.usuarioLogado.amigos.push(usuarioAlvo);
    adicionarNotificacao("Novo amigo!", `Você e ${usuarioAlvo} agora são amigos!`, 'sucesso');
    alert(`Agora você é amigo de ${usuarioAlvo}!`);
}
function verAmigos() {
    if (!window.usuarioLogado) {
        alert("Faça login primeiro!");
        return;
    }
    
    if (!window.usuarioLogado.amigos || window.usuarioLogado.amigos.length === 0) {
        alert("Você não tem amigos adicionados");
        return;
    }
    
    let lista = "=== SEUS AMIGOS ===\n\n";
    window.usuarioLogado.amigos.forEach((amigo, index) => {
        const usuario = dados.usuarios.find(u => u.nome === amigo);
        if (usuario) {
            lista += `👤 ${usuario.nome}\n`;
            lista += `Mérito: ${usuario.merito}\n`;
            lista += `[Desafiar - digite 'd ${index}'] [Ver Perfil - 'v ${index}']\n\n`;
        }
    });
    
    lista += "\nComandos: 'd [número]' - desafiar amigo | 'v [número]' - ver perfil";
    const comando = prompt(lista);
    
    if (comando) {
        if (comando.startsWith('d ')) {
            const index = parseInt(comando.split(' ')[1]);
            if (!isNaN(index) && index >= 0 && index < window.usuarioLogado.amigos.length) {
                desafiarAmigo(window.usuarioLogado.amigos[index]);
            }
        } else if (comando.startsWith('v ')) {
            const index = parseInt(comando.split(' ')[1]);
            if (!isNaN(index) && index >= 0 && index < window.usuarioLogado.amigos.length) {
                verPerfilAmigo(window.usuarioLogado.amigos[index]);
            }
        }
    }
}
function desafiarAmigo(nomeAmigo) {
    alert(`Funcionalidade de desafio para ${nomeAmigo} em desenvolvimento...`);
    // Implementar lógica de desafio entre amigos
}
function verPerfilAmigo(nomeAmigo) {
    const amigo = dados.usuarios.find(u => u.nome === nomeAmigo);
    if (!amigo) {
        alert("Amigo não encontrado!");
        return;
    }
    
    let perfil = `=== PERFIL DE ${amigo.nome} ===\n\n`;
    perfil += `Mérito: ${amigo.merito} pontos\n`;
    perfil += `Desafios cumpridos: ${amigo.desafiosCumpridos || 0}\n`;
    perfil += `Pagamentos realizados: ${amigo.pagamentosRealizados || 0}\n`;
    
    alert(perfil);
}
// ===== FUNÇÕES AUXILIARES =====
function encontrarStreamerGlobal(usuario, senha) {
    for (const jogo of dados.jogos) {
        for (const estadio of jogo.estadios) {
            for (const time of estadio.times) {
                if (time.lives) {
                    for (const live of time.lives) {
                        if (live.streamers) {
                            const streamer = live.streamers.find(s => 
                                s.usuario === usuario && s.senha === senha
                            );
                            if (streamer) return streamer;
                        }
                    }
                }
            }
        }
    }
    return null;
}
function criarLiveParaStreamer(nomeStreamer, usuario, streamer) {
    const jogo = dados.jogos[0];
    const estadio = jogo.estadios[0];
    const time = estadio.times[0];
    
    const novaLive = {
        id: Date.now(),
        titulo: `Live de ${nomeStreamer}`,
        descricao: "Nova live criada automaticamente",
        status: "ativa",
        imagem: "default-live.png",
        criador: usuario,
        cards: [],
        streamers: [streamer],
        usuariosOnline: [],
        dataCriacao: new Date().toLocaleString()
    };
    
    if (!time.lives) time.lives = [];
    time.lives.push(novaLive);
    
    return novaLive;
}