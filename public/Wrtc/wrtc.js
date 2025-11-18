
function initChatUI() {
  let leaveRoomButton = document.getElementById('leaveRoomButton'); // <-- ADICIONE ESTA LINHA
  // Evita inicializar duas vezes
  if (!chatModalElement) return;

  startButton = document.getElementById('startButton');
  messageInput = document.getElementById('messageInput');
  sendButton = document.getElementById('sendButton');
  sendCustomDataButton = document.getElementById('sendCustomDataButton');
  messagesDiv = document.getElementById('messages');
  localVideo = document.getElementById('localVideo');
  remoteContainer = document.getElementById('remoteContainer'); // opcional container para múltiplos remotos
  roomsSelect = document.getElementById('roomsSelect'); // Novo: select para salas
  joinRoomButton = document.getElementById('joinRoomButton'); // Novo: botão para join sala
  createRoomButton = document.getElementById('createRoomButton'); // Novo botão para criar sala
const sendShareButton = document.getElementById('sendShareButton');
const sendComprovanteButton = document.getElementById('sendComprovanteButton');


  console.log('[UI] Inicializando elementos UI:', { startButton,  createRoomButton }); // Log adicionado para depurar UI

  // Protege caso elementos não existam (safety)
  if (startButton) startButton.addEventListener('click', start);
  if (sendButton) sendButton.addEventListener('click', sendMessage);
  if (sendCustomDataButton) sendCustomDataButton.addEventListener('click', sendCustomData);

  // Novo: listeners para seleção de sala e criação
  if (joinRoomButton) joinRoomButton.addEventListener('click', joinSelectedRoom);
  if (createRoomButton) createRoomButton.addEventListener('click', handleCreateRoom);

  // inicial state
  if (startButton) startButton.disabled = false;
  //if (callButton) callButton.disabled = true;
  //if (hangupButton) hangupButton.disabled = true;
  if (messageInput) messageInput.disabled = true;
  if (sendButton) sendButton.disabled = true;
  if (sendCustomDataButton) sendCustomDataButton.disabled = true;
  // ADICIONE ESTE BLOCO
  if (leaveRoomButton) {
    leaveRoomButton.addEventListener('click', () => {
      const roomToLeave = getCurrentGameId();
      if (!roomToLeave || roomToLeave === 'default_room') {
        alert('Você não pode sair da sala padrão.');
        return;
      }
      if (confirm(`Tem certeza que deseja sair da sala "${roomToLeave}"?`)) {
        leaveIndividualRoom(roomToLeave);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
  if (sendComprovanteButton) sendComprovanteButton.disabled = true; // Inicialmente desabilitado
    
    // ADICIONE ESTA LINHA:
if (sendShareButton) sendShareButton.addEventListener('click', sendShareMessage);

  // Carrega lista de salas ao iniciar UI
  loadRoomsList();
}

signaling.on('connect', () => {
    logMessage('[SINALIZAÇÃO] Conectado ao servidor.');


    // Inicializa salas com base nos dados (se 'dados' estiver pronto)
    if (dados && dados.jogos!== []) {
         initializeRoomsFromDados();
    } else {
         console.warn('[AUTO-ROOM] Variável "dados" não está pronta, salas não foram inicializadas.');
    }
    
    // Carrega a lista de salas para o dropdown
    loadRoomsList();
  });
signaling.on('existing_peers_in_room', async ({ roomId, peerIds }) => {
  console.log(`[SIGNALING] Recebidos ${peerIds.length} peers existentes na sala ${roomId}`);

  for (const peerId of peerIds) {
    if (peerId === signaling.id) continue;

    // Se já temos, apenas adiciona a sala
    if (peers[peerId]) {
      peers[peerId].rooms.add(roomId);
      console.log(`[PEER] Peer ${peerId} já existe. Adicionando sala ${roomId}.`);
    } else {
      // Se não temos, cria a conexão (como ofertante)
      console.log(`[PEER] Criando nova conexão (oferta) para ${peerId} na sala ${roomId}`);
      await createPeerConnection(peerId, true); // Cria como ofertante
      // Adiciona a sala ao rastreador (após createPeerConnection criar o objeto)
      if (peers[peerId]) {
        peers[peerId].rooms.add(roomId);
      }
    }
  }
  // Isso substitui a necessidade do botão "Call All"
 // if (callButton) callButton.disabled = true; // Desabilita o botão 'Call'
  logMessage(`Conectado a ${peerIds.length} peers existentes na sala ${roomId}.`);
});
signaling.on('peer_joined', async ({ peerId, roomId }) => {
  if (!peerId || peerId === signaling.id) return;

  // const roomOfEntry = getCurrentGameId(); // <-- REMOVIDO
  const roomOfEntry = roomId; // <-- CORRETO: Usa o 'roomId' do evento!
  
  logMessage(`Peer entrou na sala ${roomOfEntry}: ${peerId}`);
  console.log(`[SIGNALING] Peer joined ${peerId} (in room ${roomOfEntry})`);

  if (peers[peerId]) {
    peers[peerId].rooms.add(roomOfEntry);
    console.log(`[PEER] Peer ${peerId} já existe. Adicionando sala ${roomOfEntry}.`);
    return;
  }

  // Se o peer é novo, cria a conexão (como não-ofertante)
  await createPeerConnection(peerId, false); // Cria como não-ofertante

  if (peers[peerId]) {
    peers[peerId].rooms.add(roomOfEntry);
  }
});
signaling.on('peer_left', ({ peerId, roomId }) => {
  if (!peerId || !peers[peerId]) return;
  const roomOfExit = roomId; 
  logMessage(`Peer saiu da sala ${roomOfExit}: ${peerId}`);
  console.log(`[SIGNALING] Peer left ${peerId} (from room ${roomOfExit})`);
  if (!peers[peerId].rooms.has(roomOfExit)) {
      console.warn(`[PEER] Recebido 'peer_left' para ${peerId} da sala ${roomOfExit}, mas não o rastreávamos lá.`);
      return;
  }
  peers[peerId].rooms.delete(roomOfExit);
 if (peers[peerId].rooms.size === 0) {
    console.log(`[PEER] Não há mais salas em comum com ${peerId}. Fechando conexão.`);
    closePeerConnection(peerId);
  } else {
    console.log(`[PEER] Peer ${peerId} saiu da ${roomOfExit}, mas continua em outras salas.`);
  }
});
signaling.on('rooms_list', (rooms) => {
  populateRoomsSelect(rooms);
});
signaling.on('signal', async (message) => {
  console.log('[SIGNALING] Sinal recebido:', message);
  try {
    const from = message.from;
    if (!from || from === signaling.id) return; 
    if (message.to && message.to !== signaling.id) return;
    if (!peers[from]) {
      await createPeerConnection(from, false);
    }
    const pc = peers[from].connection;
    if (message.type === 'offer') {
      logMessage(`Offer recebido de ${from}. Criando Answer...`);
      await pc.setRemoteDescription(new RTCSessionDescription(message));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.emit('signal', { ...answer, to: from, from: signaling.id });
      console.log('[SIGNALING] Answer enviado para:', from); // Log adicionado
    } else if (message.type === 'answer') {
      logMessage(`Answer recebido de ${from}.`);
      await pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && message.candidate) {
      // candidate recebido
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      console.log('[ICE] Candidate adicionado de:', from); // Log adicionado
    } else {
      console.warn('Sinal desconhecido:', message);
    }
  } catch (err) {
    console.error('Erro ao processar sinal:', err);
  }
});
async function createPeerConnection(peerId, isOfferer) {
  if (peers[peerId]) {
    console.warn('Peer já existe:', peerId);
    return peers[peerId].connection;
  }

  console.log('[PEER] Criando conexão para peer:', peerId, 'isOfferer:', isOfferer);

  const pc = new RTCPeerConnection(pcConfig);
//  peers[peerId] = { connection: pc, dataChannel: null };
// LINHA CORRETA ( SUBSTITUA PELA ABAIXO):
  peers[peerId] = { connection: pc, dataChannel: null, rooms: new Set() }; // <-- ADICIONA .rooms

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signaling.emit('signal', { type: 'candidate', candidate: event.candidate, to: peerId, from: signaling.id });
    }
  };

  pc.ondatachannel = (event) => {
    const channel = event.channel;
    peers[peerId].dataChannel = channel;
    setupDataChannel(peerId, channel, 'Remoto');
    console.log('[DATACHANNEL] Canal remoto recebido de:', peerId);
  };

  pc.ontrack = (event) => {
    console.log('[TRACK] Track remoto recebido de:', peerId, event);
    let audioEl = document.getElementById(`audio_${peerId}`);
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = `audio_${peerId}`;
      audioEl.autoplay = true;
    //  audioEl.controls = false; // Mantenha false para não poluir UI
      audioEl.controls = true; // Mantenha false para não poluir UI
      if (remoteContainer) remoteContainer.appendChild(audioEl);
      else document.body.appendChild(audioEl);
    }
    audioEl.srcObject = event.streams[0];
  };

  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  if (isOfferer) {
    const channel = pc.createDataChannel('chatChannel', { reliable: true });
    peers[peerId].dataChannel = channel;
    setupDataChannel(peerId, channel, 'Local');

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signaling.emit('signal', { ...offer, to: peerId, from: signaling.id });
      console.log('[SDP] Offer criada e enviada para:', peerId);
    } catch (err) {
      console.error('Erro ao criar offer', err);
    }
  }

  pc.onconnectionstatechange = () => {
    console.log('[PEER] Connection state changed:', pc.connectionState, 'para peer:', peerId);
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
      closePeerConnection(peerId);
    }
  };

  return pc;
}
function closePeerConnection(peerId) {
  const peer = peers[peerId];
  if (!peer) return;
  console.log('[PEER] Fechando conexão para:', peerId);
  try {
    if (peer.dataChannel) peer.dataChannel.close();
    if (peer.connection) peer.connection.close();
  } catch (e) {
    console.warn('Erro fechando conexão:', e);
  }
  delete peers[peerId];

  const audioEl = document.getElementById(`audio_${peerId}`);
  if (audioEl && audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);

  logMessage(`Conexão com ${peerId} encerrada.`);
}
function handleShareProposal(msg) {
    const { senderName, itemType, itemName, payload } = msg;

    if (!payload) {
        console.error("Proposta de compartilhamento recebida sem payload.", msg);
        return;
    }
    
    // Se a proposta é enviada para a sala, mas não para o usuário, pode ser uma notificação geral.
    // Presumimos que quem recebe esta mensagem deve ser o destinatário.

    const confirmMessage = `${senderName} quer compartilhar um item com você:\n
Tipo: ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}
Nome: ${itemName}\n
Você aceita adicionar este item aos seus dados?
(Isso será salvo localmente e recarregará a seção)`;

    // 1. Pergunta ao usuário
    if (confirm(confirmMessage)) {
        try {
            // 2. PREPARA AS VARIÁVEIS GLOBAIS (clipboard) DO SEU CÓDIGO para a função colarItem
            clipboard.tipo = itemType;
            clipboard.dados = JSON.parse(payload); 
            
            // 3. CHAMA A SUA FUNÇÃO ORIGINAL DE COLAR
            // Note: Não passamos parentIds, o que só permite colar itens de nível superior (Jogo).
            // Para outros tipos, seria necessário garantir que os pais existam ANTES de colar.
            const novoItem = colarItem(dados, itemType); 

            if (novoItem) {
                // Se colou, salva e recarrega a lista
                salvarDados();
                // Assumindo que carregarJogos() recarrega a seção correta
                if (itemType === 'jogo' && typeof carregarJogos === 'function') {
                    carregarJogos();
                }
                
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao(`'${itemName}' de ${senderName} foi adicionado com sucesso!`, 'sucesso');
                }
            } else {
                 // A função colarItem já deve ter exibido um alerta
                 // Isso pode acontecer se o tipo for incompatível ou houver um erro interno
            }

        } catch (err) {
            console.error("Erro fatal ao processar e colar item recebido:", err);
            alert("Ocorreu um erro fatal ao tentar adicionar o item recebido.");
        }
        
        // Limpar o clipboard global após tentativa (opcional, dependendo do seu código)
        clipboard.tipo = null;
        clipboard.dados = null;
        
    } else {
        // Usuário recusou
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(`Você recusou o compartilhamento de '${itemName}'.`, 'info');
        }
    }
}
function setupDataChannel(peerId, channel, tipo) {
  // Em setupDataChannel, modifique o onopen para habilitar também o sendShareButton:
channel.onopen = () => {
    logMessage(`[${tipo}] Canal de dados com ${peerId} aberto.`);
    if (sendButton) sendButton.disabled = false;
    if (messageInput) messageInput.disabled = false;
    if (sendCustomDataButton) sendCustomDataButton.disabled = false;
    if (sendShareButton) sendShareButton.disabled = false; // ADICIONE ESTA LINHA
};

  channel.onclose = () => {
    logMessage(`Canal de dados com ${peerId} fechado.`);
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

  // ------------------------------------
  //   A MUDANÇA ESTÁ AQUI DENTRO
  // ------------------------------------
  channel.onmessage = (event) => {
    console.log('[DATACHANNEL] Mensagem recebida de:', peerId, event.data);
    let parsed;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      parsed = null;
    }

    if (!parsed) {
        // Mensagem de texto puro (sem JSON)
        displayMessage(peerId, event.data);
        return;
    }

    // --- NOVO BLOCO ---
    // Verifica se é uma proposta de compartilhamento
    if (parsed.type === "share_proposal") {
        // handleShareProposal é a função da MINHA RESPOSTA ANTERIOR
        handleShareProposal(parsed); 
        return; // Mensagem tratada, não faz mais nada
    }
    // --- FIM DO NOVO BLOCO ---


    // LÓGICA DE SINCRONIZAÇÃO DE DADOS (Sua lógica existente)
    if (parsed.type === 'sync_data') { //
      const payload = parsed.payload || {};
      const gameId = parsed.gameId; 
      if (gameId && parsed.version > (dados.version || 0)) {
        // ... (sua lógica de sync de dados) ...
        dados.version = parsed.version || Date.now();
        logMessage(`[LOG] Sincronização recebida do peer ${peerId} (Jogo ${gameId}).`);
      }
      return;
    }

    // LÓGICA DE CHAT MULTI-SALA (Sua lógica existente)
    if (parsed.roomId) { //
        if (parsed.roomId === getCurrentGameId()) {
            displayMessage(parsed.sender || peerId, parsed.text);
        } else {
            console.log(`[CHAT] Mensagem recebida de ${peerId} na sala ${parsed.roomId} (não exibida, sala inativa)`);
        }
    } else if (parsed.sender && parsed.text) { //
        displayMessage(parsed.sender, parsed.text);
    }
  };
}
async function start() {
  if (startButton) startButton.disabled = true;
  console.log('[AUDIO] Iniciando getUserMedia...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStream = stream;

    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.muted = true;
    }

    // Adiciona tracks locais a TODAS as conexões P2P existentes
    for (const peerId in peers) {
      const pc = peers[peerId].connection;
      try {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        // Renegocia (opcional, mas recomendado se a track foi adicionada depois)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signaling.emit('signal', { ...offer, to: peerId, from: signaling.id });
      } catch (e) {
        console.warn('Erro adicionando track e renegociando', e);
      }
    }

  //  if (callButton) callButton.disabled = false;
   // if (hangupButton) hangupButton.disabled = false;
    logMessage('Microfone ativado.');
  } catch (e) {
    console.error('getUserMedia erro:', e);
    alert('Erro ao acessar o microfone: ' + (e.message || e.name));
    if (startButton) startButton.disabled = false;
  }
}
function sendMessage() {
  const text = messageInput ? messageInput.value.trim() : '';
  if (!text) return;
  
  // 1. Adiciona a tag da sala atual
  const message = { 
    sender: 'Você', 
    text, 
    timestamp: Date.now(),
    roomId: getCurrentGameId() // <-- MUDANÇA IMPORTANTE
  };

  console.log('[CHAT] Enviando mensagem:', message);

  // 2. Envia para TODOS os peers (de todas as salas)
  // O receptor (em setupDataChannel) irá filtrar quais exibir.
  Object.entries(peers).forEach(([peerId, { dataChannel }]) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      try {
        dataChannel.send(JSON.stringify(message));
      } catch (e) {
        console.warn('Erro ao enviar mensagem para peer ' + peerId, e);
      }
    }
  });

  // 3. Salva localmente (sua função salvarDados deve usar o 'jogoId' / 'roomId')
  if (!dados.chats) dados.chats = [];
  dados.chats.push({ 
      sender: 'Você', 
      content: text, 
      jogoId: getCurrentGameId(), // Assumindo que 'jogoId' é o 'roomId'
      timestamp: Date.now() 
  });
   salvarDados(); // Chame sua função de salvar

  // 4. Exibe localmente
  displayMessage('Você', text);
  if (messageInput) messageInput.value = '';
}
function sendShareMessage() {
    console.log('[SHARE - TENTATIVA] Iniciando compartilhamento...');
    
    // Tenta ler a CHAVE SALVA pela função copiarItem()
    const serializedData = sessionStorage.getItem('webrtc_clipboard');
    
    if (!serializedData) {
        console.error("[SHARE - ERRO] Chave 'webrtc_clipboard' não encontrada.");
        alert("🚨 Você precisa COPIAR um item antes de usar o Compartilhamento!");
        return;
    }
    
    try {
        const shareData = JSON.parse(serializedData);
        console.log('[SHARE] Dados encontrados:', shareData.itemType, shareData.itemName);
        
        // VERIFICAÇÃO DE SEGURANÇA: Garantir que o payload é uma string válida
        let payloadString;
        try {
            if (typeof shareData.payload === 'string') {
                // Já é uma string, verificar se é JSON válido
                JSON.parse(shareData.payload);
                payloadString = shareData.payload;
            } else {
                // Se for objeto, converter para string
                payloadString = JSON.stringify(shareData.payload);
            }
        } catch (e) {
            console.error('[SHARE] Payload inválido:', e);
            alert("Erro: Dados do item corrompidos. Copie o item novamente.");
            return;
        }

        // Define a mensagem que será enviada via WebRTC
        const message = {
            type: "share_proposal",
            senderName: (window.usuarioLogado && window.usuarioLogado.nome) ? window.usuarioLogado.nome : "Usuário Anônimo", 
            itemType: shareData.itemType,
            itemName: shareData.itemName,
            payload: payloadString // Usa a string validada
        };
        
        console.log(`[SHARE] Preparando envio: ${shareData.itemType} (${shareData.itemName})`);

        // VERIFICA se há peers conectados
        const peersConectados = Object.entries(peers).filter(([peerId, { dataChannel }]) => 
            dataChannel && dataChannel.readyState === 'open'
        );

        if (peersConectados.length === 0) {
            alert("⚠️ Nenhum usuário conectado para receber o compartilhamento.");
            return;
        }

        console.log(`[SHARE] Enviando para ${peersConectados.length} peer(s)`);

        // Envia para todos os peers conectados
        let enviados = 0;
        peersConectados.forEach(([peerId, { dataChannel }]) => {
            try {
                const mensagemString = JSON.stringify(message);
                console.log(`[SHARE] Enviando para ${peerId}, tamanho: ${mensagemString.length} bytes`);
                dataChannel.send(mensagemString);
                enviados++;
            } catch (e) {
                console.warn(`[SHARE] Erro ao enviar para ${peerId}:`, e);
            }
        });

        // Feedback para o usuário
        if (enviados > 0) {
            displayMessage('Sistema', `📤 Compartilhamento enviado: "${shareData.itemName}" para ${enviados} usuário(s)`);
            
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao(`"${shareData.itemName}" compartilhado com sucesso!`, 'sucesso');
            }
        } else {
            alert("❌ Falha ao enviar para todos os usuários.");
        }

    } catch (e) {
        console.error("[SHARE - ERro CRÍTICO]:", e);
        alert("❌ Erro crítico ao compartilhar. Verifique o console.");
    }
}
function sendDataChannelObjectToAll(obj) {
  const json = JSON.stringify(obj);
  console.log('[SYNC] Enviando objeto sync:', obj);
  Object.entries(peers).forEach(([peerId, { dataChannel }]) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      try {
        dataChannel.send(json);
      } catch (e) {
        console.warn('Erro ao enviar objeto para peer ' + peerId, e);
      }
    }
  });
}
function sendCustomData() {
  // ... (Sua lógica de adicionar usuário, etc.) ...
    // exemplo: adiciona usuário e sincroniza
  const newUserId = (dados.usuarios && dados.usuarios.length) ? dados.usuarios.length + 1 : 1;
  if (!dados.usuarios) dados.usuarios = [];
  const newUser = { id: newUserId, usuario: `peer_sync_${newUserId}`, role: 'sincronizado', timestamp: Date.now() };
  dados.usuarios.push(newUser);
  salvarDados();
  
  // cria payload filtrado e envia como 'sync_data'
  const payload = getFilteredDataByGameId(getCurrentGameId());
  const syncObject = { 
      type: 'sync_data', 
      payload: payload, 
      version: Date.now(), 
      gameId: getCurrentGameId() // Correto!
  };
  sendDataChannelObjectToAll(syncObject);

  displayMessage('Você (Sistema)', `Simulação de dados sincronizada para sala ${getCurrentGameId()}.`);
}
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







