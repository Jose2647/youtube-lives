/*
 * Adaptado para Voice + Text Chat (RTCDataChannel) e Envio de Objeto Customizado
 */

'use strict';
// variaveis-globais.js
let dados = {
    jogos: [],
    usuarios: [],
    transacoes: [],
    apostasUsuarios: [],
    desafiosUsuarios: [],
    chats: [] // Store chats per cardId
};

        // === CONFIG (AJUSTE AQUI) ===
   const API_BASE = 'http://localhost:3000';  // Seu backend URL
    const SOCKET_SERVER = 'http://localhost:3000';  // Mesmo do chat, se compartilhado
    /*
const API_BASE = 'https://youtube-lives.onrender.com';
    const SOCKET_SERVER = 'https://youtube-lives.onrender.com';  // Mesmo do chat, se compartilhado
    const SIGNALING_SERVER = 'wss://youtube-lives.onrender.com';
    
    */

  // Função para buscar dados do backend
async function buscarDadosBackend(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        
        const dadosRes = await response.json();
        //console.log(`${endpoint}:`, Array.isArray(dadosRes) ? dadosRes.length : 1, 'itens');
        return dadosRes;
        
    } catch (error) {
        console.error(`${endpoint}:`, error.message);
        return null;
    }
}
// Função principal para carregar dados
async function carregarDadosBackend() {
    try {
        //console.log('Carregando dados do backend...');
        
        const [
            usuariosBackend, 
            apostasBackend, 
            desafiosBackend, 
            chatsBackend, 
            jogosBackend
        ] = await Promise.all([
            buscarDadosBackend('/api/users'),
            buscarDadosBackend('/api/apostas'),
            buscarDadosBackend('/api/desafios'),
            buscarDadosBackend('/api/chats'),
            buscarDadosBackend('/api/jogos') // ou '/api/jogos-completos' se preferir
        ]);

        // Atribuir dados diretamente
        Object.assign(dados, {
            usuarios: usuariosBackend || [],
            apostasUsuarios: apostasBackend || [],
            desafiosUsuarios: desafiosBackend || [],
            chats: chatsBackend || [],
            jogos: jogosBackend || []
        });

        //console.log('Dados carregados:');
        //console.log(`Usuários: ${dados.usuarios.length}`);
      //  console.log(`Apostas: ${dados.apostasUsuarios.length}`);
        //console.log(`Desafios: ${dados.desafiosUsuarios.length}`);
        //console.log(`Chats: ${dados.chats.length}`);
        console.log(`Jogos: ${dados.jogos.length}`);
        
        return true;
        
    } catch (error) {
        console.error('Erro no carregamento:', error);
        return false;
    }
}
function salvarDados() {
    localStorage.setItem('sistemaTransmissao', JSON.stringify(dados));
    console.log("________dados",dados)
   // localStorage.setItem('sistemaNotificacoes', JSON.stringify(notificacoes));
   // atualizarIndicadoresApostas()
}

// Função inicializadora
async function inicializar() {
    console.log('Iniciando sistema...');
    
    const sucesso = await carregarDadosBackend();
    
    if (sucesso) {
      salvarDados()
     //   carregarJogos(); // sua função que renderiza a UI
        console.log('Sistema inicializado com sucesso');
    } else {
        document.getElementById('app').innerHTML = `
            <div class="erro">
                <h2>Erro ao conectar com o servidor</h2>
                <p>Verifique se o backend está rodando em <code>https://youtube-lives.onrender.com</code></p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

// Iniciar automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
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






// ===================================
// LÓGICA DE SINALIZAÇÃO WEBSOCKET
// ===================================


// main.js

// ... (restante do código anterior) ...

// ===================================
// LÓGICA DE SINALIZAÇÃO WEBSOCKET (AGORA SOCKET.IO)
// ===================================

// ** NOVO: Conecta ao Socket.IO. Se não for especificada porta, usa a porta do servidor web (3000).
//    Requer que o <script src="/socket.io/socket.io.js"></script> esteja no index.html.
const signaling = io(); 

function sendSignalingMessage(message) {
  // ** NOVO: Envia o objeto diretamente usando o evento 'signal'
  signaling.emit('signal', message);
}

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
// FUNÇÕES DE CHAT (RTCDataChannel)
// ===================================

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

        switch (receivedData.type) {
            case 'chat':
                displayMessage('Remoto', receivedData.content);
                break;
            
            case 'sync_data': // NOVO: Tratamento de dados sincronizados
                // A versão local é carregada com base no que está no localStorage
                const localDataString = localStorage.getItem('sistemaTransmissao');
                const currentLocalVersion = localDataString ? JSON.parse(localDataString).version || 0 : 0;
                const receivedVersion = receivedData.payload.version || 0;

                // Verifica se a versão recebida é estritamente mais recente que a local
                if (receivedVersion > currentLocalVersion) {
                    // Atualiza o objeto 'dados' global com o payload recebido
                    Object.assign(dados, receivedData.payload); 
                    
                    // Salva no localStorage (chama a função do usuário que usa 'dados')
                    salvarDados(); 
                    
                    logMessage(`[LOG] Sincronização recebida! Versão: ${receivedVersion}. Dados atualizados no localStorage.`);
                    displayMessage('Sistema', `Dados atualizados: ${dados.usuarios.length} usuários.`);
                } else {
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
function sendMessage() {
    const text = messageInput.value;
    if (text.trim() === '' || !dataChannel || dataChannel.readyState !== 'open') return;

    const messageObject = {
        type: 'chat',
        content: text
    };
    
    sendDataChannelObject(messageObject);

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
// NOVO: Dispara o envio de todo o objeto de dados para o(s) peer(s)
function syncDataToPeers() {
    if (!dataChannel || dataChannel.readyState !== 'open') {
        console.error("Erro: DataChannel não está aberto para sincronização.");
        return;
    }

    // 1. Salva a versão atualizada no localStorage (usando a função existente do usuário)
    salvarDados(); 

    // 2. Cria e envia o objeto de sincronização
    const syncObject = {
        type: 'sync_data',
        // Cria um payload com os dados e um timestamp de versão
        payload: { ...dados, version: Date.now() } 
    };
    
    sendDataChannelObject(syncObject);
    logMessage(`[LOG] Dados sincronizados com o peer. Usuários: ${dados.usuarios.length}.`);
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
