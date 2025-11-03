// main.js (integrado para múltiplos peers com áudio + chat P2P)

/* ---------------------------
   VARIÁVEIS GLOBAIS E ESTADO
   --------------------------- */
console.log("_____dados", dados);



/* ---------------------------
   HELPERS UI: init UI quando modal aberto
   --------------------------- */
function initChatUI() {
  // Evita inicializar duas vezes
  if (!chatModalElement) return;

  startButton = document.getElementById('startButton');
  callButton = document.getElementById('callButton');
  hangupButton = document.getElementById('hangupButton');
  messageInput = document.getElementById('messageInput');
  sendButton = document.getElementById('sendButton');
  sendCustomDataButton = document.getElementById('sendCustomDataButton');
  messagesDiv = document.getElementById('messages');
  localVideo = document.getElementById('localVideo');
  remoteContainer = document.getElementById('remoteContainer'); // opcional container para múltiplos remotos

  // Protege caso elementos não existam (safety)
  if (startButton) startButton.addEventListener('click', start);
  if (callButton) callButton.addEventListener('click', callAll); // inicia offers para os peers existentes / novos
  if (hangupButton) hangupButton.addEventListener('click', hangupAll);
  if (sendButton) sendButton.addEventListener('click', sendMessage);
  if (sendCustomDataButton) sendCustomDataButton.addEventListener('click', sendCustomData);

  // inicial state
  if (startButton) startButton.disabled = false;
  if (callButton) callButton.disabled = true;
  if (hangupButton) hangupButton.disabled = true;
  if (messageInput) messageInput.disabled = true;
  if (sendButton) sendButton.disabled = true;
  if (sendCustomDataButton) sendCustomDataButton.disabled = true;

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

/* ---------------------------
   SINALIZAÇÃO / SALA
   --------------------------- */
signaling.on('connect', () => {
  currentGameId = getCurrentGameId();
  if (currentGameId) {
    signaling.emit('join_room', currentGameId);
    logMessage(`[SINALIZAÇÃO] Entrou na sala: ${currentGameId}`);
  }

  // reenvia peers existentes (caso precise)
});

signaling.on('peer_joined', async ({ peerId }) => {
  if (!peerId || peerId === signaling.id) return;
  logMessage(`Peer entrou na sala: ${peerId}`);
  // Cria conexão e (como ofertante) inicia offer para esse peer
  await createPeerConnection(peerId, true);
});

signaling.on('peer_left', ({ peerId }) => {
  if (!peerId) return;
  logMessage(`Peer saiu: ${peerId}`);
  closePeerConnection(peerId);
});

// Recebe sinais (ofertas, answers, ICE) retransmitidos pelo servidor.
// O servidor adiciona `from` (ID do remetente).
signaling.on('signal', async (message) => {
  try {
    const from = message.from;
    if (!from || from === signaling.id) return; // ignora mensagens próprias

    // Garante que exista um peer para esse `from`
    if (!peers[from]) {
      await createPeerConnection(from, false); // não ofertante (receiver)
    }
    const pc = peers[from].connection;

    if (message.type === 'offer') {
      logMessage(`Offer recebido de ${from}. Criando Answer...`);
      await pc.setRemoteDescription(new RTCSessionDescription(message));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.emit('signal', { ...answer, from: signaling.id });
    } else if (message.type === 'answer') {
      logMessage(`Answer recebido de ${from}.`);
      await pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && message.candidate) {
      // candidate recebido
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    } else {
      console.warn('Sinal desconhecido:', message);
    }
  } catch (err) {
    console.error('Erro ao processar sinal:', err);
  }
});

/* ---------------------------
   CRIAR / FECHAR PEER CONNECTIONS
   --------------------------- */
async function createPeerConnection(peerId, isOfferer) {
  if (peers[peerId]) {
    console.warn('Peer já existe:', peerId);
    return peers[peerId].connection;
  }

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  peers[peerId] = { connection: pc, dataChannel: null };

  // ICE candidates -> enviar sinalização (servidor retransmitirá para a sala)
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signaling.emit('signal', { type: 'candidate', candidate: event.candidate, from: signaling.id });
    }
  };

  // Quando receber canal remoto (quando este peer não for offerer)
  pc.ondatachannel = (event) => {
    const channel = event.channel;
    peers[peerId].dataChannel = channel;
    setupDataChannel(peerId, channel, 'Remoto');
  };

  // Quando recebe track remoto (áudio dos peers)
  pc.ontrack = (event) => {
    // Cria/atualiza elemento de áudio para esse peer
    let audioEl = document.getElementById(`audio_${peerId}`);
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = `audio_${peerId}`;
      audioEl.autoplay = true;
      audioEl.controls = false;
      if (remoteContainer) remoteContainer.appendChild(audioEl);
      else document.body.appendChild(audioEl);
    }
    audioEl.srcObject = event.streams[0];
    logMessage(`Áudio remoto recebido de ${peerId}`);
  };

  // Adiciona tracks locais (se já houver stream)
  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  // Se for o ofertante, cria data channel local e oferta
  if (isOfferer) {
    const channel = pc.createDataChannel('chatChannel', { reliable: true });
    peers[peerId].dataChannel = channel;
    setupDataChannel(peerId, channel, 'Local');

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // envia offer via sinalização (servidor retransmite para os outros peers da sala)
      signaling.emit('signal', { ...offer, from: signaling.id });
      logMessage(`Offer enviada para sala (de ${signaling.id}) para peer ${peerId}`);
    } catch (err) {
      console.error('Erro ao criar offer', err);
    }
  }

  // onconnectionstatechange
  pc.onconnectionstatechange = () => {
    logMessage(`Estado conexão ${peerId}: ${pc.connectionState}`);
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
      // limpa
      closePeerConnection(peerId);
    }
  };

  return pc;
}

function closePeerConnection(peerId) {
  const peer = peers[peerId];
  if (!peer) return;
  try {
    if (peer.dataChannel) peer.dataChannel.close();
    if (peer.connection) peer.connection.close();
  } catch (e) {
    console.warn('Erro fechando conexão:', e);
  }
  delete peers[peerId];

  // remove elemento de áudio se existir
  const audioEl = document.getElementById(`audio_${peerId}`);
  if (audioEl && audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);

  logMessage(`Conexão com ${peerId} encerrada.`);
}

/* ---------------------------
   CONFIGURAÇÃO DO DATA CHANNEL
   --------------------------- */
function setupDataChannel(peerId, channel, tipo) {
  channel.onopen = () => {
    logMessage(`[${tipo}] Canal de dados com ${peerId} aberto.`);
    // habilita UI de mensagens quando qualquer canal abrir
    if (sendButton) sendButton.disabled = false;
    if (messageInput) messageInput.disabled = false;
    if (sendCustomDataButton) sendCustomDataButton.disabled = false;
  };

  channel.onclose = () => {
    logMessage(`Canal de dados com ${peerId} fechado.`);
    // se todos fecharem, desabilita UI
    const anyOpen = Object.values(peers).some(p => p.dataChannel && p.dataChannel.readyState === 'open');
    if (!anyOpen) {
      if (sendButton) sendButton.disabled = true;
      if (messageInput) messageInput.disabled = true;
      if (sendCustomDataButton) sendCustomDataButton.disabled = true;
    }
  };

  channel.onerror = (err) => {
    console.error('DataChannel error', err);
  };

  channel.onmessage = (event) => {
    let parsed;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      parsed = null;
    }

    if (parsed && parsed.type === 'sync_data') {
      // lógica de sincronização (mantive sua ideia original)
      const payload = parsed.payload || {};
      const gameId = payload.gameId;
      if (gameId) {
        // substitui dados do jogo específico sem sobrescrever tudo
        dados.apostasUsuarios = dados.apostasUsuarios.filter(a => a.jogoId !== gameId);
        dados.desafiosUsuarios = dados.desafiosUsuarios.filter(d => d.jogoId !== gameId);
        dados.chats = dados.chats.filter(c => c.jogoId !== gameId);

        if (payload.apostasUsuarios) dados.apostasUsuarios.push(...payload.apostasUsuarios);
        if (payload.desafiosUsuarios) dados.desafiosUsuarios.push(...payload.desafiosUsuarios);
        if (payload.chats) dados.chats.push(...payload.chats);

        dados.version = parsed.version || Date.now();
        salvarDados();
        logMessage(`[LOG] Sincronização recebida do peer ${peerId} (Jogo ${gameId}).`);
      }
      return;
    }

    // Caso padrão: tratar como mensagem de chat
    if (parsed && parsed.sender && parsed.text) {
      displayMessage(parsed.sender, parsed.text);
    } else {
      displayMessage(peerId, event.data);
    }
  };
}

/* ---------------------------
   FUNÇÕES DE ÁUDIO E CHAMADA
   --------------------------- */
async function start() {
  startButton && (startButton.disabled = true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStream = stream;

    // mostra local audio (muted)
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.muted = true;
    }

    // Adiciona as tracks locais a todas as conexões já existentes
    Object.values(peers).forEach(({ connection }) => {
      try {
        localStream.getTracks().forEach(track => connection.addTrack(track, localStream));
      } catch (e) {
        console.warn('Erro adicionando track a conexão existente', e);
      }
    });

    callButton && (callButton.disabled = false);
    hangupButton && (hangupButton.disabled = false);
    logMessage('Microfone ativado. Você pode iniciar chamadas P2P (as ofertas serão enviadas).');
  } catch (e) {
    console.error('getUserMedia erro:', e);
    alert('Erro ao acessar o microfone: ' + (e.message || e.name));
    startButton && (startButton.disabled = false);
  }
}

// Quando usuário quer iniciar ofertas para todos (útil se já houver peers)
async function callAll() {
  // para cada peer sem dataChannel aberto, cria offer (se ainda não tiver sido ofertado)
  const peerIds = Object.keys(peers);
  for (const peerId of peerIds) {
    const peer = peers[peerId];
    if (!peer) continue;
    // se dataChannel já existir e aberto, ignora
    if (peer.dataChannel && peer.dataChannel.readyState === 'open') continue;
    // tenta recriar offer (ser ofertante)
    try {
      await createPeerConnection(peerId, true);
    } catch (e) {
      console.warn('Erro criando offer para', peerId, e);
    }
  }
}

function hangupAll() {
  // fecha todas as conexões
  Object.keys(peers).forEach(peerId => closePeerConnection(peerId));

  // para local stream
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }

  if (localVideo) localVideo.srcObject = null;

  if (startButton) startButton.disabled = false;
  if (callButton) callButton.disabled = true;
  if (hangupButton) hangupButton.disabled = true;
  if (sendButton) sendButton.disabled = true;
  if (messageInput) messageInput.disabled = true;
  if (sendCustomDataButton) sendCustomDataButton.disabled = true;

  logMessage('Todas as conexões encerradas.');
}

/* ---------------------------
   CHAT / MENSAGENS P2P
   --------------------------- */
function sendMessage() {
  const text = messageInput ? messageInput.value.trim() : '';
  if (!text) return;
  const message = { sender: 'Você', text, timestamp: Date.now() };

  // envia para TODOS os peers via seus data channels
  Object.values(peers).forEach(({ dataChannel }) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(message));
    }
  });

  // salva localmente também
  if (!dados.chats) dados.chats = [];
  dados.chats.push({ sender: 'Você', content: text, jogoId: getCurrentGameId(), timestamp: Date.now() });
  salvarDados();

  displayMessage('Você', text);
  if (messageInput) messageInput.value = '';
}

function sendDataChannelObjectToAll(obj) {
  const json = JSON.stringify(obj);
  Object.values(peers).forEach(({ dataChannel }) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(json);
    }
  });
}

// Função chamada pelo botão "Enviar Objeto Customizado"
function sendCustomData() {
  // exemplo: adiciona usuário e sincroniza
  const newUserId = (dados.usuarios && dados.usuarios.length) ? dados.usuarios.length + 1 : 1;
  if (!dados.usuarios) dados.usuarios = [];
  const newUser = { id: newUserId, usuario: `peer_sync_${newUserId}`, role: 'sincronizado', timestamp: Date.now() };
  dados.usuarios.push(newUser);
  salvarDados();

  // cria payload filtrado e envia como 'sync_data'
  const payload = getFilteredDataByGameId(getCurrentGameId());
  const syncObject = { type: 'sync_data', payload: payload, version: Date.now(), gameId: getCurrentGameId() };
  sendDataChannelObjectToAll(syncObject);

  displayMessage('Você (Sistema)', `Simulação: novo usuário ${newUser.usuario} adicionado e sincronizado.`);
}

/* ---------------------------
   FUNÇÕES AUXILIARES (mantive sua API)
   --------------------------- */
function displayMessage(sender, text) {
  if (!messagesDiv) {
    console.log(`${sender}: ${text}`);
    return;
  }
  const messageElement = document.createElement('p');
  messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function logMessage(text) {
  if (!messagesDiv) {
    console.log('[LOG]', text);
    return;
  }
  const logElement = document.createElement('p');
  logElement.style.fontStyle = 'italic';
  logElement.style.fontSize = '0.8em';
  logElement.textContent = `[LOG] ${text}`;
  messagesDiv.appendChild(logElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* ---------------------------
   LÓGICA DE DADOS (mantida)
   --------------------------- */
function getFilteredDataByGameId(gameId) {
  if (!gameId) return dados;
  const filteredPayload = {
    usuarios: (dados.usuarios || []).filter(u => u.jogoId === gameId || u.jogoId === undefined),
    apostasUsuarios: (dados.apostasUsuarios || []).filter(a => a.jogoId === gameId),
    desafiosUsuarios: (dados.desafiosUsuarios || []).filter(d => d.jogoId === gameId),
    chats: (dados.chats || []).filter(c => c.jogoId === gameId),
    jogos: (dados.jogos || []).filter(j => j.id === gameId),
    transacoes: dados.transacoes || []
  };
  return filteredPayload;
}

function syncDataToPeers() {
  // salva localmente
  salvarDados();

  const gameId = getCurrentGameId();
  const filteredPayload = getFilteredDataByGameId(gameId);
  const syncObject = { type: 'sync_data', payload: filteredPayload, version: Date.now(), gameId: gameId };
  sendDataChannelObjectToAll(syncObject);
  logMessage(`[LOG] Dados do Jogo ${gameId} sincronizados com peers.`);
}

/* ---------------------------
   FUNÇÕES DO MODAL (mantidas/adaptadas)
   --------------------------- */
function abrirChatModal() {
  if (chatModalAberto) return;

  chatModalElement = document.createElement('div');
  chatModalElement.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5); z-index: 10000; display: flex;
    justify-content: center; align-items: center;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white; padding: 20px; border-radius: 10px;
    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;`;
  closeButton.onclick = fecharChatModal;

  const chatHTML = `
    <div id="container">
      <h1>WebRTC Voice & Text Chat</h1>
      <p>Comunicação P2P de Áudio e Texto via WebRTC.</p>
      <div id="video-streams">
        <audio id="localVideo" playsinline autoplay muted class="video-hidden"></audio>
        <div id="remoteContainer"></div>
      </div>
      <div class="box">
        <button id="startButton">Start (Obter Áudio)</button>
        <button id="callButton">Call (Enviar Offers)</button>
        <button id="hangupButton">Hang Up</button>
      </div>
      <div id="chatContainer">
        <h3>Chat de Texto P2P</h3>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Digite sua mensagem..." disabled>
        <div style="display: flex; gap: 10px; margin-top: 5px;">
          <button id="sendButton" disabled style="flex-grow: 1;">Enviar Texto</button>
          <button id="sendCustomDataButton" disabled style="flex-grow: 1;">Enviar Objeto Customizado</button>
        </div>
      </div>
      <p>Verifique o console para logs de conexão.</p>
    </div>
  `;

  modalContent.innerHTML = chatHTML;
  modalContent.appendChild(closeButton);
  chatModalElement.appendChild(modalContent);
  document.body.appendChild(chatModalElement);
  chatModalAberto = true;

  // inicializa elementos e listeners
  setTimeout(() => {
    initChatUI();
  }, 50);

  // fecha modal ao clicar fora
  chatModalElement.onclick = function(e) {
    if (e.target === chatModalElement) fecharChatModal();
  };
}

function fecharChatModal() {
  if (chatModalElement && chatModalAberto) {
    // fecha conexões abertas somente do modal (opcional)
    // disconnectModalSocket(); // se você tiver lógica separada

    // remove modal
    document.body.removeChild(chatModalElement);
    chatModalElement = null;
    chatModalAberto = false;
    // NOTA: não desconectamos peers automaticamente, deixamos o usuário hangupAll() manualmente ou ao sair da sala
  }
}

/* ---------------------------
   UTILITÁRIAS
   --------------------------- */
function getCurrentGameId() {
  return window.salaAtual || (dados.jogos && dados.jogos[0] && dados.jogos[0].id);
}

// Se desejar abrir o modal automaticamente:
 // abrirChatModal();

/* ---------------------------
   FIM DO ARQUIVO
   --------------------------- */
