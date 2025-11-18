
function escapeStringForHTML(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function abrirChatParaItem(itemType, itemId, itemName) {
    // 1. Gerar nome da sala usando o NOME ao invés do ID
    const safeName = itemName ? itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '') : 'default';
    const roomName = `${itemType}-${safeName}`;

    // 2. Checar/Criar e Entrar na sala nova
    signaling.emit('check_room_exists', roomName, (exists) => {
        if (!exists) {
            signaling.emit('create_room', roomName);
            logMessage(`[SINALIZAÇÃO] Sala automática "${roomName}" criada para ${itemType}.`);
        }
        currentGameId = roomName; // Define o foco
        joinedRooms.add(roomName);
        signaling.emit('join_room', roomName);
        logMessage(`[SINALIZAÇÃO] Entrou na sala automática: ${roomName}`);
        
        // 3. Atualizar a lista de salas
        loadRoomsList(); 
        
        // 4. Abrir o modal se não estiver aberto
        if (!chatModalAberto) {
            abrirChatModal();
        }
    });
}
function enviarItemCopiado() {
    // 'copiarItem' (usado por acaoCopiarJogo) deve salvar no sessionStorage
    const clipboardData = sessionStorage.getItem('clipboard'); 

    if (!clipboardData) {
        alert("Você não copiou nada! Copie um Jogo (ou outro item) primeiro.");
        return;
    }

    try {
        const parsedData = JSON.parse(clipboardData);
        const itemName = parsedData.data.nome || parsedData.data.titulo || `Item ${parsedData.data.id}`;

        const proposalMessage = {
            type: "share_proposal", // Tipo especial para nossa lógica
            senderName: (window.usuarioLogado && window.usuarioLogado.nome) ? window.usuarioLogado.nome : "Um usuário",
            itemType: parsedData.type, // ex: "jogo"
            itemName: itemName,        // ex: "Maracanã"
            payload: clipboardData     // O JSON stringificado do item (o clipboard inteiro)
        };

        // 'sendData' é sua função que envia dados pelo WebRTC data channel
        // Se ela não existir, você precisa usar a lógica do seu 'signaling' ou 'dataChannel.send'
        if (typeof sendData === 'function') {
            sendData(JSON.stringify(proposalMessage)); 
        } else {
            console.error("'sendData' não definida. Não é possível enviar proposta.");
            alert("Erro: Função de envio de dados não encontrada.");
            return;
        }
        
        // Log local e mensagem no chat para o remetente
        logMessage(`[CHAT] Proposta de compartilhamento enviada: ${parsedData.type} - ${itemName}`);
        // 'addMessageToUI' é sua função que adiciona msg no chat
        addMessageToUI("Você", `(Você enviou uma proposta de: ${itemName})`);

    } catch (err) {
        console.error("Erro ao enviar item copiado:", err);
        alert("Erro ao ler item da área de transferência. O item copiado é um JSON válido?");
    }
}

