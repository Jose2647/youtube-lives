// ===== SISTEMA DE RANKING CORRIGIDO =====
function exibirRanking() {
    const { modal, content, overlay } = criarModalBase('modal-ranking', '600px');

    // Calcula ranking
    const ranking = [...dados.usuarios]
        .sort((a, b) => (b.merito || 0) - (a.merito || 0))
        .slice(0, 20);

    let rankingHTML = `
        <div class="modal-header gradient-purple">
            <h2 class="modal-title">🏆 RANKING DE USUÁRIOS</h2>
        </div>
        <div class="modal-body">
    `;

    ranking.forEach((usuario, index) => {
        const posicao = index + 1;
        const trofeu = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}°`;
        const isCurrentUser = window.usuarioLogado && usuario.usuario === window.usuarioLogado.usuario;
        
        rankingHTML += `
            <div class="ranking-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="ranking-posicao">${trofeu}</div>
                <img src="${usuario.imagem || 'default-usuario.png'}" class="ranking-imagem">
                <div class="ranking-info">
                    <strong>${usuario.nome}</strong>
                    ${isCurrentUser ? '<span class="current-user-tag">(Você)</span>' : ''}
                    <div class="ranking-subinfo">
                        @${usuario.usuario} | Desafios: ${usuario.desafiosCumpridos || 0} | Amigos: ${usuario.amigos?.length || 0}
                    </div>
                </div>
                <div class="ranking-merito">
                    <div class="ranking-pontos">${usuario.merito || 0} pts</div>
                    <div class="ranking-label-merito">Mérito</div>
                </div>
            </div>
        `;
    });

    rankingHTML += `
        </div>
        <div class="modal-footer">
         <!--   <button class="modal-btn-fechar" onclick="fecharModal(this.closest('.modal-custom'))">
                Fechar Ranking
            </button> -->
            <button class="modal-btn-fechar" onclick="fecharModalCompleto(this)">
    Fechar Ranking
</button>

        </div>
    `;
    
    content.innerHTML = rankingHTML;
    modal.appendChild(content);
    document.body.appendChild(modal);
    document.body.appendChild(overlay);

    vincularFechamentoModal(modal, overlay);
}
// ===== RANKING POR CATEGORIA CORRIGIDO =====
function exibirRankingCategoria(categoria) {
    const { modal, content, overlay } = criarModalBase('modal-ranking-categoria', '500px');

    let ranking = [];
    let titulo = '';
    let classeGradiente = '';

    switch(categoria) {
        case 'apostas':
            titulo = '🎯 MESTRES DAS APOSTAS';
            classeGradiente = 'gradient-green';
            break;
        case 'desafios':
            titulo = '💪 DESAFIADORES SUPREMOS';
            classeGradiente = 'gradient-orange';
            break;
        case 'streamers':
            titulo = '🎥 STREAMERS POPULARES';
            classeGradiente = 'gradient-pink';
            ranking = [...(dados.usuarios.filter(u => u.role === 'streamer') || [])]
                .sort((a, b) => (b.merito || 0) - (a.merito || 0))
                .slice(0, 10);
            break;
        default:
            titulo = '🏆 RANKING GERAL';
            classeGradiente = 'gradient-blue';
            ranking = [...dados.usuarios]
                .sort((a, b) => (b.merito || 0) - (a.merito || 0))
                .slice(0, 10);
    }

    let rankingHTML = `
        <div class="modal-header ${classeGradiente}">
            <h2 class="modal-title">${titulo}</h2>
        </div>
        <div class="modal-body">
    `;

    if (ranking.length === 0) {
        rankingHTML += `<p class="modal-placeholder">Nenhum usuário nesta categoria ainda.</p>`;
    } else {
        ranking.forEach((usuario, index) => {
            const posicao = index + 1;
            const trofeu = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}°`;
            
            rankingHTML += `
                <div class="ranking-item simple">
                    <div class="ranking-posicao">${trofeu}</div>
                    <img src="${usuario.imagem || 'default-usuario.png'}" class="ranking-imagem small">
                    <div class="ranking-info">
                        <strong>${usuario.nome}</strong>
                        <div class="ranking-subinfo">@${usuario.usuario}</div>
                    </div>
                    <div class="ranking-pontos">${usuario.merito || 0}</div>
                </div>
            `;
        });
    }
    rankingHTML += `
        </div>
        <div class="modal-footer">
            <button class="modal-btn-fechar" onclick="fecharModal(this.closest('.modal-custom'))">
                Fechar
            </button>
        </div>
    `;

    content.innerHTML = rankingHTML;
    modal.appendChild(content);
    document.body.appendChild(modal);
    vincularFechamentoModal(modal, overlay);
}
function abrirBuscaAvancada() {
    const { modal, content, overlay } = criarModalBase('modal-busca', '700px');
    modal.classList.add('modal-fullscreen-mobile'); // Adiciona classe para tela cheia

    content.innerHTML = `
        <div class="modal-header text-center">
            <h2 class="modal-title">🔍 BUSCA AVANÇADA</h2>
            <p class="modal-subtitle">Encontre usuários, jogos, apostas e muito mais</p>
        </div>
        
        <div class="modal-body">
            <div class="busca-input-wrapper">
                <input type="text" id="inputBuscaGlobal" 
                       placeholder="Digite para buscar..."
                       class="busca-input">
                <span class="busca-input-icon">🔍</span>
            </div>

            <div class="busca-filtros">
                <button class="filtro-busca" data-categoria="usuarios">👤 Usuários</button>
                <button class="filtro-busca" data-categoria="jogos">🎮 Jogos</button>
                <button class="filtro-busca" data-categoria="apostas">💰 Apostas</button>
                <button class="filtro-busca" data-categoria="desafios">🎯 Desafios</button>
            </div>

            <div id="resultadosBusca" class="busca-resultados">
                <div class="modal-placeholder">
                    🔍 Digite algo para começar a buscar...
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="modal-btn-fechar" onclick="fecharModal(this.closest('.modal-custom'))">
                Fechar Busca
            </button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
    vincularFechamentoModal(modal, overlay, true); // Permite fechar clicando fora

    // Focar no input
    setTimeout(() => {
        const input = document.getElementById('inputBuscaGlobal');
        if (input) input.focus();
    }, 100);

    // Event listeners
    const inputBusca = document.getElementById('inputBuscaGlobal');
    inputBusca.addEventListener('input', function(e) {
        const termo = e.target.value.trim();
        if (termo.length >= 2) {
            executarBuscaGlobal(termo);
        } else {
            document.getElementById('resultadosBusca').innerHTML = `
                <div class="modal-placeholder">
                    🔍 Digite pelo menos 2 caracteres...
                </div>
            `;
        }
    });
    const botoesFiltro = content.querySelectorAll('.filtro-busca');
    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarBusca(categoria);
        });
    });
}
function executarBuscaGlobal(termo) {
    const resultadosDiv = document.getElementById('resultadosBusca');
    const termoLower = termo.toLowerCase();
    
    let resultados = [];
    // ... (lógica de busca intacta) ...
    // ... (lógica de busca intacta) ...
    const usuariosEncontrados = dados.usuarios.filter(u => 
        u.nome?.toLowerCase().includes(termoLower) || 
        u.usuario?.toLowerCase().includes(termoLower)
    ).map(u => ({ tipo: 'usuario', item: u }));
    // ... (resto da lógica de busca) ...
    const jogosEncontrados = []; // Adicione sua lógica
    const apostasEncontradas = []; // Adicione sua lógica
    const desafiosEncontrados = []; // Adicione sua lógica

    resultados = [
        ...usuariosEncontrados,
        ...jogosEncontrados,
        ...apostasEncontradas,
        ...desafiosEncontrados
    ];


    if (resultados.length === 0) {
        resultadosDiv.innerHTML = `
            <div class="modal-placeholder error">
                <div class="placeholder-icon">😕</div>
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente usar termos diferentes ou verifique a ortografia</p>
            </div>
        `;
        return;
    }

    let resultadosHTML = `<div class="busca-contagem">${resultados.length} resultado(s) encontrado(s)</div>`;

    resultados.forEach(resultado => {
        const { tipo, item, cardId } = resultado;
        
        switch(tipo) {
            case 'usuario':
                resultadosHTML += `
                    <div class="busca-item" 
                         onclick="abrirModalPerfilUsuario('${item.usuario}'); fecharModal(document.getElementById('modal-busca'));">
                        <div class="busca-item-icon">👤</div>
                        <div class="busca-item-info">
                            <strong>${item.nome}</strong>
                            <div class="busca-item-subinfo">@${item.usuario}</div>
                        </div>
                        <div class="busca-item-extra">${item.merito || 0} pts</div>
                    </div>
                `;
                break;
            // ... (outros cases para 'jogo', 'aposta', 'desafio') ...
        }
    });

    resultadosDiv.innerHTML = resultadosHTML;
}
function filtrarBusca(categoria) {
    const input = document.getElementById('inputBuscaGlobal');
    input.value = categoria;
    input.focus();
    executarBuscaGlobal(categoria);
}
function mostrarPainelEventos() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border-radius: 20px; padding: 0;
        width: 600px; max-width: 90%; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3); z-index: 15000;
    `;

    const eventosAtivos = eventos.filter(e => e.ativo && new Date(e.dataFim) > new Date());
    const eventosPassados = eventos.filter(e => !e.ativo || new Date(e.dataFim) <= new Date());

    let eventosHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 25px; border-radius: 20px 20px 0 0; color: white; text-align: center;">
            <h2 style="margin: 0 0 10px 0;">📅 EVENTOS E TORNEIOS</h2>
            <p style="margin: 0; opacity: 0.9;">Participe e ganhe recompensas especiais!</p>
        </div>
        <div style="padding: 25px;">
    `;

    // Eventos ativos
    if (eventosAtivos.length > 0) {
        eventosHTML += `<h3 style="color: #333; margin-bottom: 15px;">🎯 Eventos Ativos</h3>`;
        
        eventosAtivos.forEach(evento => {
            const tempoRestante = calcularTempoRestante(evento.dataFim);
            
            eventosHTML += `
                <div style="border: 2px solid #4CAF50; border-radius: 12px; padding: 15px; 
                            margin-bottom: 15px; background: #f1f8e9;">
                    <div style="display: flex; justify-content: between; align-items: start;">
                        <h4 style="margin: 0 0 8px 0; color: #2E7D32;">${evento.titulo}</h4>
                        <span style="background: #4CAF50; color: white; padding: 4px 8px; 
                                     border-radius: 12px; font-size: 12px;">
                            ⏱️ ${tempoRestante}
                        </span>
                    </div>
                    <p style="margin: 0 0 10px 0; color: #555;">${evento.descricao}</p>
                    <button onclick="participarEvento(${evento.id})" 
                            style="background: #4CAF50; color: white; border: none; 
                                   padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Participar
                    </button>
                </div>
            `;
        });
    } else {
        eventosHTML += `
            <div style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
                <h3 style="margin: 0 0 10px 0;">Nenhum evento ativo</h3>
                <p>Volte mais tarde para novos eventos e torneios!</p>
            </div>
        `;
    }

    // Eventos passados
    if (eventosPassados.length > 0) {
        eventosHTML += `
            <h3 style="color: #333; margin: 25px 0 15px 0;">📚 Eventos Passados</h3>
            <div style="opacity: 0.7;">
        `;
        
        eventosPassados.slice(0, 5).forEach(evento => {
            eventosHTML += `
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; 
                            margin-bottom: 10px; background: #fafafa;">
                    <div style="font-weight: bold; color: #666;">${evento.titulo}</div>
                    <div style="font-size: 12px; color: #999;">
                        ${new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            `;
        });
        
        eventosHTML += `</div>`;
    }

    eventosHTML += `
        </div>
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0;">
            <button onclick="modal.remove()" 
                    style="padding: 12px 30px; background: #666; color: white; 
                           border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">
                Fechar
            </button>
        </div>
    `;

    modal.innerHTML = eventosHTML;
    document.body.appendChild(modal);

    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 14999;
    `;
    overlay.onclick = () => {
        modal.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}
async function mostrarApostasGlobais() {
    // Mostrar todas as apostas disponíveis no sistema
    const cardIds = [...new Set(dados.apostasUsuarios.map(a => a.cardId))];
    if (cardIds.length === 0) {
        alert('Nenhuma aposta disponível no momento!');
        return;
    }
    
    // Aqui você pode implementar uma visualização global de apostas
    mostrarApostasExistentes(cardIds[0]);
}
function mostrarDesafiosGlobais() {
    // Similar à função de apostas globais
    const cardIds = [...new Set(dados.desafiosUsuarios.map(d => d.cardId))];
    if (cardIds.length === 0) {
        alert('Nenhum desafio disponível no momento!');
        return;
    }
    
    // Implementar visualização global de desafios
    alert('Sistema de desafios globais em desenvolvimento!');
}
function verPerfilCompleto() {
    const usuario = window.usuarioLogado || streamerLogado;
    if (!usuario) {
        alert("Faça login primeiro!");
        return;
    }
    
    let perfil = `=== PERFIL ===\n\n`;
    perfil += `Nome: ${usuario.nome}\n`;
    perfil += `Usuário: ${usuario.usuario}\n`;
    perfil += `Mérito: ${usuario.merito} pontos\n`;
    perfil += `Chave PIX: ${usuario.chavePix || "Não configurada"}\n`;
    
    if (window.usuarioLogado) {
        perfil += `\n--- Estatísticas ---\n`;
        perfil += `Desafios cumpridos: ${usuario.desafiosCumpridos}\n`;
        perfil += `Desafios falhados: ${usuario.desafiosFalhados}\n`;
        perfil += `Pagamentos realizados: ${usuario.pagamentosRealizados}\n`;
        perfil += `Pagamentos pendentes: ${usuario.pagamentosPendentes}\n`;
        perfil += `Amigos: ${usuario.amigos ? usuario.amigos.length : 0}\n`;
    } else if (streamerLogado) {
        perfil += `\n--- Status ---\n`;
        perfil += `Online: ${streamerLogado.online ? 'Sim' : 'Não'}\n`;
        perfil += `Vídeos: ${streamerLogado.videos ? streamerLogado.videos.length : 0}\n`;
    }
    
    perfil += `\n--- Ações ---\n`;
    perfil += `1. Configurar PIX\n`;
    perfil += `2. Ver Conquistas\n`;
    perfil += `3. Ver Ranking\n`;
    
    const opcao = prompt(perfil + "\nDigite o número da ação:");
    
    switch(opcao) {
        case "1":
            configurarChavePix();
            break;
        case "2":
            verConquistas();
            break;
        case "3":
            verRankingUsuarios();
            break;
    }
}
async function fecharMenuPrincipal() {
    const menu = document.getElementById('menuPrincipal');
    if (menu) {
        menu.remove();
    }
}
function abrirConfiguracoes() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border-radius: 15px; padding: 25px;
        width: 400px; max-width: 90%; z-index: 15000;
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    `;

    modal.innerHTML = `
        <h3 style="margin: 0 0 20px 0; text-align: center;">⚙️ Configurações</h3>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                🔔 Notificações
            </label>
            <select style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                <option value="all">Todas as notificações</option>
                <option value="important">Apenas importantes</option>
                <option value="none">Desativar</option>
            </select>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                🎵 Som de Notificações
            </label>
            <select style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                <option value="on">Ativado</option>
                <option value="off">Desativado</option>
            </select>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                🌙 Tema
            </label>
            <select style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
            </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <!--  <button onclick="modal.remove()" 
                    style="flex: 1; padding: 10px; background: #666; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="salvarConfiguracoes(); modal.remove();" 
                    style="flex: 1; padding: 10px; background: #4CAF50; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Salvar
            </button> -->
            <button onclick="fecharModalCompleto(this)" 
        style="flex: 1; padding: 10px; background: #666; color: white; 
               border: none; border-radius: 5px; cursor: pointer;">
    Cancelar
</button>
<button onclick="salvarConfiguracoes(); fecharModalCompleto(this)" 
        style="flex: 1; padding: 10px; background: #4CAF50; color: white; 
               border: none; border-radius: 5px; cursor: pointer;">
    Salvar
</button>

        </div>
    `;

    document.body.appendChild(modal);

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 14999;
    `;
    overlay.onclick = () => {
        modal.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}
async function criarMenuPrincipal() {
    if (document.getElementById('menuPrincipal')) return;

    const menu = document.createElement('div');
    menu.id = 'menuPrincipal';
    menu.className = 'header-widget menu-principal-dropdown';

    const botoes = [
        { emoji: '🏆', texto: 'Ranking', acao: exibirRanking },
        { emoji: '🔍', texto: 'Buscar', acao: abrirBuscaAvancada },
        { emoji: '📅', texto: 'Eventos', acao: mostrarPainelEventos },
        { emoji: '💰', texto: 'Apostas', acao: mostrarApostasGlobais },
        { emoji: '🎯', texto: 'Desafios', acao: mostrarDesafiosGlobais },
        { emoji: '👤', texto: 'Perfil', acao: verPerfilCompleto },
        { emoji: '⚙️', texto: 'Configurações', acao: abrirConfiguracoes }
    ];

    const header = document.createElement('div');
    header.className = 'menu-header';
    header.innerHTML = `<h3>🎮 Menu Principal</h3>`;
    header.onclick = fecharMenuPrincipal;
    menu.appendChild(header);

    // Cria botões dinamicamente
    botoes.forEach(botao => {
        const btn = document.createElement('button');
        btn.className = 'menu-botao';
        btn.innerHTML = `
            <span class="menu-botao-emoji">${botao.emoji}</span>
            <span class="menu-botao-texto">${botao.texto}</span>
        `;

        // Agora podemos usar async/!
        btn.addEventListener('click', async () => {
            fecharMenuPrincipal();
             botao.acao(); // <- Aqui o  funciona!
        });

        menu.appendChild(btn);
    });

    const footer = document.createElement('div');
    footer.className = 'menu-footer';
    const fecharBtn = document.createElement('button');
    fecharBtn.className = 'menu-btn-fechar';
    fecharBtn.textContent = 'Fechar Menu';
    fecharBtn.onclick = fecharMenuPrincipal;
    footer.appendChild(fecharBtn);
    menu.appendChild(footer);

    document.body.appendChild(menu);
}
criarMenuPrincipal();