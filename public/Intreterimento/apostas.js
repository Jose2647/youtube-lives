/*
mostrarApostasExistentes(), abrirFormularioCriarAposta(), abrirFormularioParticiparAposta(), selecionarOpcaoAposta(), mostrarSelecaoOpcoesAposta(), verificarEncerramentosAutomaticos(), checarEAtualizarStatusAposta(), calcularVencedoresEPerdedores(), criarPagamentosPendentes().

*/

function mostrarApostasExistentes(cardId) {
    const apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
    if (!apostaSala || !apostaSala.apostas.length) {
        alert('Nenhuma aposta disponível para este conteúdo!');
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center;
        align-items: center; z-index: 15000;
    `;

    let apostasHTML = '';
    apostaSala.apostas.forEach(aposta => {
    const participantes = aposta.participantes?.length || 0;
    const statusColor = aposta.status === 'aberta' ? '#4CAF50' : '#f44336';
    
    // Verifica se há pagamento pendente para o usuário atual
    const pagamentoPendente = aposta.pagamentosPendentes?.find(p => 
        p.email === window.usuarioLogado?.email && p.status === 'pendente'
    );
    
    let botaoPagamentoHTML = '';
    if (pagamentoPendente && aposta.status === 'encerrada') {
        botaoPagamentoHTML = `
            <div style="margin-top: 10px; padding: 10px; background: #FFF3E0; border-radius: 5px;">
                <p style="color: #FF9800; margin: 0;">
                    <strong>Pagamento Pendente:</strong> ${pagamentoPendente.valor} (PIX)
                </p>
                <input type="file" id="comprovanteInput-${aposta.id}" accept="image/*" style="margin: 10px 0; width: 100%;">
                <button onclick="sendComprovanteAposta('${aposta.id}', ${pagamentoPendente.minutosAtraso || 0})" 
                        style="padding: 8px 15px; background: #2196F3; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    Enviar Comprovante PIX
                </button>
            </div>
        `;
    }
    
    apostasHTML += `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">${aposta.titulo}</h4>
            <p style="margin: 5px 0; color: #666;">
                <strong>Valor:</strong> ${aposta.valor} méritos | 
                <strong>Participantes:</strong> ${participantes} |
                <strong>Status:</strong> <span style="color: $$ {statusColor}"> $${aposta.status}</span>
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong>Encerra:</strong> ${new Date(aposta.dataEncerramento).toLocaleString()}
            </p>
            ${aposta.status === 'aberta' ? `
                <button onclick="abrirFormularioParticiparAposta('${cardId}', ${aposta.id})" 
                        style="padding: 8px 15px; background: #4CAF50; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    Participar
                </button>
            ` : ''}
            ${botaoPagamentoHTML}  // Adicionado aqui
        </div>
    `;
});

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; border-radius: 15px; padding: 25px;
        width: 500px; max-width: 90%; max-height: 80vh; overflow-y: auto;
    `;

    content.innerHTML = `
        <h3>💰 Apostas Disponíveis</h3>
        ${apostasHTML}
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="abrirFormularioCriarAposta('${cardId}')" 
                    style="padding: 10px 20px; background: #FF9800; color: white; 
                           border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                Criar Nova Aposta
            </button>

            <button onclick="this.closest('div[style*=z-index]').remove()"
        style="padding: 10px 20px; background: #f44336; color: white; 
               border: none; border-radius: 5px; cursor: pointer;">
                Fechar
              </button>

        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
}
function abrirFormularioCriarAposta(cardId) {
    const usuario = window.usuarioLogado;
    if (!usuario) {
        alert('Você precisa estar logado para criar apostas!');
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center;
        align-items: center; z-index: 15000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; border-radius: 15px; padding: 25px;
        width: 450px; max-width: 90%; max-height: 90vh; overflow-y: auto;
    `;

    content.innerHTML = `
        <h3>💰 Criar Nova Aposta</h3>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Título da Aposta:
            </label>
            <input type="text" id="tituloAposta" 
                   placeholder="Ex: Quem vai vencer o jogo?"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Valor da Aposta (méritos):
            </label>
            <input type="number" id="valorAposta" min="1" max="${calcularMeritoMaximoAposta(usuario)}"
                   placeholder="Máximo: ${calcularMeritoMaximoAposta(usuario)}"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Data de Encerramento:
            </label>
            <input type="datetime-local" id="dataEncerramentoAposta"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Opções (uma por linha):
            </label>
            <textarea id="opcoesAposta" 
                      placeholder="Time A&#10;Time B&#10;Empate"
                      style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharFormularioAposta()" 
                    style="padding: 10px 20px; background: #f44336; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="confirmarCriacaoAposta('${cardId}')" 
                    style="padding: 10px 20px; background: #4CAF50; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Criar Aposta
            </button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Configurar data mínima (amanhã)
    const dataInput = document.getElementById('dataEncerramentoAposta');
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    dataInput.min = amanha.toISOString().slice(0, 16);

    window.fecharFormularioAposta = function() {
        modal.remove();
    };
}
function mostrarSelecaoOpcoesAposta(aposta) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; justify-content: center;
            align-items: center; z-index: 15000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; border-radius: 15px; padding: 25px;
            width: 350px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        let opcoesHTML = '';
        aposta.opcoes.forEach((opcao, index) => {
            // Calcula quantas pessoas já escolheram esta opção
            const participantesOpcao = aposta.participantes?.filter(p => p.opcao === opcao).length || 0;
            
            opcoesHTML += `
                <button onclick="selecionarOpcaoAposta('${opcao}')" 
                        style="display: block; width: 100%; margin: 10px 0; padding: 12px; 
                               background: #4CAF50; color: white; border: none; 
                               border-radius: 8px; cursor: pointer; font-size: 16px;
                               position: relative;">
                    ${opcao}
                    <span style="font-size: 12px; opacity: 0.8; display: block;">
                        ${participantesOpcao} pessoa(s)
                    </span>
                </button>
            `;
        });
        
        content.innerHTML = `
            <h3>${aposta.titulo}</h3>
            <p><strong>Valor da Aposta:</strong> ${aposta.valor} méritos</p>
            <p><strong>Seu mérito atual:</strong> ${window.usuarioLogado?.merito || 0}</p>
            <p>Escolha sua opção:</p>
            ${opcoesHTML}
            <button onclick="fecharModalSelecaoAposta()" 
                    style="margin-top: 15px; padding: 8px 15px; 
                           background: #f44336; color: white; border: none; 
                           border-radius: 5px; cursor: pointer;">
                Cancelar
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        window.selecionarOpcaoAposta = function(opcao) {
            modal.remove();
            resolve(opcao);
        };
        
        window.fecharModalSelecaoAposta = function() {
            modal.remove();
            resolve(null);
        };
        
        // Fecha modal ao clicar fora
        modal.onclick = function(e) {
            if (e.target === modal) {
                window.fecharModalSelecaoAposta();
            }
        };
    });
}
function abrirFormularioCriarAposta(cardId) {
    // 1. Obtém o usuário ativo (logado ou convidado)
    // Assume que getActiveUser() existe e retorna um objeto (logado ou guest)
    const usuario = getActiveUser();

    if (!usuario) {
        alert('Erro interno ao carregar o perfil de usuário/convidado.');
        return;
    }

    // 2. Define o modo da aposta
    let isFreeBet = false;
    
    // 3. Lógica para Convidados (Apenas Free Bet)
    if (usuario.isGuest) {
        const confirmacao = confirm(
            "Atenção! Como CONVIDADO, você só pode criar apostas no modo 'FREE BET' (sem valor de mérito/dinheiro). Deseja continuar?"
        );
        if (!confirmacao) return;
        
        isFreeBet = true;
        
    } else {
        // 4. Lógica para Usuários Logados (Verificação de Mérito)
        
        // Verifica o mérito máximo que o usuário logado pode apostar
        // (Assume que calcularMeritoMaximoAposta() está disponível em Intreterimento.js)
        const meritoMinimoParaApostaPaga = 10; // Valor mínimo da aposta
        const meritoMaximo = calcularMeritoMaximoAposta(usuario);
        
        // Se o mérito máximo que ele pode apostar for menor que o mínimo para uma aposta paga
        if (meritoMaximo < meritoMinimoParaApostaPaga) { 
            const confirmacao = confirm(
                "Você tem méritos insuficientes para criar uma aposta valendo pontos. Deseja criar uma aposta 'FREE BET' (valor 0)?"
            );
            if (!confirmacao) return;
            isFreeBet = true;
        }
    }

    // 5. Mostra o formulário de criação
    // O formulário (mostrarFormularioCriarAposta) deve usar o flag 'isFreeBet' para:
    // a) Esconder ou fixar o campo de valor em 0.
    // b) Passar o valor 0 para a função final confirmarCriacaoAposta.
    mostrarFormularioCriarAposta(cardId, usuario, isFreeBet);
}
function mostrarFormularioCriarAposta(cardId, usuario, isFreeBet) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center;
        align-items: center; z-index: 15000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; border-radius: 15px; padding: 25px;
        width: 450px; max-width: 90%; max-height: 90vh; overflow-y: auto;
    `;

    const maxMerito = isFreeBet ? 0 : calcularMeritoMaximoAposta(usuario);

    let valorFieldHTML = '';
    if (isFreeBet) {
        valorFieldHTML = `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                    Valor da Aposta:
                </label>
                <input type="number" id="valorAposta" value="0" disabled
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `;
    } else {
        valorFieldHTML = `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                    Valor da Aposta (méritos):
                </label>
                <input type="number" id="valorAposta" min="10" max="${maxMerito}"
                       placeholder="Máximo: ${maxMerito}"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `;
    }

    content.innerHTML = `
        <h3>💰 Criar Nova Aposta</h3>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Título da Aposta:
            </label>
            <input type="text" id="tituloAposta" 
                   placeholder="Ex: Quem vai vencer o jogo?"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>

        ${valorFieldHTML}

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Data de Encerramento:
            </label>
            <input type="datetime-local" id="dataEncerramentoAposta"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Descrição (opcional):
            </label>
            <textarea id="descricaoAposta" 
                      placeholder="Descreva a aposta..."
                      style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Opções (uma por linha):
            </label>
            <textarea id="opcoesAposta" 
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                      style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancelarCriarAposta" 
                    style="padding: 10px 20px; background: #f44336; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Cancelar
            </button>
            <button id="confirmarCriarAposta" 
                    style="padding: 10px 20px; background: #4CAF50; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Criar Aposta
            </button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Configurar data mínima (amanhã)
    const dataInput = document.getElementById('dataEncerramentoAposta');
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    dataInput.min = amanha.toISOString().slice(0, 16);

    // Evento de cancelar
    document.getElementById('cancelarCriarAposta').onclick = function() {
        modal.remove();
    };

    // Evento de confirmar
    document.getElementById('confirmarCriarAposta').onclick = function() {
        const titulo = document.getElementById('tituloAposta').value.trim();
        const valor = isFreeBet ? 0 : parseInt(document.getElementById('valorAposta').value, 10);
        const descricao = document.getElementById('descricaoAposta').value.trim();

        if (!titulo || (valor < 10 && !isFreeBet)) {
            alert('Preencha os campos corretamente!');
            return;
        }

        confirmarCriacaoAposta(cardId, usuario, titulo, valor, descricao, isFreeBet);
        modal.remove();
    };
}
/////
/////
/////
/////

/**
 * (Arquivo: apostas.js)
 * Abre o formulário de criação de aposta, permitindo 'Free Bets' para convidados.
 */
function abrirFormularioParticiparAposta(cardId, apostaId) {
    const apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
    if (!apostaSala) {
        console.error("Sala de apostas não encontrada para o cardId:", cardId);
        return;
    }

    const aposta = apostaSala.apostas.find(a => a.id == apostaId);
    if (!aposta) {
        console.error("Aposta não encontrada com ID:", apostaId);
        return;
    }

    // --- CORREÇÃO: Usa getActiveUser() para aceitar convidados ---
    // Em vez de 'window.usuarioLogado', pegamos o usuário ativo (logado ou convidado)
    const usuario = getActiveUser();

    if (!usuario) {
        alert('Erro interno ao carregar o perfil de usuário/convidado.');
        return;
    }

    // Verifica se já participou (usando o email como identificador único)
    if (aposta.participantes?.some(p => p.email === usuario.email)) {
        alert('Você já está participando desta aposta!');
        return;
    }

    // Define o termo (Méritos ou Pontos)
    const tipoMoeda = usuario.isGuest ? "pontos" : "méritos";

    // Verifica mérito/pontos (para Free Bets, valor é 0, então sempre passa)
    if (aposta.valor > usuario.merito) {
        alert(`Você não tem ${tipoMoeda} suficientes!\n\n` +
              `Necessário: ${aposta.valor} ${tipoMoeda}\n` +
              `Você tem: ${usuario.merito} ${tipoMoeda}`);
        return;
    }

    // Mostra confirmação
    const confirmar = confirm(
        `Deseja participar da aposta "${aposta.titulo}"?\n\n` +
        `Valor: ${aposta.valor} ${tipoMoeda}\n` +
        `Seus ${tipoMoeda} atuais: ${usuario.merito}\n` +
        `Após aposta: ${usuario.merito - aposta.valor} ${tipoMoeda}`
    );

    if (confirmar) {
        // Chama a função 'confirmarParticipacaoAposta' (que é async)
        // Não precisamos de 'await' aqui, pois ela pode rodar em segundo plano
        // após o usuário confirmar no 'confirm()'.
        confirmarParticipacaoAposta(cardId, apostaId, usuario);
    }
}

