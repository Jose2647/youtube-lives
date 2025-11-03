
console.log("_____dados",dados)





const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');
const sendCustomDataButton = document.getElementById('sendCustomDataButton'); // NOVO: Botão customizado


callButton.disabled = true;
hangupButton.disabled = true;
messageInput.disabled = true;
sendButton.disabled = true;
sendCustomDataButton.disabled = false; // NOVO: Desabilitar o novo botão inicialmente
startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);
sendButton.addEventListener('click', sendMessage);
sendCustomDataButton.addEventListener('click', sendCustomData); // NOVO: Listener para enviar objeto customizado


let startTime;

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection; 
let dataChannel;

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0
};



const signaling = io(); 

// NOVO: Entrar na sala assim que a conexão Socket.IO for estabelecida


function sendSignalingMessage(message) {
// ... (restante da função)
signaling.on('connect', () => {
    currentSelectedGameId = getCurrentGameId();
    if (currentSelectedGameId) {
        signaling.emit('join_room', currentSelectedGameId);
        logMessage(`[SINALIZAÇÃO] Entrou na sala/jogo: ${currentSelectedGameId}`);
    }
});

// ** NOVO: Escuta o evento 'signal'
signaling.on('signal', async (message) => {
  // O objeto 'message' já é o objeto JavaScript, sem precisar de JSON.parse
  if (!peerConnection) {
      console.warn('Recebeu mensagem de sinalização, mas peerConnection não foi iniciado.');
      return;
  }

  try {
    if (message.type === 'offer') {
      console.log('Recebido: Offer. Criando Answer.');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
      onSetRemoteSuccess(peerConnection);
      await createAnswer(peerConnection); 

    } else if (message.type === 'answer') {
      console.log('Recebido: Answer.');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
      onSetRemoteSuccess(peerConnection);

    } else if (message.type === 'candidate') {
      if (message.candidate) {
        console.log('Recebido: Candidate.');
        // O restante da lógica WebRTC é mantido.
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    }
  } catch (e) {
    console.error('Erro ao processar mensagem de sinalização:', e);
  }
});

}

// main.js - Adicione esta função na seção de LÓGICA DE DADOS COMPARTILHADOS

function getFilteredDataByGameId(gameId) {
    if (!gameId) return dados; // Retorna tudo se não tiver ID (ou use uma lógica segura)

    // NOVO OBJETO: Onde armazenaremos apenas os dados relevantes para este jogo
    const filteredPayload = {
        // Inclui propriedades de usuário que são globais/necessárias
        usuarios: dados.usuarios.filter(u => u.jogoId === gameId || u.jogoId === undefined),
        
        // Filtra listas que podem ser específicas do jogo
        apostasUsuarios: dados.apostasUsuarios.filter(a => a.jogoId === gameId),
        desafiosUsuarios: dados.desafiosUsuarios.filter(d => d.jogoId === gameId),
        
        // Filtra chats pelo gameId. Assumindo que chat tem a propriedade 'jogoId'.
        // Se 'chats' é uma lista simples, você pode adicionar o jogoId ao objeto de chat na função sendMessage().
        chats: dados.chats.filter(c => c.jogoId === gameId), 
        
        // Adiciona o próprio objeto do jogo (útil para o peer remoto)
        jogos: dados.jogos.filter(j => j.id === gameId),
        
        // Outras listas que você queira sincronizar (ex: transacoes, se forem globais)
        transacoes: dados.transacoes // Mantenha ou filtre se necessário
    };
    
    return filteredPayload;
}

// ===================================
// FUNÇÕES DE CONTROLE DE MÍDIA E CHAMADA
// ===================================

async function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    console.log('Received local stream (Audio only)');
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;

    createPeerConnection();

  } catch (e) {
    alert(`getUserMedia() error: ${e.name}. Certifique-se de que o microfone está disponível.`);
    startButton.disabled = false;
  }
}
function createPeerConnection() {
  const iceServers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  peerConnection = new RTCPeerConnection(iceServers);
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignalingMessage({
        type: 'candidate',
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = (event) => {
    if (remoteVideo.srcObject !== event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
      console.log('Remote stream (Audio) received');
      startTime = window.performance.now(); 
    }
  };
  
  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    handleDataChannelEvents(dataChannel, 'Remoto');
    console.log('RTCDataChannel recebido pelo peer remoto.');
    logMessage('Canal de dados remoto recebido e aberto.');
  };

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  peerConnection.oniceconnectionstatechange = () => {
    console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
  };

  console.log('RTCPeerConnection criado.');
}
async function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  console.log('Starting call');

  dataChannel = peerConnection.createDataChannel('chatChannel', { reliable: true });
  handleDataChannelEvents(dataChannel, 'Local');
  console.log('RTCDataChannel local criado.');
  
  try {
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    onSetLocalSuccess(peerConnection);

    sendSignalingMessage(peerConnection.localDescription);
    
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
}
async function createAnswer(pc) {
  console.log('pc creating Answer');
  try {
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    onSetLocalSuccess(pc);

    sendSignalingMessage(pc.localDescription);

  } catch (e) {
    onSetSessionDescriptionError(e);
  }
}
function hangup() {
  console.log('Ending call');
  
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
  }
  
  if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
  }
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  
  hangupButton.disabled = true;
  callButton.disabled = false;
  startButton.disabled = false;
  sendButton.disabled = true;
  messageInput.disabled = true;
  sendCustomDataButton.disabled = true; // NOVO: Desabilita o botão customizado
  logMessage('Conexão encerrada.');
}

// ===================================
// FUNÇÕES DE CHAT E DATACHANNEL (CORRIGIDO)
// ===================================

function handleDataChannelEvents(channel, type) {
    channel.onopen = () => {
        sendButton.disabled = false;
        messageInput.disabled = false;
        sendCustomDataButton.disabled = false;
        logMessage(`Canal de dados (${type}) aberto. Pronto para chat e troca de objetos.`);

        // LÓGICA DE SINCRONIZAÇÃO INICIAL
        // O peer que inicia o canal (Ofertante/Local) envia os dados iniciais
        if (type === 'Local') {
            syncDataToPeers();
        }
    };

    channel.onclose = () => {
        sendButton.disabled = true;
        messageInput.disabled = true;
        sendCustomDataButton.disabled = true;
        logMessage(`Canal de dados (${type}) fechado.`);
    };

    channel.onmessage = (event) => {
        let receivedData;
        try {
            receivedData = JSON.parse(event.data);
        } catch (e) {
            console.warn('Mensagem recebida não é um objeto JSON:', event.data);
            displayMessage('Remoto', event.data);
            return;
        }
      
        if (receivedVersion > currentLocalVersion) {
            
            const receivedPayload = receivedData.payload;
            const receivedGameId = receivedPayload.gameId;
            
            // AQUI ESTÁ A LÓGICA DE INTEGRAÇÃO MAIS REFINADA:
            // Em vez de substituir o 'dados' inteiro, atualizamos seus sub-arrays
            
            // Se você tiver dados aninhados (ex: dados.jogos[ID].chats), a lógica seria mais complexa.
            // Mas se for listas simples (dados.chats, dados.apostas), você pode fazer:
            
            // 1. Filtra os dados locais, removendo o jogo que será atualizado
            dados.apostasUsuarios = dados.apostasUsuarios.filter(a => a.jogoId !== receivedGameId);
            dados.desafiosUsuarios = dados.desafiosUsuarios.filter(d => d.jogoId !== receivedGameId);
            dados.chats = dados.chats.filter(c => c.jogoId !== receivedGameId);
        
            // 2. Adiciona os dados recebidos para o jogo específico
            dados.apostasUsuarios.push(...receivedPayload.apostasUsuarios);
            dados.desafiosUsuarios.push(...receivedPayload.desafiosUsuarios);
            dados.chats.push(...receivedPayload.chats);
        
            // 3. Atualiza dados de usuário/jogo no objeto principal (assumindo que o filtro de usuário seja seguro)
            // Ex: Você pode atualizar o objeto de jogo específico se ele for complexo
            
            // ... (restante da lógica de salvarDados e logs)
        }
        const chatsBeforeUpdate = dados.chats ? dados.chats.length : 0;
        
        switch (receivedData.type) {
            case 'sync_data':
            if (receivedVersion > currentLocalVersion) {
        
        // 1. FILTRAGEM E INTEGRAÇÃO DOS DADOS DE JOGO
        
        // Remove os itens antigos do Jogo X do estado global 'dados'
        dados.apostasUsuarios = dados.apostasUsuarios.filter(a => a.jogoId !== receivedGameId);
        dados.desafiosUsuarios = dados.desafiosUsuarios.filter(d => d.jogoId !== receivedGameId);
        dados.chats = dados.chats.filter(c => c.jogoId !== receivedGameId);
        
        dados.apostasUsuarios.push(...receivedPayload.apostasUsuarios);
        dados.desafiosUsuarios.push(...receivedPayload.desafiosUsuarios);
        dados.chats.push(...receivedPayload.chats);
      
      
        dados.version = receivedVersion; 

        // 4. Salva no localStorage
        salvarDados(); 
        
        logMessage(`[LOG] Sincronização recebida! Jogo ${receivedGameId}, Versão: ${receivedVersion}. Dados atualizados.`);
        displayMessage('Sistema', `Dados do Jogo ${receivedGameId} atualizados. Detalhes no Console.`);
    }   else {
                    logMessage(`[LOG] Sincronização recebida (${receivedVersion}), mas a versão local (${currentLocalVersion}) é igual ou mais nova. Ignorando.`);
                }
         break;
                
            default:
                console.warn('Tipo de objeto desconhecido:', receivedData.type);
                break;
        }
    };
    

    channel.onerror = (error) => {
        console.error("DataChannel Error:", error);
        logMessage('Erro no canal de dados.');
    };
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}
// FUNÇÃO AUXILIAR PARA ENVIAR QUALQUER OBJETO JSON
function sendDataChannelObject(object) {
    if (!dataChannel || dataChannel.readyState !== 'open') {
        console.error("Erro: DataChannel não está aberto.");
        return;
    }
    const jsonString = JSON.stringify(object);
    dataChannel.send(jsonString);
}
// NOVO: Função chamada pelo novo botão
// CORRIGIDO: Agora simula uma alteração no objeto 'dados' e dispara a sincronização
function sendCustomData() {
    if (!dataChannel || dataChannel.readyState !== 'open') {
        logMessage('Erro: Canal de dados não está aberto para enviar objeto customizado.');
        return;
    }
    
    // SIMULAÇÃO: Altera o objeto de dados localmente (ex: adiciona um novo usuário)
    const newUserId = dados.usuarios.length + 1;
    dados.usuarios.push({
        id: newUserId,
        usuario: `peer_sync_${newUserId}`,
        role: 'sincronizado',
        timestamp: Date.now()
    });
    
    // Dispara a sincronização: salva no localStorage E envia via DataChannel
    syncDataToPeers();
    
    displayMessage('Você (Sistema)', `Simulação: Novo usuário (peer_sync_${newUserId}) adicionado. Dados sincronizados.`);
}
// ===================================
// FUNÇÕES DE CHAT E DATACHANNEL (CORRIGIDO)
// ===================================

function sendMessage() {
    const text = messageInput.value;
    if (text.trim() === '' || !dataChannel || dataChannel.readyState !== 'open') return;
    
    // 1. Cria o objeto de chat a ser salvo
    const chatMessage = {
        sender: 'Você', // Ou um ID de usuário real se autenticado
        content: text,
        timestamp: Date.now()
    };
    
    // 2. Adiciona a mensagem ao array de chats no objeto global 'dados'
    if (!dados.chats) {
        dados.chats = []; // Garante que o array existe
    }
    dados.chats.push(chatMessage);

    // 3. Salva no localStorage e envia a SINCRONIZAÇÃO COMPLETA
    // A função syncDataToPeers() que criamos salva no localStorage e envia o objeto 'dados'
    syncDataToPeers(); 
    
    // 4. Exibe a mensagem localmente
    displayMessage('Você', text);
    messageInput.value = '';
}

function displayMessage(sender, text) {
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; 
}
function logMessage(text) {
    const logElement = document.createElement('p');
    logElement.style.fontStyle = 'italic';
    logElement.style.fontSize = '0.8em';
    logElement.textContent = `[LOG] ${text}`;
    messagesDiv.appendChild(logElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


// ===================================
// FUNÇÕES AUXILIARES DE LOG (MANTIDAS)
// ===================================

function syncDataToPeers() {
    if (!dataChannel || dataChannel.readyState !== 'open') {
        console.error("Erro: DataChannel não está aberto para sincronização.");
        return;
    }

    // A variável currentSelectedGameId deve estar definida e ter sido obtida via getCurrentGameId()

    // 1. Salva a versão completa atualizada no localStorage
    // (Ainda salvamos tudo localmente, mesmo se só enviarmos o subconjunto)
    salvarDados(); 

    // 2. GERA O PAYLOAD FILTRADO
    const gameId = getCurrentGameId(); 
    const filteredPayload = getFilteredDataByGameId(gameId);
    
    // 3. Cria e envia o objeto de sincronização
    const syncObject = {
        type: 'sync_data',
        // ATENÇÃO: Envia o payload filtrado, mas anexa a versão do objeto DADOS completo
        payload: { ...filteredPayload, version: Date.now(), gameId: gameId } 
    };
    
    sendDataChannelObject(syncObject);
    logMessage(`[LOG] Dados do Jogo ${gameId} sincronizados com o peer. `);
}

function onSetLocalSuccess(pc) {
  console.log(`setLocalDescription complete`);
}
function onSetRemoteSuccess(pc) {
  console.log(`setRemoteDescription complete`);
}
function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
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
<div id="container">
    <h1>WebRTC Voice & Text Chat</h1>

    <p>Comunicação P2P de Áudio e Texto via WebRTC.</p>

    <div id="video-streams">
        <video id="localVideo" playsinline autoplay muted class="video-hidden"></video>
        <video id="remoteVideo" playsinline autoplay class="video-hidden"></video>
    </div>

    <div class="box">
        <button id="startButton">Start (Obter Áudio)</button>
        <button id="callButton">Call</button>
        <button id="hangupButton">Hang Up</button>
    </div>

    <div id="chatContainer">
        <h3>Chat de Texto P2P</h3>
        <div id="messages">
            </div>
        <input type="text" id="messageInput" placeholder="Digite sua mensagem..." disabled>
        
        <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button id="sendButton" disabled style="flex-grow: 1;">Enviar Texto</button>
            
            <button id="sendCustomDataButton"  style="flex-grow: 1;">Enviar Objeto Customizado</button> 
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
