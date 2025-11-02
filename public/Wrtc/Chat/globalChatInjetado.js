let chatModalAberto = false;
let chatModalElement = null;
let modalSocket = null;

let modalUserName = '';
let modalActiveRooms = new Map();
let modalCurrentRoom = '';

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

// Função para conectar o socket do modal
function connectModalSocket() {
    const serverUrl = document.getElementById('modalServerUrl').value;
    modalUserName = document.getElementById('modalUserName').value;
    
    // Cria uma nova conexão socket para o modal
    modalSocket = io(serverUrl);

    modalSocket.on('connect', () => {
        addModalMessage('Sistema', 'Conectado ao servidor', 'system');
    });

    modalSocket.on('disconnect', () => {
        addModalMessage('Sistema', 'Desconectado', 'system');
    });

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

    modalSocket.on('room-user-count', (data) => {
        updateModalActiveRoomsDisplay();
    });
}

// Função para desconectar o socket do modal
function disconnectModalSocket() {
    if (modalSocket) {
        modalSocket.disconnect();
        modalSocket = null;
        modalActiveRooms.clear();
        updateModalRoomSelector();
        updateModalActiveRoomsDisplay();
        addModalMessage('Sistema', 'Desconectado', 'system');
    }
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
    addModalMessage('Sistema', `Entrou na sala: ${roomName}`, 'system');

    // Solicita histórico da sala
    modalSocket.emit('request-chat-history', { room: roomName });
}

// Função para trocar de sala no modal
function switchModalRoom() {
    const selector = document.getElementById('modalRoomSelector');
    modalCurrentRoom = selector.value;
    displayModalMessagesForCurrentRoom();
}

// Função para enviar mensagem no modal
function sendModalMessage() {
    if (!modalSocket || !modalCurrentRoom) {
        alert('Conecte e entre em uma sala primeiro');
        return;
    }

    const messageInput = document.getElementById('modalMessageInput');
    const message = messageInput.value;

    if (message.trim() === '') return;

    // Extrai tipo e ID da sala atual
    const [roomType, roomId] = modalCurrentRoom.split('-');

    // Envia no formato que seu backend espera
    const messageData = {
        user: modalUserName,
        message: message,
        merito: 0
    };

    // Adiciona o campo específico baseado no tipo de sala
    if (roomType === 'jogo') {
        messageData.jogoId = roomId;
    } else if (roomType === 'time') {
        messageData.timeId = roomId;
    } else if (roomType === 'live') {
        messageData.liveId = roomId;
    }

    // Adiciona a mensagem localmente
    addModalMessage(modalUserName, message, modalCurrentRoom);

    // Envia para o servidor
    modalSocket.emit('chat-message', messageData);
    
    // Limpa o input
    messageInput.value = '';
}

// Função para adicionar mensagem no modal
function addModalMessage(user, text, room) {
    // Se a mensagem é do sistema, mostra em todas as views
    if (room === 'system') {
        // Adiciona a todas as salas ativas
        modalActiveRooms.forEach((messages, roomName) => {
            messages.push({ user, text, timestamp: new Date() });
        });
    } else {
        // Adiciona apenas à sala específica
        if (modalActiveRooms.has(room)) {
            modalActiveRooms.get(room).push({ user, text, timestamp: new Date() });
        }
    }

    // Se a sala da mensagem é a atual, mostra imediatamente
    if (room === modalCurrentRoom || room === 'system') {
        displayModalMessagesForCurrentRoom();
    }
}
// Função para exibir mensagens da sala atual no modal
function displayModalMessagesForCurrentRoom() {
    const messagesDiv = document.getElementById('modalMessages');
    if (!messagesDiv) return;

    messagesDiv.innerHTML = '';

    if (modalCurrentRoom && modalActiveRooms.has(modalCurrentRoom)) {
        const messages = modalActiveRooms.get(modalCurrentRoom);
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
            messagesDiv.appendChild(messageDiv);
        });
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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

// Função para determinar a sala a partir dos dados recebidos no modal
function getModalRoomFromData(data) {
    if (data.jogoId) return `jogo-${data.jogoId}-visitante`;
    if (data.timeId) return `time-${data.timeId}-visitante`;
    if (data.liveId) return `live-${data.liveId}-visitante`;
    return data.room || 'unknown';
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

// Tecla ESC para fechar o modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && chatModalAberto) {
        fecharChatModal();
    }
});


