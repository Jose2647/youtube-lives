// Esta função APENAS constrói o HTML do modal e o exibe
function abrirChatModal() {
  if (chatModalAberto) return;

  chatModalElement = document.createElement('div');
  chatModalElement.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5); z-index: 10000; display: flex;
    justify-content: center; align-items: center;
  `;

  const modalContent = document.createElement('div');
   // ADICIONE ESTA LINHA:
  modalContent.id = 'chatWebRTCModalScope';
  modalContent.style.cssText = `
    background: white; padding: 20px; border-radius: 10px;
    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;`;
  closeButton.onclick = fecharChatModal;
  // Em abrirChatModal(), substitua a const chatHTML por esta:

  const chatHTML = `
    <div id="container">
      <h1>WebRTC Voice & Text Chat</h1>
      <p>Comunicação P2P. Sala atual (foco): <span id="currentRoomDisplay">${currentGameId}</span></p>
      
      <div id="roomsContainer" style="margin-bottom: 10px;">
        <label for="roomsSelect">Salas disponíveis:</label>
        <select id="roomsSelect"></select>
        <button id="joinRoomButton">Trocar Foco</button>
        <button id="createRoomButton">Criar Nova Sala</button>
        <button id="leaveRoomButton" class="btn-perigo">Sair da Sala Atual</button>
      </div>

      <div id="usuariosContainer" style="margin-bottom: 10px;">
        <label for="usuariosSelect">Usuários conectados:</label>
        <select id="usuariosSelect">
          <option value="">Selecione um usuário</option>
        </select>
        <button id="verPerfilUsuarioButton" class="btn-sucesso">Ver Perfil</button>
      </div>

      <div id="video-streams">
        <audio id="localVideo" playsinline autoplay muted style="display:none;"></audio>
        <div id="remoteContainer"></div>
      </div>
      
      <div class="box">
        <button id="startButton">Start (Obter Áudio)</button>
      </div>
      
      <div id="chatContainer">
        <h3>Chat de Texto P2P (Sala: ${currentGameId})</h3>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Digite sua mensagem..." disabled>
        
        <div class="chat-button-group">
          <button id="sendButton" disabled>Enviar Texto</button>
          <button id="sendShareButton" class="btn-aviso" disabled>
            Compartilhar Item
          </button>
        <!--  <button id="sendCustomDataButton" disabled>Sync Dados</button>
          <input type="file" id="comprovanteInput" accept="image/*"> 
          <button id="sendComprovanteButton" disabled>Enviar Comprovante PIX</button>
          -->
        </div>
        
      </div>

    </div>
  `;
  modalContent.innerHTML = chatHTML;
  modalContent.appendChild(closeButton);
  chatModalElement.appendChild(modalContent);
  document.body.appendChild(chatModalElement);
  chatModalAberto = true;

  console.log('[MODAL] Modal de chat aberto');

  // inicializa elementos e listeners
  setTimeout(() => {
    initChatUI();
    const sendComprovanteButton = document.getElementById('sendComprovanteButton');
      if (sendComprovanteButton) {
  sendComprovanteButton.addEventListener('click', sendComprovante);
}
    // <<< FIM DO BLOCO >>>
    // Atualiza a lista de salas no dropdown
    loadRoomsList(); 
    // Atualiza o <select> para garantir que a sala atual esteja selecionada
    if (roomsSelect) roomsSelect.value = currentGameId;
  }, 50);


// Preenche o select com os usuários do sistema
const usuariosSelect = modalContent.querySelector("#usuariosSelect");
const verPerfilUsuarioButton = modalContent.querySelector("#verPerfilUsuarioButton");

if (usuariosSelect && dados.usuarios && dados.usuarios.length > 0) {
  dados.usuarios.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.usuario;
    opt.textContent = u.nome || u.usuario;
    usuariosSelect.appendChild(opt);
  });
}

if (verPerfilUsuarioButton) {
  verPerfilUsuarioButton.addEventListener("click", () => {
    const usuarioSelecionado = usuariosSelect.value;
    if (!usuarioSelecionado) {
      alert("Selecione um usuário para ver o perfil.");
      return;
    }
    abrirModalPerfilUsuario(usuarioSelecionado);
  });
}

/*
// === BLOCO DE SELECTS GENÉRICOS (ocultável) ===
const toggleBtn = document.createElement("button");
toggleBtn.id = "toggleSelectsButton";
toggleBtn.textContent = "▾ Ocultar Seletores";
toggleBtn.style.cssText = `
  background: #333; color: white; border: none;
  border-radius: 5px; padding: 6px 10px; cursor: pointer;
  width: 100%; margin-top: 10px; margin-bottom: 5px;
`;
toggleBtn.onclick = toggleSelectsContainer;

const selectsContainer = document.createElement("div");
selectsContainer.id = "selectsContainer";
selectsContainer.style.cssText = `
  margin-top: 5px;
  display: block;
  transition: all 0.3s ease;
`;

// Adiciona os selects dentro do container
selectsContainer.appendChild(criarSelectGenerico("jogo", dados.jogos, { nome: "nome" }));
selectsContainer.appendChild(criarSelectGenerico("aposta", dados.apostasUsuarios, { nome: "titulo" }));
selectsContainer.appendChild(criarSelectGenerico("desafio", dados.desafiosUsuarios, { nome: "titulo" }));
selectsContainer.appendChild(criarSelectGenerico("chat", dados.chats, { nome: "cardId" }));

// Adiciona o botão e o container ao modal
modalContent.appendChild(toggleBtn);
modalContent.appendChild(selectsContainer);

modalContent.appendChild(selectsContainer);

*/
  // fecha modal ao clicar fora
  chatModalElement.onclick = function(e) {
    if (e.target === chatModalElement) fecharChatModal();
  };
}
function abrirModalPerfilUsuario(usuarioIdOuNome) {
  const usuario = dados.usuarios.find(
    u => u.usuario === usuarioIdOuNome || u.nome === usuarioIdOuNome
  );
  if (!usuario) {
    alert("Usuário não encontrado!");
    return;
  }

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center;
    align-items: center; z-index: 10001;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: white; border-radius: 10px; padding: 20px;
    width: 300px; max-width: 90%;
  `;

  content.innerHTML = `
    <h2>${usuario.nome}</h2>
    <img src="${usuario.imagem || 'default-usuario.png'}" 
         alt="${usuario.nome}" 
         style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:10px;">
    <p><strong>Usuário:</strong> ${usuario.usuario}</p>
    <p><strong>Mérito:</strong> ${usuario.merito || 0}</p>
    <p><strong>Desafios cumpridos:</strong> ${usuario.desafiosCumpridos || 0}</p>
    <p><strong>Pagamentos realizados:</strong> ${usuario.pagamentosRealizados || 0}</p>
    <p><strong>Amigos:</strong> ${(usuario.amigos && usuario.amigos.length) || 0}</p>
    <button id="fecharPerfilModal" style="margin-top:10px;">Fechar</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.querySelector("#fecharPerfilModal").onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}
function criarSelectGenerico(tipo, lista, campos = {}) {
  const container = document.createElement("div");
  container.style.marginBottom = "10px";

  const label = document.createElement("label");
  label.textContent = `Selecionar ${tipo}:`;
  label.style.display = "block";
  label.style.marginBottom = "5px";

  const select = document.createElement("select");
  select.id = `select-${tipo}`;
  select.style.width = "100%";
  select.innerHTML = `<option value="">Selecione um ${tipo}</option>`;

  if (lista && lista.length > 0) {
    console.log("____________lista",lista)
    lista.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.id || item.cardId || item.usuario || item.nome || item.titulo || "";
      opt.textContent = item[campos.nome] || item.nome || item.titulo || item.usuario || `(${tipo} sem nome)`;
      select.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.textContent = "Nenhum disponível";
    select.appendChild(opt);
  }

  const button = document.createElement("button");
  button.textContent = `Ver ${tipo}`;
  button.style.cssText = `
    background-color: #4CAF50; color: white; margin-top: 5px; width: 100%;
    border: none; border-radius: 5px; padding: 8px; cursor: pointer;
  `;

  button.addEventListener("click", () => {
    const valor = select.value;
    if (!valor) {
      alert(`Selecione um ${tipo} para ver detalhes`);
      return;
    }
  abrirModalGenerico(tipo, valor);
  });

  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(button);
  return container;
}
function getCurrentGameId() {
  // 'currentGameId' agora é a variável de estado principal
  return currentGameId || 'default_room';
}
function abrirModalGenerico(tipo, idOuNome) {
  let item = null;
  switch (tipo) {
    case "usuario":
      item = dados.usuarios.find(u => u.usuario === idOuNome || u.nome === idOuNome);
      break;
    case "jogo":
      item = dados.jogos.find(j => j.id == idOuNome || j.nome === idOuNome || j.titulo === idOuNome);
      break;
    case "aposta":
      item = dados.apostasUsuarios.find(a => a.id == idOuNome || a.cardId === idOuNome);
      break;
    case "desafio":
      item = dados.desafiosUsuarios.find(d => d.id == idOuNome || d.cardId === idOuNome);
      break;
    case "chat":
      item = dados.chats.find(c => c.cardId === idOuNome);
      break;
  }

  if (!item) {
    alert(`${tipo} não encontrado!`);
    return;
  }

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center;
    align-items: center; z-index: 11000;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: white; border-radius: 10px; padding: 20px;
    width: 400px; max-width: 90%; max-height: 80%; overflow-y: auto;
  `;

  const titulo = item.nome || item.titulo || tipo.toUpperCase();
  content.innerHTML = `
    <h2>${titulo}</h2>
    <pre style="background:#f4f4f4; padding:10px; border-radius:5px; overflow-x:auto;">${JSON.stringify(item, null, 2)}</pre>
    <button style="margin-top:10px;" id="fechar-${tipo}-modal">Fechar</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);
  document.getElementById(`fechar-${tipo}-modal`).onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}
function toggleSelectsContainer() {
  const container = document.getElementById("selectsContainer");
  const btn = document.getElementById("toggleSelectsButton");

  const isVisible = container.style.display === "block";
  container.style.display = isVisible ? "none" : "block";
  btn.innerHTML = isVisible ? "▸ Mostrar Seletores" : "▾ Ocultar Seletores";
}
function criarSelectApostas() {
  const container = document.createElement("div");
  container.style.marginBottom = "10px";

  const label = document.createElement("label");
  label.textContent = "Selecionar Aposta:";
  label.style.display = "block";
  label.style.marginBottom = "5px";

  const select = document.createElement("select");
  select.id = "select-aposta";
  select.style.width = "100%";
  select.innerHTML = `<option value="">Selecione uma aposta</option>`;

  if (dados.apostasUsuarios && dados.apostasUsuarios.length > 0) {
    dados.apostasUsuarios.forEach(ap => {
      const opt = document.createElement("option");
      opt.value = ap.id;
      opt.textContent = `${ap.titulo} (${ap.status})`;
      select.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.textContent = "Nenhuma aposta disponível";
    select.appendChild(opt);
  }

  const button = document.createElement("button");
  button.textContent = "Ver Detalhes da Aposta";
  button.style.cssText = `
    background-color: #4CAF50; color: white; margin-top: 5px;
    border: none; border-radius: 5px; padding: 8px; cursor: pointer;
    width: 100%;
  `;

  button.addEventListener("click", () => {
    const apostaId = select.value;
    if (!apostaId) {
      alert("Selecione uma aposta para ver detalhes");
      return;
    }
  //  abrirModalApostaDetalhada(apostaId);
  });

  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(button);
  return container;
}
function fecharChatModal() {
  if (chatModalElement && chatModalAberto) {
    // ATENÇÃO: NÃO damos hangupAll() ao fechar o modal.
    // As conexões de áudio e dados continuam ativas em segundo plano.
    // O usuário só desconecta se clicar em "Hang Up (Sair de TUDO)".
    
    document.body.removeChild(chatModalElement);
    chatModalElement = null;
    chatModalAberto = false;
    console.log('[MODAL] Modal fechado. Conexões permanecem ativas.');
  }
}