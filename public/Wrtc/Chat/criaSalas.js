function loadRoomsList() {
  signaling.emit('get_rooms_list'); // Servidor responde com 'rooms_list'
}
function populateRoomsSelect(rooms) {
  if (!roomsSelect) return;
  roomsSelect.innerHTML = '';
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room;
    option.textContent = room;
    if (room === currentGameId) option.selected = true;
    roomsSelect.appendChild(option);
  });
}
function joinSelectedRoom() {
  const newGameId = roomsSelect.value;
  if (!newGameId || newGameId === currentGameId) return;

  // [MUDANÇA IMPORTANTE]
  // REMOVIDO: hangupAll(); 
  // Não desconectamos mais, apenas trocamos o foco.

  // 1. Atualiza a sala em foco
  currentGameId = newGameId;
  joinedRooms.add(newGameId); // <-- ADICIONE ISSO
  
  // 2. Informa ao servidor que entramos nesta sala
  // (O servidor saberá que já estamos nela ou nos adicionará)
  signaling.emit('join_room', currentGameId);
  
  logMessage(`[SINALIZAÇÃO] Foco trocado para sala: ${currentGameId}`);

  // 3. Limpar o chat local (opcional, mas recomendado)
  if (messagesDiv) messagesDiv.innerHTML = '';
  logMessage(`Exibindo chat da sala: ${currentGameId}`);
  
  // 4. (Opcional) Recarregar dados/chat da nova sala
  // syncDataToPeers(); // Cuidado para não causar loop
}
function initializeRoomsFromDados() {
  function processItems(items, type, parentPrefix = '') {
        if (!items || !Array.isArray(items)) return;
        
        items.forEach(item => {
            
            // 1. Gerar o nome/ID local deste item
            let itemLocalName = null;
            if (item.id) {
                itemLocalName = `${type}-${item.id}`;
            } else if (item.nome) {
                itemLocalName = `${type}-${item.nome.toLowerCase().replace(/\s/g, '-')}`;
            } else if (item.titulo) {
                itemLocalName = `${type}-${item.titulo.toLowerCase().replace(/\s/g, '-')}`;
            } 
            // Fallback para tipos que usam 'cardId' como identificador principal
            else if ((type === 'aposta' || type === 'desafio' || type === 'chat') && item.cardId) {
                itemLocalName = `${type}-${item.cardId}`;
            }

            // Se não conseguirmos um ID, não podemos criar uma sala para este item.
            // Mas ainda podemos processar seus filhos, usando o prefixo do pai (avô).
            if (!itemLocalName) {
                console.warn(`[AUTO-ROOM] Item do tipo '${type}' não tem id/nome/título/cardId. Pulando criação de sala, mas processando filhos (se houver).`);
                // Processa filhos mesmo se o pai não puder ter uma sala
                processChildren(item, parentPrefix);
                return; // Pula para o próximo item
            }

            // 2. Gerar o nome da sala HIERÁRQUICA
            // Se parentPrefix existir, concatena; senão, usa só o nome local.
            const roomName = parentPrefix ? `${parentPrefix}:${itemLocalName}` : itemLocalName;

            // 3. Enviar para o servidor verificar e criar
            signaling.emit('check_room_exists', roomName, (exists) => {
                if (!exists) {
                    signaling.emit('create_room', roomName);
                    // Log mais claro da hierarquia
                    console.log(`[AUTO-ROOM-H] Sala criada: ${roomName}`);
                }
            });
            
            // 4. Processar filhos, passando o NOVO prefixo (roomName)
            processChildren(item, roomName);
        });
    }
function processChildren(item, newPrefix) {
        if (item.estadios) processItems(item.estadios, 'estadio', newPrefix);
        if (item.times) processItems(item.times, 'time', newPrefix);
        if (item.lives) processItems(item.lives, 'live', newPrefix);
        if (item.divsHorizontais) processItems(item.divsHorizontais, 'divH', newPrefix);
        if (item.cards) processItems(item.cards, 'card', newPrefix);
        if(item){
          
       // console.log("______item",item)
        }
        // Adicione mais tipos de sub-itens aqui se necessário
    }
if (dados.jogos && dados.jogos !== []) {
        processItems(dados.jogos, 'jogo');
      
        
    }
    
        // Outras estruturas de topo (flat) - sem filhos
    if (dados.usuarios) {
        processItems(dados.usuarios, 'usuario');
    }
    if (dados.apostasUsuarios) {
        processItems(dados.apostasUsuarios, 'aposta');
    }
    if (dados.desafiosUsuarios) {
        processItems(dados.desafiosUsuarios, 'desafio');
    }
    if (dados.chats) {
        processItems(dados.chats, 'chat');
    }
    setTimeout(loadRoomsList, 3500); 
}
function leaveIndividualRoom(roomId) {
  if (!roomId || roomId === 'default_room') {
    console.warn('Não é possível sair da sala padrão.');
    return;
  }

  if (!joinedRooms.has(roomId)) {
    console.warn(`Você não está (ou não deveria estar) na sala ${roomId}.`);
    return;
  }

  console.log(`[LEAVE] Iniciando saída da sala: ${roomId}`);
  logMessage(`Saindo da sala ${roomId}...`);

  // 1. Informa ao servidor que estamos saindo
  // (Você PRECISARÁ implementar o listener 'leave_room' no seu servidor)
  signaling.emit('leave_room', roomId);
  joinedRooms.delete(roomId);

  // 2. Itera sobre todos os peers
  for (const peerId in peers) {
    const peer = peers[peerId];
    // Verifica se compartilhávamos esta sala com o peer
    if (peer.rooms.has(roomId)) {
      
      peer.rooms.delete(roomId); // Remove a sala do rastreador do peer

      // 3. Se essa era a ÚLTIMA sala em comum, desconecta
      if (peer.rooms.size === 0) {
        logMessage(`Desconectando de ${peerId} (última sala em comum era ${roomId}).`);
        closePeerConnection(peerId);
      } else {
        logMessage(`Saindo de ${roomId}, mas ainda conectado a ${peerId} (via outras salas).`);
      }
    }
  }

  // 4. Atualiza a UI
  loadRoomsList(); // Pede ao servidor a nova lista de salas (a sala pode ter sumido)

  // 5. Se saímos da sala que estava em foco, move o foco para 'default_room'
  if (currentGameId === roomId) {
    currentGameId = 'default_room';
    if (roomsSelect) roomsSelect.value = 'default_room';
    if (messagesDiv) messagesDiv.innerHTML = '';
    logMessage(`Foco movido para a sala ${currentGameId}.`);
    // (Pode ser necessário chamar 'joinSelectedRoom' ou 'join_room' para default)
    signaling.emit('join_room', 'default_room');
  }
}
function handleCreateRoom() {
  const gameName = prompt('Digite o nome do jogo para gerar o nome da sala:');
  if (!gameName) return;

  let proposedRoomName = `${gameName.toLowerCase().replace(/\s/g, '-')}-room`;

  signaling.emit('check_room_exists', proposedRoomName, (exists) => {
    if (exists) {
      alert(`Sala "${proposedRoomName}" já existe. Apenas entre nela.`);
      // Opcional: troca automaticamente para ela
      // roomsSelect.value = proposedRoomName;
      // joinSelectedRoom();
    } else {
      signaling.emit('create_room', proposedRoomName);
      currentGameId = proposedRoomName; // Foco na nova sala
      joinedRooms.add(proposedRoomName); // <-- ADICIONE ISSO
      signaling.emit('join_room', proposedRoomName); // Join na nova sala
      logMessage(`[SINALIZAÇÃO] Sala "${proposedRoomName}" criada e entrada.`);
      loadRoomsList(); // Atualizar lista de salas
    }
  });
}