
// ===== NOVAS FUNÇÕES DE UI (MANTENDO COMPATIBILIDADE) =====

function abrirModalLogin() {
    // Remove modal antigo se existir
    const modalAntigo = document.getElementById('modal-login-moderno');
    if (modalAntigo) modalAntigo.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-login-moderno';
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center;
        z-index: 10000; font-family: 'Arial', sans-serif; backdrop-filter: blur(5px);
    `;

    const content = document.createElement('div');
    content.style = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px; border-radius: 20px; width: 90%; max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: white;
        position: relative;
    `;

    content.innerHTML = `
        <button id="fechar-login" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5em; cursor: pointer;">×</button>
        
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 2.5em; margin-bottom: 10px;">🎮</div>
            <h2 style="margin: 0 0 5px 0; font-weight: 600;">Bem-vindo de Volta</h2>
            <p style="margin: 0; opacity: 0.9;">Faça login para continuar</p>
        </div>

        <form id="form-login">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">📧 Email</label>
                <input type="email" id="login-email" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="seu@email.com">
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">🔒 Senha</label>
                <input type="password" id="login-senha" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="Sua senha">
            </div>

            <button type="submit" 
                    style="width: 100%; padding: 14px; background: rgba(255,255,255,0.2); 
                           border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; 
                           color: white; font-size: 1.1em; font-weight: 600; cursor: pointer;
                           transition: all 0.3s ease; margin-bottom: 15px;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)';"
                    onmouseout="this.style.background='rgba(255,255,255,0.2)';">
                🚀 Entrar
            </button>
        </form>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0 0 15px 0; opacity: 0.8;">Não tem uma conta?</p>
            <button id="btn-criar-conta" 
                    style="padding: 12px 25px; background: transparent; border: 2px solid rgba(255,255,255,0.3); 
                           border-radius: 10px; color: white; cursor: pointer; font-weight: 500;
                           transition: all 0.3s ease;"
                    onmouseover="this.style.background='rgba(255,255,255,0.1)';"
                    onmouseout="this.style.background='transparent';">
                📝 Criar Nova Conta
            </button>
        </div>

        <div id="login-loading" style="display: none; text-align: center; margin-top: 15px;">
            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); 
                        border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span style="margin-left: 10px;">Entrando...</span>
        </div>
    `;

    // Adiciona estilo de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    modal.appendChild(content);
    document.body.appendChild(modal);

    // === EVENTOS ===
    document.getElementById('fechar-login').onclick = () => modal.remove();
    
    // Fechar modal ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.getElementById('btn-criar-conta').onclick = () => {
        modal.remove();
        abrirModalCriarConta();
    };

    document.getElementById('form-login').onsubmit = async (e) => {
        e.preventDefault();
        await processarLoginModal();
    };
}
function abrirModalCriarConta() {
    const modalAntigo = document.getElementById('modal-criar-conta');
    if (modalAntigo) modalAntigo.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-criar-conta';
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center;
        z-index: 10000; font-family: 'Arial', sans-serif; backdrop-filter: blur(5px);
    `;

    const content = document.createElement('div');
    content.style = `
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 30px; border-radius: 20px; width: 90%; max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: white;
        position: relative;
    `;

    content.innerHTML = `
        <button id="fechar-criar-conta" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5em; cursor: pointer;">×</button>
        
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 2.5em; margin-bottom: 10px;">🌟</div>
            <h2 style="margin: 0 0 5px 0; font-weight: 600;">Criar Nova Conta</h2>
            <p style="margin: 0; opacity: 0.9;">Junte-se à nossa comunidade</p>
        </div>

        <form id="form-criar-conta">
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">👤 Nome Completo</label>
                <input type="text" id="criar-nome" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="Seu nome completo">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">📧 Email</label>
                <input type="email" id="criar-email" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="seu@email.com">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">🔒 Senha</label>
                <input type="password" id="criar-senha" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="Mínimo 6 caracteres" minlength="6">
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">✅ Confirmar Senha</label>
                <input type="password" id="criar-confirmar-senha" required 
                       style="width: 100%; padding: 12px 15px; border: none; border-radius: 10px; 
                              background: rgba(255,255,255,0.9); font-size: 1em; box-sizing: border-box;"
                       placeholder="Digite a senha novamente">
            </div>

            <button type="submit" 
                    style="width: 100%; padding: 14px; background: rgba(255,255,255,0.2); 
                           border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; 
                           color: white; font-size: 1.1em; font-weight: 600; cursor: pointer;
                           transition: all 0.3s ease; margin-bottom: 15px;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)';"
                    onmouseout="this.style.background='rgba(255,255,255,0.2)';">
                🎉 Criar Conta
            </button>
        </form>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0 0 15px 0; opacity: 0.8;">Já tem uma conta?</p>
            <button id="btn-voltar-login" 
                    style="padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.3); 
                           border-radius: 8px; color: white; cursor: pointer;"
                    onmouseover="this.style.background='rgba(255,255,255,0.1)';"
                    onmouseout="this.style.background='transparent';">
                ↩️ Voltar para Login
            </button>
        </div>

        <div id="criar-conta-loading" style="display: none; text-align: center; margin-top: 15px;">
            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); 
                        border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span style="margin-left: 10px;">Criando conta...</span>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // === EVENTOS ===
    document.getElementById('fechar-criar-conta').onclick = () => modal.remove();
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.getElementById('btn-voltar-login').onclick = () => {
        modal.remove();
        abrirModalLogin();
    };

    document.getElementById('form-criar-conta').onsubmit = async (e) => {
        e.preventDefault();
        await processarCriarContaModal();
    };
}
async function processarLoginModal() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value.trim();
    const loading = document.getElementById('login-loading');
    const submitBtn = document.querySelector('#form-login button[type="submit"]');

    if (!email || !senha) {
        mostrarNotificacao('Preencha todos os campos!', 'erro');
        return;
    }

    // Mostrar loading
    submitBtn.disabled = true;
    loading.style.display = 'block';

    try {
        // Chama a função original fazerLogin com os parâmetros
        await fazerLoginComCredenciais(email, senha);
        // Fechar modal se login for bem-sucedido
        const modal = document.getElementById('modal-login-moderno');
        if (modal) modal.remove();
    } catch (error) {
        console.error('Erro no login:', error);
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
}
async function processarCriarContaModal() {
    const nome = document.getElementById('criar-nome').value.trim();
    const email = document.getElementById('criar-email').value.trim();
    const senha = document.getElementById('criar-senha').value.trim();
    const confirmarSenha = document.getElementById('criar-confirmar-senha').value.trim();
    const loading = document.getElementById('criar-conta-loading');
    const submitBtn = document.querySelector('#form-criar-conta button[type="submit"]');

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarNotificacao('Preencha todos os campos!', 'erro');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarNotificacao('As senhas não coincidem!', 'erro');
        return;
    }

    if (senha.length < 6) {
        mostrarNotificacao('A senha deve ter pelo menos 6 caracteres!', 'erro');
        return;
    }

    // Mostrar loading
    submitBtn.disabled = true;
    loading.style.display = 'block';

    try {
        // Chama a função original criarNovaConta com os parâmetros
        await criarNovaContaComCredenciais(nome, email, senha);
        // Fechar modal se criação for bem-sucedida
        const modal = document.getElementById('modal-criar-conta');
        if (modal) modal.remove();
    } catch (error) {
        console.error('Erro ao criar conta:', error);
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
}
async function fazerLogin() {
    abrirModalLogin();
}
async function fazerLoginComCredenciais(email, senha) {
  //  console.log("🔹 [LOGIN] Iniciando login com:", { email });

    try {
        const url = `${API_BASE}/api/login`;
     //   console.log("🔹 [LOGIN] Enviando requisição para:", url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

     //   console.log("🔹 [LOGIN] Status da resposta:", response.status);

        let dataText;
        try {
            dataText = await response.text();
         //   console.log("🔹 [LOGIN] Corpo cru da resposta:", dataText);
        } catch (err) {
            console.warn("⚠️ [LOGIN] Não conseguiu ler corpo cru da resposta:", err);
        }

        let data;
        try {
            data = JSON.parse(dataText);
        } catch (err) {
            console.warn("⚠️ [LOGIN] Resposta não-JSON, usando texto cru:", dataText);
            data = { message: dataText };
        }

        console.log("🔹 [LOGIN] JSON parseado:", data);

        if (!response.ok) {
            console.error("❌ [LOGIN] Servidor retornou erro:", data);
            mostrarNotificacao(data.message || 'Email ou senha inválidos.', 'erro');
            throw new Error(data.message || 'Email ou senha inválidos.');
        }

        if (data.token && data.user) {
          //  console.log("✅ [LOGIN] Login bem-sucedido! Usuário:", data.user);

            window.usuarioLogado = data.user;
            window.usuarioLogado.token = data.token;

            salvarSessao();
            mostrarNotificacao(`Bem-vindo, ${window.usuarioLogado.nome}! 🎉`, 'sucesso');
            atualizarInterfaceLogin();
        } else {
            console.warn("⚠️ [LOGIN] Resposta inesperada (sem token ou user):", data);
            mostrarNotificacao('Resposta inesperada do servidor.', 'erro');
            throw new Error('Resposta inesperada do servidor.');
        }

    } catch (err) {
        console.error('❌ [LOGIN] Erro capturado:', err);
        // Pergunta se quer criar conta apenas se for erro de credenciais
        if (err.message.includes('inválidos') && confirm("Credenciais inválidas. Deseja criar uma nova conta?")) {
            abrirModalCriarConta();
            // Preenche o email no modal de criação
            setTimeout(() => {
                const emailInput = document.getElementById('criar-email');
                if (emailInput && email) emailInput.value = email;
            }, 100);
        }
        throw err;
    }
    
    if (data.token && data.user) {
        window.usuarioLogado = data.user;
        window.usuarioLogado.token = data.token;
        salvarSessao();
        mostrarNotificacao(`Bem-vindo, ${window.usuarioLogado.nome}! 🎉`, 'sucesso');
        atualizarInterfaceLogin();  // Already here, but ensure it's async if needed
    }
}
async function criarNovaContaComCredenciais(nome, email, senha) {
    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.msg || data.message || 'Erro ao criar conta.');
        }

        if (data.token && data.user) {
            window.usuarioLogado = data.user;
            window.usuarioLogado.token = data.token;
            
            salvarSessao();
            mostrarNotificacao(`Conta criada com sucesso! Bem-vindo, ${window.usuarioLogado.nome}! 🎊\nMérito inicial: ${window.usuarioLogado.merito} pontos`, 'sucesso');
            atualizarInterfaceLogin();

        } else {
            throw new Error('Resposta inválida do servidor ao criar conta.');
        }

    } catch (err) {
        console.error('Erro ao criar conta:', err.message);
        mostrarNotificacao(`Falha ao criar conta: ${err.message}`, 'erro');
        throw err;
    }
}
async function criarNovaConta(email, senha) {
    abrirModalCriarConta();
    // Preenche os campos se fornecido
    setTimeout(() => {
        if (email) {
            const emailInput = document.getElementById('criar-email');
            if (emailInput) emailInput.value = email;
        }
        if (senha) {
            const senhaInput = document.getElementById('criar-senha');
            const confirmarInput = document.getElementById('criar-confirmar-senha');
            if (senhaInput) senhaInput.value = senha;
            if (confirmarInput) confirmarInput.value = senha;
        }
    }, 100);
}
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Se a função já existe (de outro arquivo), usa ela
    if (typeof window.mostrarNotificacao === 'function' && window.mostrarNotificacao !== mostrarNotificacao) {
        window.mostrarNotificacao(mensagem, tipo);
        return;
    }

    // Remove notificação anterior
    const notifAntiga = document.getElementById('notificacao-global');
    if (notifAntiga) notifAntiga.remove();

    const cores = {
        sucesso: '#28a745',
        erro: '#dc3545',
        info: '#17a2b8',
        aviso: '#ffc107'
    };

    const notificacao = document.createElement('div');
    notificacao.id = 'notificacao-global';
    notificacao.style = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; 
        background: ${cores[tipo] || cores.info}; color: white; border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10001; font-weight: 500;
        animation: slideInRight 0.3s ease; max-width: 400px; word-wrap: break-word;
    `;

    // Adiciona estilo de animação se não existir
    if (!document.getElementById('notificacao-animations')) {
        const style = document.createElement('style');
        style.id = 'notificacao-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);

    // Remove após 4 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }
    }, 4000);
}


////////
function estaLogado() {
    return window.usuarioLogado !== null;
}
function getToken() {
    return window.usuarioLogado ? window.usuarioLogado.token : null;
}
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}
function logout() {
  //  console.log("Fazendo logout...");
    
    // Limpa todas as variáveis de sessão
    window.usuarioLogado = null;
    
    // Limpa o sessionStorage (sessão atual)
    if (window.sessionStorage) {
        sessionStorage.removeItem('sessaoUsuario');
    }
    
    // Limpa o localStorage (dados persistentes)
    if (window.localStorage) {
        localStorage.removeItem('sistemaSessao');
        localStorage.removeItem('sistemaTransmissao');
    }
    
    // Atualiza a interface
    if (typeof atualizarInterfaceLogin === 'function') {
        atualizarInterfaceLogin();
    }
    
    // Recarrega a página para garantir estado limpo
    setTimeout(() => {
        window.location.reload();
    }, 500);
    
  //  console.log("Logout realizado com sucesso");
}
function verificarLogin() {
    if (window.usuarioLogado) {
        console.log(`Usuário logado: ${window.usuarioLogado.nome} (${window.usuarioLogado.email})`);
        return true;
    } else {
        console.log("Nenhum usuário logado");
        return false;
    }
}


//////////
//////////

function limparSessao() {
    localStorage.removeItem('sistemaSessao');
    window.usuarioLogado = null;
    streamerLogado = null;
}
//console.log("____carregamento");
function carregarSessao() {
    const sessaoSalva = localStorage.getItem('sistemaSessao');
    if (sessaoSalva) {
        const sessao = JSON.parse(sessaoSalva);
        
        const agora = new Date().getTime();
        const diffHoras = (agora - sessao.timestamp) / (1000 * 60 * 60);
        
        if (diffHoras < 24) {
            window.usuarioLogado = sessao.window.usuarioLogado;
            streamerLogado = sessao.streamerLogado;
            
            if (streamerLogado) {
                streamerLogado.online = true;
            }
        } else {
            limparSessao();
        }
    }
}
// ===== SISTEMA DE DADOS =====
function salvarDados() {
    try {
        // Salva o objeto 'dados' INTEIRO no localStorage
        localStorage.setItem('dadosApp', JSON.stringify(dados));
        
        // Atualiza a versão local para que outras partes do app saibam que mudou
        window.dados.version = Date.now();
        console.log('Dados salvos localmente.');

    } catch (err) {
        console.error('Erro ao salvar no localStorage:', err);
        // Informa o usuário se o localStorage falhar (raro, mas pode estar cheio)
        mostrarNotificacao && mostrarNotificacao('Erro ao salvar localmente!', 'erro');
    }
}
// ===== SISTEMA DE SESSÃO UNIFICADO =====
function salvarSessao() {
    if (window.sessionStorage && window.usuarioLogado) {
        sessionStorage.setItem('sessaoUsuario', JSON.stringify(window.usuarioLogado));
    }
}
// ===== RECUPERAR SESSÃO =====
function recuperarSessao() {
    if (window.sessionStorage) {
        const sessaoSalva = sessionStorage.getItem('sessaoUsuario');
        if (sessaoSalva) {
            try {
                window.usuarioLogado = JSON.parse(sessaoSalva);
             //   console.log("Sessão recuperada:", window.usuarioLogado.nome);
                
                // Atualiza a interface se a função existir
                if (typeof atualizarInterfaceLogin === 'function') {
                    setTimeout(atualizarInterfaceLogin, 100);
                }
            } catch (e) {
                console.error("Erro ao recuperar sessão:", e);
                sessionStorage.removeItem('sessaoUsuario');
            }
        }
    }
}
// ===== VERIFICAR SE USUÁRIO ESTÁ LOGADO =====
function verificarEstadoLogin() {
    if (window.usuarioLogado) {
        console.log("Usuário logado:", window.usuarioLogado.nome);
        return true;
    } else {
        console.log("Nenhum usuário logado");
        return false;
    }
}



window.verRankingUsuarios = window.verRankingUsuarios || function() {
 //   console.log('Função verRankingUsuarios não disponível ainda');
    mostrarNotificacao('Recurso em carregamento...', 'info');
};
window.verNotificacoes = window.verNotificacoes || function() {
 //   console.log('Função verNotificacoes não disponível ainda');
    mostrarNotificacao('Recurso em carregamento...', 'info');
};
window.toggleProfileMenu = window.toggleProfileMenu || function() {
  //  console.log('Função toggleProfileMenu não disponível ainda');
};

// Chamar esta função quando necessário para verificar o estado
verificarLogin();





/*


Nenhum usuário logado
______compartilhar.js
_____intreterento
DOM carregado. Iniciando sequência de inicialização única...
🚀 Inicializando sistema completo...
🎯 Inicializando sistema de apostas e desafios...
Iniciando sistema...
Dados salvos localmente.
___dados Object {apostasUsuarios: Array(1), desafiosUsuarios: Array(1), chats: Array(0), usuarios: Array(4), jogos: Array(20), …}
0: "___dados"
1: Object
length: 2
__proto__: Array(0)
_____dados.jogos (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
Sistema inicializado com sucesso
✅ Sistema de apostas inicializado!
✅ Sistema completo inicializado!
Usuário logado: test
✅ Sequência de inicialização do DOM concluída.
🔹 [LOGIN] JSON parseado: Object {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzM5NDM5MiwiZXhwIjoxNzYzNDgwNzkyfQ.91kYXlWSgv-wMmc5j71ge2kBObq5y7u_u2qmQyfpq9k", user: {…}}
0: "🔹 [LOGIN] JSON parseado:"
1: Object
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzM5NDM5MiwiZXhwIjoxNzYzNDgwNzkyfQ.91kYXlWSgv-wMmc5j71ge2kBObq5y7u_u2qmQyfpq9k"
user: Object
amigos: Array(0)
length: 0
__proto__: Array(0)
conquistas: "latão"
email: "test@gmail.com"
id: 1
imagem: "default-usuario.png"
merito: 100
nome: "test"
senha: "$2b$10$MOUAWSNuTdktyaLBl43MmewacGApmDX5D2rL7eApt.lvT02js/ONi"
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzM5NDM5MiwiZXhwIjoxNzYzNDgwNzkyfQ.91kYXlWSgv-wMmc5j71ge2kBObq5y7u_u2qmQyfpq9k"
ultimoComprovantePix: null
_id: "691b432e7008d6fbc5f00b78"
__v: 0
__proto__: Object
__proto__: Object
length: 2
__proto__: Array(0)

*/