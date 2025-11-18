
// ===== FUNÇÃO AUXILIAR PARA CRIAR MODAIS =====
function criarModalBase(id, largura, classeAdicional = '') {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = `modal-custom ${classeAdicional}`;
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.width = largura; // Largura ainda controlada aqui
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    return { modal, content, overlay };
}
function vincularFechamentoModal(modal, overlay, fecharClickFora = false) {
    const fechar = () => {
        fecharModal(modal);
        if (overlay) fecharModal(overlay);
        document.removeEventListener('keydown', fecharComESC);
    };

    if (fecharClickFora && overlay) {
        overlay.onclick = fechar;
    }

    const fecharComESC = (e) => {
        if (e.key === 'Escape') fechar();
    };
    document.addEventListener('keydown', fecharComESC);
}
function fecharModal(elemento) {
    if (elemento && elemento.parentNode) {
        elemento.parentNode.removeChild(elemento);
    }
}
// ===== FUNÇÕES GLOBAIS =====
async function toggleProfileMenu() {
    const floatingMenu = document.getElementById('loginFloating');
    const overlay = document.getElementById('overlay');
    const profileIcon = document.getElementById('profileIcon');
    
    if (floatingMenu && floatingMenu.classList.contains('show')) {
        floatingMenu.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    } else {
        atualizarMenuPerfil();
        if (floatingMenu) floatingMenu.classList.add('show');
        if (overlay) overlay.classList.add('show');
    }
}
function mostrarPainelEventos() {
    const { modal, content, overlay } = criarModalBase('modal-eventos', '600px');

    const eventosAtivos = eventos.filter(e => e.ativo && new Date(e.dataFim) > new Date());
    const eventosPassados = eventos.filter(e => !e.ativo || new Date(e.dataFim) <= new Date());

    let eventosHTML = `
        <div class="modal-header gradient-purple text-center">
            <h2 class="modal-title">📅 EVENTOS E TORNEIOS</h2>
            <p class="modal-subtitle">Participe e ganhe recompensas especiais!</p>
        </div>
        <div class="modal-body">
    `;

    // Eventos ativos
    if (eventosAtivos.length > 0) {
        eventosHTML += `<h3 class="secao-titulo">🎯 Eventos Ativos</h3>`;
        eventosAtivos.forEach(evento => {
            const tempoRestante = calcularTempoRestante(evento.dataFim);
            eventosHTML += `
                <div class="evento-item ativo">
                    <div class="evento-header">
                        <h4 class="evento-titulo">${evento.titulo}</h4>
                        <span class="evento-tempo">⏱️ ${tempoRestante}</span>
                    </div>
                    <p class="evento-descricao">${evento.descricao}</p>
                    <button class="evento-btn-participar" onclick="participarEvento(${evento.id})">
                        Participar
                    </button>
                </div>
            `;
        });
    } else {
        eventosHTML += `
            <div class="modal-placeholder">
                <div class="placeholder-icon">📅</div>
                <h3>Nenhum evento ativo</h3>
                <p>Volte mais tarde para novos eventos!</p>
            </div>
        `;
    }

    // Eventos passados
    if (eventosPassados.length > 0) {
        eventosHTML += `<h3 class="secao-titulo">📚 Eventos Passados</h3>`;
        eventosHTML += `<div class="eventos-passados-lista">`;
        eventosPassados.slice(0, 5).forEach(evento => {
            eventosHTML += `
                <div class="evento-item passado">
                    <div class="evento-titulo">${evento.titulo}</div>
                    <div class="evento-data">
                        ${new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            `;
        });
        eventosHTML += `</div>`;
    }
    eventosHTML += `
        </div>
        <div class="modal-footer">
            <button class="modal-btn-fechar" onclick="fecharModal(this.closest('.modal-custom'))">
                Fechar
            </button>
        </div>
    `;

    content.innerHTML = eventosHTML;
    modal.appendChild(content);
    document.body.appendChild(modal);
    vincularFechamentoModal(modal, overlay, true);
}



function calcularTempoRestante(dataFim) {
    const agora = new Date();
    const fim = new Date(dataFim);
    const diff = fim - agora;
    
    if (diff <= 0) return 'Encerrado';
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
        return `${horas}h ${minutos}m`;
    } else {
        return `${minutos}m`;
    }
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
async function salvarConfiguracoes() {
   await adicionarNotificacao('⚙️ Configurações', 'Configurações salvas com sucesso!', 'sucesso');
}

window.fecharModalCompleto = function(elemento) {
    const modal = elemento.closest('div[style*="z-index"]') || elemento.closest('.modal-custom');
    const overlay = document.querySelector('.modal-overlay') || document.querySelector('div[style*="rgba(0,0,0"]');
    if (modal) modal.remove();
    if (overlay) overlay.remove();
};

