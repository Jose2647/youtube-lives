// ===== SISTEMA DE PIX UNIFICADO =====
function configurarChavePix() {
    const usuario = window.usuarioLogado || streamerLogado;
    if (!usuario) {
        alert("Faça login primeiro!");
        return;
    }
    
    const chaveAtual = usuario.chavePix || "Não configurada";
    const novaChave = prompt(`Sua chave PIX atual: ${chaveAtual}\n\nNova chave PIX (email, telefone, CPF, ou chave aleatória):\nDeixe em branco para remover:`, usuario.chavePix);
    
    if (novaChave !== null) {
        usuario.chavePix = novaChave.trim();
        salvarSessao();
        salvarDados();
        
        if (usuario.chavePix) {
            alert(`Chave PIX atualizada: ${usuario.chavePix}`);
        } else {
            alert("Chave PIX removida.");
        }
    }
}
function atualizarInterfaceLogin() {
    atualizarMenuPerfil();
    
    const floatingMenu = document.getElementById('loginFloating');
    const overlay = document.getElementById('overlay');
    if (floatingMenu) floatingMenu.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}
function atualizarMenuPerfil() {
    const floatingMenu = document.getElementById('loginFloating');
    const profileIcon = document.getElementById('profileIcon');
    
    if (!floatingMenu || !profileIcon) return;
    
    if (window.usuarioLogado || streamerLogado) {
        const usuario = window.usuarioLogado || streamerLogado;
        const tipo = window.usuarioLogado ? '👤 Usuário' : '🎥 Streamer';
        
        profileIcon.textContent = window.usuarioLogado ? '👤' : '🎥';
        profileIcon.classList.add('logged-in');
        
        floatingMenu.innerHTML = `
            <div class="user-info">
                <p class="user-name">${usuario.nome}</p>
                <p class="user-merito">${tipo} | Mérito: ${usuario.merito}</p>
            </div>
            <div class="user-actions">
                <button class="btn-profile" onclick="verPerfilCompleto(); toggleProfileMenu()">Ver Perfil</button>
                <button class="btn-pix" onclick="configurarChavePix(); toggleProfileMenu()">Configurar PIX</button>
                <button class="btn-logout" onclick="logout(); toggleProfileMenu()">Sair</button>
            </div>
        `;
    } else {
        profileIcon.textContent = '👤';
        profileIcon.classList.remove('logged-in');
        
        floatingMenu.innerHTML = `
            <div class="user-actions">
                <button class="btn-login" onclick="fazerLogin(); toggleProfileMenu()">Fazer Login</button>
            </div>
        `;
    }
}
function toggleProfileMenu() {
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
function salvarConfiguracoes() {
    adicionarNotificacao('⚙️ Configurações', 'Configurações salvas com sucesso!', 'sucesso');
}
