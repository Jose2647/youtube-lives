

function joinServerRoom(roomType, roomId) {
  if (!modalSocket) return alert('Conecte primeiro');
  const roomName = `${roomType}-${roomId}-visitante`;
  modalCurrentRoom = roomName;

  modalSocket.emit('join-' + roomType, {
    [roomType + 'Id']: roomId,
    user: modalUserName,
    merito: 'visitante'
  });

  modalSocket.emit('request-chat-history', { room: roomName });
  addModalMessage('Sistema', `Entrou na sala ${roomName}`, 'system');
}
// Função para atualizar o seletor de salas no modal
function updateModalRoomSelector() {
    const selector = document.getElementById('modalRoomSelector');
    if (!selector) return;

    selector.innerHTML = '<option value="">-- Selecionar Sala --</option>';
    
    modalActiveRooms.forEach((messages, roomName) => {
        const option = document.createElement('option');
        option.value = roomName;
        option.textContent = roomName;
        option.selected = (roomName === modalCurrentRoom);
        selector.appendChild(option);
    });
}
// Função para entrar em sala no modal
function joinModalRoom() {
    if (!modalSocket) {
        alert('Conecte primeiro');
        return;
    }

    const roomType = document.getElementById('modalRoomType').value;
    const roomId = document.getElementById('modalRoomId').value;
    const roomName = `${roomType}-${roomId}-visitante`;

    // Se já está na sala, não faz nada
    if (modalActiveRooms.has(roomName)) {
        addModalMessage('Sistema', `Já está na sala ${roomName}`, 'system');
        return;
    }

    // Entra na sala via socket
    modalSocket.emit('join-' + roomType, {
        [roomType + 'Id']: roomId,
        user: modalUserName,
        merito: 0
    });

    // Adiciona sala à lista local
    modalActiveRooms.set(roomName, []);
    
    // Se é a primeira sala, seleciona automaticamente
    if (modalActiveRooms.size === 1) {
        modalCurrentRoom = roomName;
    }

    updateModalRoomSelector();
    updateModalActiveRoomsDisplay();
    // Função para atualizar a exibição de salas ativas no modal
function updateModalActiveRoomsDisplay() {
    const display = document.getElementById('modalActiveRooms');
    if (!display) return;

    display.innerHTML = '';
    
    modalActiveRooms.forEach((messages, roomName) => {
        const roomDiv = document.createElement('div');
        roomDiv.innerHTML = `📁 ${roomName} (${messages.length} mensagens)`;
        display.appendChild(roomDiv);
    });
}
    addModalMessage('Sistema', `Entrou na sala: ${roomName}`, 'system');

    // Solicita histórico da sala
    modalSocket.emit('request-chat-history', { room: roomName });
}


// Função para criar e abrir o modal
function abrirChatModal() {
    if (chatModalAberto) return;
    
    // Cria o elemento do modal
    chatModalElement = document.createElement('div');
    chatModalElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Cria o conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    `;
    
    // Adiciona botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    `;
    closeButton.onclick = fecharChatModal;
    
    // Cria o conteúdo do chat dentro do modal
    const chatHTML = `
        <div>
            <h3>Conectar</h3>
            <input type="text" id="modalServerUrl" value="http://localhost:3000" placeholder="URL do servidor">
            <input type="text" id="modalUserName" value="UsuarioTeste" placeholder="Seu nome">
            <button onclick="connectModalSocket()">Conectar</button>
            <button onclick="disconnectModalSocket()">Desconectar</button>
        </div>

        <div>
            <h3>Entrar em Salas</h3>
            <select id="modalRoomType">
                <option value="jogo">Jogo</option>
                <option value="time">Time</option>
                <option value="live">Live</option>
            </select>
            <input type="text" id="modalRoomId" value="123" placeholder="ID">
            <button onclick="joinModalRoom()">Entrar na Sala</button>
            
            <h4>Salas Ativas:</h4>
            <div id="modalActiveRooms" style="border:1px solid #ccc; height:100px; overflow-y:scroll; padding:10px; margin:10px 0;"></div>
        </div>

        <div>
            <h3>Mensagens</h3>
            <select id="modalRoomSelector" onchange="switchModalRoom()" style="margin-bottom:10px;">
                <option value="">-- Selecionar Sala --</option>
            </select>
            <div id="modalMessages" style="border:1px solid #ccc; height:300px; overflow-y:scroll; padding:10px;"></div>
            <input type="text" id="modalMessageInput" placeholder="Digite sua mensagem" style="width:70%">
            <button onclick="sendModalMessage()">Enviar</button>
        </div>
    `;
    
    modalContent.innerHTML = chatHTML;
    modalContent.appendChild(closeButton);
    chatModalElement.appendChild(modalContent);
    document.body.appendChild(chatModalElement);
    chatModalAberto = true;
    
    // CONECTA AUTOMATICAMENTE ao abrir o modal
    setTimeout(() => {
        connectModalSocket();
    }, 100);
    
    // Fecha modal ao clicar fora
    chatModalElement.onclick = function(e) {
        if (e.target === chatModalElement) {
          document.getElementById('modalMessages').innerHTML = '';

            fecharChatModal();
        }
    };

    // Enter para enviar mensagem no modal
    setTimeout(() => {
        const modalInput = document.getElementById('modalMessageInput');
        if (modalInput) {
            modalInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendModalMessage();
                }
            });
        }
    }, 200);
}
// Função para fechar o modal
function fecharChatModal() {
    if (chatModalElement && chatModalAberto) {
        // Desconecta o socket ao fechar o modal
        disconnectModalSocket();
        
        document.body.removeChild(chatModalElement);
        chatModalElement = null;
        chatModalAberto = false;
        modalActiveRooms.clear();
        modalCurrentRoom = '';
    }
}
// Servidor de sinalização (Socket.io)
function connectChat(serverUrl, userName) {
  modalUserName = userName;
  modalSocket = io(serverUrl);

  modalSocket.on('connect', () => {
    console.log('🔗 Conectado ao servidor:', modalSocket.id);
    addModalMessage('Sistema', 'Conectado ao servidor', 'system');
  });

  modalSocket.on('disconnect', () => {
    addModalMessage('Sistema', 'Desconectado', 'system');
  });

  // Modo servidor → mensagens
  modalSocket.on('chat-message', (data) => {
    const room = getModalRoomFromData(data);
    addModalMessage(data.usuario, data.mensagem, room);
  });

  modalSocket.on('chat-history', (history) => {
    history.forEach(msg => {
      const room = getModalRoomFromData(msg);
      addModalMessage(msg.usuario, msg.mensagem, room);
    });
  });

  // WebRTC Signaling (para P2P)
  modalSocket.on('offer', async (data) => {
    console.log('📨 Offer recebida');
    remoteSocketId = data.from;
    await criarPeer(false); // receptor
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    modalSocket.emit('answer', { to: data.from, answer });
  });

  modalSocket.on('answer', async (data) => {
    console.log('📨 Answer recebida');
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  modalSocket.on('ice-candidate', async (data) => {
    try {
      await peerConnection.addIceCandidate(data.candidate);
    } catch (err) {
      console.error('Erro ao adicionar ICE:', err);
    }
  });
}
// Entrar em sala no modo servidor
function joinServerRoom(roomType, roomId) {
  if (!modalSocket) return alert('Conecte primeiro');
  const roomName = `${roomType}-${roomId}-visitante`;
  modalCurrentRoom = roomName;

  modalSocket.emit('join-' + roomType, {
    [roomType + 'Id']: roomId,
    user: modalUserName,
    merito: 'visitante'
  });

  modalSocket.emit('request-chat-history', { room: roomName });
  addModalMessage('Sistema', `Entrou na sala ${roomName}`, 'system');
}
// Enviar mensagem (modo híbrido)
function sendHybridMessage(message) {
  if (modalP2PMode && dataChannel && dataChannel.readyState === 'open') {
    const msg = { usuario: modalUserName, mensagem: message };
    dataChannel.send(JSON.stringify(msg));
  //  addModalMessage(modalUserName, message, modalCurrentRoom);
  } else {
    if (!modalSocket) return alert('Sem conexão com servidor');
    if (!modalCurrentRoom) return alert('Entre em uma sala primeiro');
    const [type, id] = modalCurrentRoom.split('-');

    const payload = {
      user: modalUserName,
      message,
      merito: 'visitante'
    };
   /* 
   if (type === 'jogo') payload.jogoId = id;
    if (type === 'time') payload.timeId = id;
    if (type === 'live') payload.liveId = id;
    */

    modalSocket.emit('chat-message', payload);
 //   addModalMessage(modalUserName, message, modalCurrentRoom);
  }
}
// =========================
// === FUNÇÕES P2P CHAT ===
// =========================
async function iniciarP2PChat(serverUrl, userName, roomType, roomId) {
  modalP2PMode = true;
  connectChat(serverUrl, userName);

  modalSocket.on('connect', async () => {
    console.log('🔗 Conectado (modo P2P)');
    modalCurrentRoom = `${roomType}-${roomId}-visitante`;

    // Entra na sala
    modalSocket.emit('join-' + roomType, {
      [roomType + 'Id']: roomId,
      user: modalUserName,
      merito: 'visitante'
    });

    // Pede lista de peers na sala
    setTimeout(() => {
      modalSocket.emit('request-peers', { room: modalCurrentRoom });
    }, 500);
  });

  // Quando o servidor responder com a lista de peers:
  modalSocket.on('peers-list', async (peers) => {
    if (peers.length === 0) {
      console.log('🟢 Sou o primeiro usuário da sala → caller');
      // Primeiro usuário — não cria offer ainda, espera o segundo entrar
    } else {
      // Já existe alguém na sala, então sou o segundo
      remoteSocketId = peers[0];
      console.log('🔵 Sou o segundo usuário → receiver de', remoteSocketId);
      await criarPeer(true); // chama o offer para o remote
    }
  });

  // Atualiza a lista de peers quando o segundo entra
  modalSocket.on('room-user-count', async ({ room, count }) => {
    if (room === modalCurrentRoom && count === 2 && !remoteSocketId) {
      console.log('👥 Dois usuários conectados, iniciando handshake...');
      modalSocket.emit('request-peers', { room: modalCurrentRoom });
    }
  });
}
async function criarPeer(isCaller = true) {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // ✅ Google STUN
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && remoteSocketId) {
      modalSocket.emit('ice-candidate', {
        to: remoteSocketId,
        candidate: event.candidate
      });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log('🌐 Estado da conexão:', peerConnection.connectionState);
  };


    if (isCaller && remoteSocketId) {
  dataChannel = peerConnection.createDataChannel('chat');
  configurarDataChannel(dataChannel);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  modalSocket.emit('offer', { to: remoteSocketId, offer });
} else {
    peerConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      configurarDataChannel(dataChannel);
    };
  }
}
function configurarDataChannel(channel) {
  channel.onopen = () => console.log('📡 Canal P2P aberto');
  channel.onclose = () => console.log('📴 Canal P2P fechado');
  channel.onmessage = (event) => {
    const data = JSON.parse(event.data);
    addModalMessage(data.usuario, data.mensagem, modalCurrentRoom);
  };
}
// =========================
// === FUNÇÕES AUXILIARES ===
// =========================
function getModalRoomFromData(data) {
  if (data.jogoId) return `jogo-${data.jogoId}-visitante`;
  if (data.timeId) return `time-${data.timeId}-visitante`;
  if (data.liveId) return `live-${data.liveId}-visitante`;
  return data.room || 'unknown';
}
async function connectModalSocket() {
  const serverUrl = document.getElementById('modalServerUrl').value;
  const userName = document.getElementById('modalUserName').value;
  const roomType = document.getElementById('modalRoomType').value;
  const roomId = document.getElementById('modalRoomId').value;

  try {
    modalP2PMode = true;
    await iniciarP2PChat(serverUrl, userName, roomType, roomId);
    console.log('✅ Modo P2P ativo');
  } catch (err) {
    console.warn('⚠️ Erro no P2P, voltando para modo servidor:', err);
    modalP2PMode = false;
    connectChat(serverUrl, userName);
    joinServerRoom(roomType, roomId);
  }
}
function addModalMessage(user, text, room) {
  const box = document.getElementById('modalMessages');
  if (!box) return;
  const div = document.createElement('div');
  div.innerHTML = `<strong>${user}:</strong> ${text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function sendModalMessage() {
  const input = document.getElementById('modalMessageInput');
  const message = input.value.trim();
  if (!message) return;
  sendHybridMessage(message);
  input.value = '';
}