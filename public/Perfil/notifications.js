
// ===== NOTIFICAÇÕES =====
function verNotificacoes() {
    if (notificacoes.length === 0) {
        alert("Nenhuma notificação");
        return;
    }
    
    let lista = "=== NOTIFICAÇÕES ===\n\n";
    notificacoes.forEach((not, index) => {
        lista += `${not.lida ? '📭' : '📫'} ${not.titulo}\n`;
        lista += `Mensagem: ${not.mensagem}\n`;
        lista += `Data: ${not.data}\n`;
        lista += `Tipo: ${not.tipo}\n`;
        
        if (!not.lida) {
            lista += `[Marcar como lida - digite 'l ${index}']\n`;
        }
        lista += "------------------------\n";
    });
    
    lista += "\nComandos: 'l [número]' - marcar como lida";
    const comando = prompt(lista);
    
    if (comando && comando.startsWith('l ')) {
        const index = parseInt(comando.split(' ')[1]);
        if (!isNaN(index) && index >= 0 && index < notificacoes.length) {
            notificacoes[index].lida = true;
            alert("Notificação marcada como lida!");
        }
    }
}
function limparNotificacoes() {
    if (confirm("Limpar todas as notificações?")) {
        notificacoes = [];
        alert("Notificações limpas!");
    }
}
function getNotificacoesNaoLidas() {
    return notificacoes.filter(not => !not.lida).length;
}
function mostrarToastNotificacao(notificacao) {
    const toast = document.createElement('div');
    toast.className = 'toast-notificacao';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: ${getCorNotificacao(notificacao.tipo)};
        color: white; padding: 15px 20px; border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 20000;
        max-width: 350px; animation: slideInRight 0.3s ease;
        display: flex; align-items: center; gap: 10px;
        cursor: pointer;
    `;
    
    const icones = {
        'info': 'ℹ️',
        'sucesso': '✅',
        'alerta': '⚠️',
        'aposta': '💰',
        'desafio': '🎯'
    };
    
    toast.innerHTML = `
        <div style="font-size: 20px;">${icones[notificacao.tipo] || '📢'}</div>
        
        <div onclick="mostrarPainelNotificacoes()" style="flex: 1;">
            <strong>${notificacao.titulo}</strong>
            <div style="font-size: 13px; margin-top: 2px; opacity: 0.9;">${notificacao.mensagem}</div>
        </div>
        <button onclick="this.parentElement.remove()" 
                style="background: none; border: none; color: white; 
                       cursor: pointer; font-size: 16px; padding: 0; margin-left: 10px;">
            ×
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
    
    // Click para marcar como lida
    toast.onclick = function() {
        marcarNotificacaoComoLida(notificacao.id);
        toast.remove();
        
    };
}
function criarItemNotificacao(notificacao) {
    const icones = {
        'info': 'ℹ️',
        'sucesso': '✅',
        'alerta': '⚠️',
        'aposta': '💰',
        'desafio': '🎯',
        'ranking': '🏆',
        'amigo': '👥'
    };

    return `
        <div style="padding: 12px; margin: 8px 0; background: ${notificacao.lida ? '#fafafa' : '#e3f2fd'}; 
                    border-radius: 8px; border-left: 4px solid ${notificacao.lida ? '#ccc' : '#2196F3'}; 
                    cursor: pointer;" 
             onclick="marcarNotificacaoComoLida(${notificacao.id})">
            <div style="display: flex; align-items: start;">
                <div style="font-size: 20px; margin-right: 10px;">
                    ${icones[notificacao.tipo] || '📢'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: ${notificacao.lida ? 'normal' : 'bold'}; 
                                color: #333; margin-bottom: 4px;">
                        ${notificacao.titulo}
                    </div>
                    <div style="font-size: 12px; color: #666; line-height: 1.4;">
                        ${notificacao.mensagem}
                    </div>
                    <div style="font-size: 10px; color: #999; margin-top: 4px;">
                        ${notificacao.data}
                    </div>
                </div>
                ${!notificacao.lida ? `
                    <div style="width: 8px; height: 8px; background: #2196F3; 
                                border-radius: 50%; margin-left: 5px;"></div>
                ` : ''}
            </div>
        </div>
    `;
}
async function marcarNotificacaoComoLida(id) {
    const notificacao = notificacoes.find(n => n.id === id);
    if (notificacao) {
        notificacao.lida = true;
        atualizarBadgeNotificacoes();
        // Atualizar UI se o painel estiver aberto
        const painel = document.querySelector('[style*="z-index: 15000"]');
        if (painel) {
        await    mostrarPainelNotificacoes();
        }
    }
}
async function marcarTodasComoLidas() {
    notificacoes.forEach(n => n.lida = true);
    atualizarBadgeNotificacoes();
  await  mostrarPainelNotificacoes();
}
function getCorNotificacao(tipo) {
    const cores = {
        'sucesso': '#4CAF50',
        'alerta': '#FF9800',
        'aposta': '#FF9800',
        'desafio': '#9C27B0',
        'info': '#2196F3'
    };
    return cores[tipo] || '#2196F3';
}
async function atualizarBadgeNotificacoes() {
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    const badge = document.getElementById('badgeNotificacoes') ||  criarBadgeNotificacoes();
    
    if (naoLidas > 0) {
        badge.textContent = naoLidas > 99 ? '99+' : naoLidas.toString();
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}
async function adicionarNotificacao(titulo, mensagem, tipo = 'info') {
    const notificacao = {
        id: Date.now() + Math.random(),
        titulo: titulo,
        mensagem: mensagem,
        tipo: tipo,
        lida: false,
        data: new Date().toLocaleString('pt-BR')
    };
    
    notificacoes.unshift(notificacao);
    
    // Limitar a 100 notificações
    if (notificacoes.length > 100) {
        notificacoes = notificacoes.slice(0, 100);
    }
    
    // Mostrar toast
    mostrarToastNotificacao(notificacao);
    
    // Atualizar badge
    atualizarBadgeNotificacoes();
    
    return notificacao.id;
}
async function verificarEncerramentosAutomaticos() {
    const agora = new Date();
    let atualizou = false;
    
    // --- CORREÇÃO: Checagem de Array (da interação anterior) ---
    let apostasUsuarios = window?.dados?.apostasUsuarios;
    
    if (Array.isArray(apostasUsuarios)) {
        
        for (let sala of apostasUsuarios) {
            if (!sala.apostas || !Array.isArray(sala.apostas)) continue;

            for (let aposta of sala.apostas) {
                // Pula se a aposta não estiver 'aberta' ou se a data de encerramento não passou
                if (aposta.status !== 'aberta' || new Date(aposta.dataEncerramento) >= agora) {
                    continue;
                }
                
                console.log(`Encerrando aposta ID ${aposta.id}: "${aposta.titulo}"`);
                aposta.status = 'encerrada';
                atualizou = true;

                const vencedores = [];
                const perdedores = [];
                
                // Só calcula se houver uma opção vencedora definida
                if (aposta.opcaoVENCEDORA) {
                    (aposta.participantes || []).forEach(part => {
                        // 'part' foi criado em 'confirmarParticipacaoAposta'
                        // e contém 'isGuest' e 'email'
                        if (part.opcao === aposta.opcaoVENCEDORA) {
                            vencedores.push(part);
                        } else {
                            perdedores.push(part);
                        }
                    });
                } else {
                    console.warn(`Aposta ${aposta.id} encerrada sem 'opcaoVENCEDORA'.`);
                    perdedores.push(...(aposta.participantes || []));
                }

                // Cria pagamentos pendentes APENAS para usuários logados
                if (vencedores.length > 0 && perdedores.length > 0) {
                    const valorPorPerdedor = aposta.valor / vencedores.length; // (Ajuste esta lógica se for "pote total")
                    
                    // --- CORREÇÃO: Filtrar Convidados ---
                    const perdedoresReais = perdedores.filter(p => !p.isGuest);

                    // Cria pagamentos pendentes apenas para quem não é convidado
                    if (perdedoresReais.length > 0) {
                        aposta.pagamentosPendentes = perdedoresReais.map(perdedor => ({
                            email: perdedor.email, //
                            valor: valorPorPerdedor,
                            status: 'pendente'
                        }));
                    } else {
                        aposta.pagamentosPendentes = []; // Nenhum usuário real deve
                    }

                    // Notifica TODOS os perdedores (convidados e logados)
                    perdedores.forEach(perdedor => {
                        // --- CORREÇÃO: Notificação diferente para Convidado ---
                        if (perdedor.isGuest) {
                            adicionarNotificacao(
                                'Aposta Encerrada',
                                `Você perdeu ${aposta.valor} pontos (convidado) na aposta "${aposta.titulo}".`,
                                'alerta'
                            );
                        } else {
                            adicionarNotificacao(
                                '⚠️ Pagamento Pendente',
                                `Você perdeu a aposta "${aposta.titulo}"! Pague ${valorPorPerdedor} via PIX.`, //
                                'alerta'
                            );
                        }
                    });

                    // Notifica vencedores
                    vencedores.forEach(vencedor => {
                        // (Aqui você adicionaria o mérito/pontos ao vencedor)
                        adicionarNotificacao(
                            '🏆 Vitória!',
                            `Você venceu a aposta "${aposta.titulo}"!`, //
                            'sucesso'
                        );
                    });
                    
                } else {
                    // Caso de encerramento sem vencedores ou sem participantes
                    adicionarNotificacao(
                        '⏰ Aposta Encerrada',
                        `A aposta "${aposta.titulo}" foi encerrada.`, //
                        'info'
                    );
                    // (Aqui você pode adicionar lógica para devolver méritos se ninguém ganhou)
                }
            }
        }
    } else {
        console.warn("[verificarEncerramentos] 'apostasUsuarios' ainda não é um array ou não está definido.");
    }

    if (atualizou) {
        console.log("Atualizações de status de apostas detectadas, sincronizando...");
        syncDataToPeers();
        salvarDados();
        atualizarIndicadoresApostas();
    }
}
/*
function mostrarPainelNotificacoes() {
    const modal = document.createElement('div');
    modal.id = 'modalNotificacoes';
    modal.style.cssText = `
        position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
        background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        z-index: 15000; overflow-y: auto;
    `;

    const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
    const notificacoesLidas = notificacoes.filter(n => n.lida);

    let notificacoesHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">🔔 Notificações</h3>
                <button id="fecharNotificacoesBtn" 
                        style="background: none; border: none; color: white; 
                               font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="margin-top: 10px; font-size: 14px;">
                ${notificacoesNaoLidas.length} não lida(s)
            </div>
        </div>
        <div style="padding: 15px;">
    `;

    // ... (código das notificações permanece o mesmo) ...

    notificacoesHTML += `
        </div>
        <div style="position: sticky; bottom: 0; background: white; padding: 15px; 
                    border-top: 1px solid #e0e0e0; display: flex; gap: 10px;">
            <button onclick="marcarTodasComoLidas()" 
                    style="flex: 1; padding: 10px; background: #2196F3; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Marcar todas como lida
            </button>
            <button onclick="limparNotificacoes()" 
                    style="flex: 1; padding: 10px; background: #f44336; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Limpar todas
            </button>
        </div>
    `;

    modal.innerHTML = notificacoesHTML;
    document.body.appendChild(modal);

    // CORREÇÃO: Evento de fechamento
    const fecharBtn = modal.querySelector('#fecharNotificacoesBtn');
    if (fecharBtn) {
        fecharBtn.onclick = function() {
            modal.remove();
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
        };
    }

    // CORREÇÃO: Overlay para fechar ao clicar fora
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 14999;
    `;
    overlay.onclick = function() {
        modal.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);

    // CORREÇÃO: Fechar com ESC
    const fecharComESC = function(e) {
        if (e.key === 'Escape') {
            modal.remove();
            overlay.remove();
            document.removeEventListener('keydown', fecharComESC);
        }
    };
    document.addEventListener('keydown', fecharComESC);
}
*/
// Em notifications.js, SUBSTITUA a função antiga por esta:

async function mostrarPainelNotificacoes() {
    // Remove painel antigo se existir, para evitar duplicatas
    const antigo = document.getElementById('modalNotificacoes');
    if (antigo) antigo.remove();
    
    // Remove overlay antigo se existir
    const overlayAntigo = document.getElementById('overlayNotificacoes');
    if (overlayAntigo) overlayAntigo.remove();

    const modal = document.createElement('div');
    modal.id = 'modalNotificacoes';
    modal.style.cssText = `
        position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
        background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        z-index: 15000; overflow-y: auto;
        transform: translateX(100%);
        animation: slideInPanel 0.3s forwards;
    `;
    
    // Adiciona keyframe para animação (opcional, mas melhora a UI)
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = "@keyframes slideInPanel { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }";
    document.head.appendChild(styleSheet);


    const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
    const notificacoesLidas = notificacoes.filter(n => n.lida);

    let notificacoesHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 20px; color: white; position: sticky; top: 0; z-index: 10;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">🔔 Notificações</h3>
                <button id="fecharNotificacoesBtn" 
                        style="background: none; border: none; color: white; 
                               font-size: 24px; cursor: pointer; padding: 0 5px;">×</button>
            </div>
            <div style="margin-top: 10px; font-size: 14px;">
                ${notificacoesNaoLidas.length} não lida(s)
            </div>
        </div>
        <div style="padding: 15px;">
    `;

    // <<< INÍCIO DA CORREÇÃO (Onde estava o comentário) >>>
    // Aqui nós renderizamos as notificações usando a função que já existe
    
    if (notificacoes.length === 0) {
        notificacoesHTML += `
            <div style="text-align: center; padding: 30px 10px; color: #777;">
                <span style="font-size: 30px; display: block; margin-bottom: 10px;">📭</span>
                Nenhuma notificação por aqui.
            </div>
        `;
    } else {
        // 1. Renderiza as NÃO LIDAS
        if (notificacoesNaoLidas.length > 0) {
            notificacoesHTML += `<h4 style="margin-top: 0; margin-bottom: 5px; color: #333;">Não Lidas</h4>`;
            notificacoesNaoLidas.forEach(not => {
                // Usando a sua função que cria o HTML bonito
                notificacoesHTML += criarItemNotificacao(not); 
            });
        }

        // 2. Renderiza as LIDAS
        if (notificacoesLidas.length > 0) {
            notificacoesHTML += `<h4 style="margin-top: 20px; margin-bottom: 5px; color: #555;">Lidas</h4>`;
            notificacoesLidas.forEach(not => {
                // Usando a sua função que cria o HTML bonito
                notificacoesHTML += criarItemNotificacao(not);
            });
        }
    }
    
    // <<< FIM DA CORREÇÃO >>>


    notificacoesHTML += `
        </div>
        <div style="position: sticky; bottom: 0; background: white; padding: 15px; 
                    border-top: 1px solid #e0e0e0; display: flex; gap: 10px; z-index: 10;">
            <button id="btnMarcarTodasLidas" 
                    style="flex: 1; padding: 10px; background: #2196F3; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Marcar todas como lida
            </button>
            <button id="btnLimparNotificacoes" 
                    style="flex: 1; padding: 10px; background: #f44336; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Limpar todas
            </button>
        </div>
    `;

    modal.innerHTML = notificacoesHTML;
    document.body.appendChild(modal);

    // --- CORREÇÃO: Overlay para fechar ao clicar fora ---
    const overlay = document.createElement('div');
    overlay.id = 'overlayNotificacoes';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 14999;
    `;
    
    // Função unificada para fechar
    const fecharPainel = () => {
        modal.remove();
        overlay.remove();
        styleSheet.remove(); // Limpa o <style> da animação
        document.removeEventListener('keydown', fecharComESC);
    };

    overlay.onclick = fecharPainel;
    document.body.appendChild(overlay);

    // --- CORREÇÃO: Eventos de fechamento e botões ---
    modal.querySelector('#fecharNotificacoesBtn').onclick = fecharPainel;
    
    // Usamos 'async' para que o painel atualize após a ação
    modal.querySelector('#btnMarcarTodasLidas').onclick = async () => {
        await marcarTodasComoLidas();
        // A função marcarTodasComoLidas já recarrega o painel
    };
    
    modal.querySelector('#btnLimparNotificacoes').onclick = () => {
        limparNotificacoes();
        fecharPainel(); // Limpa e fecha
    };

    // --- CORREÇÃO: Fechar com ESC ---
    const fecharComESC = (e) => {
        if (e.key === 'Escape') {
            fecharPainel();
        }
    };
    document.addEventListener('keydown', fecharComESC);
}
async function criarBadgeNotificacoes() {
    const badge = document.createElement('div');
    badge.id = 'badgeNotificacoes';
    badge.style.cssText = `
        position: fixed; top: 15px; right: 15px; 
        background: #f44336; color: white; 
        border-radius: 50%; width: 22px; height: 22px;
        display: none; align-items: center; justify-content: center;
        font-size: 12px; font-weight: bold; z-index: 10000;
        cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    badge.onclick =  mostrarPainelNotificacoes;
    document.body.appendChild(badge);
    return badge;
}


