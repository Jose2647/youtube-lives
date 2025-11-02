// ===== CHAT GLOBAL INJETADO VIA JAVASCRIPT =====
// ===== CHAT WEBRTC COM SALAS - INJETADO VIA JAVASCRIPT =====
// === ENTRAR SALA - CORRIGIDA ===
// === ENTRAR SALA - MAIS ROBUSTA =


// === ENTRAR SALA - MAIS ROBUSTA COM VERIFICAÇÃO DE SOCKET ===
window.entrarSala = async function(room) {
  //  console.log('🚪 entrarSala chamada com room:', room);
/*    console.log('📊 Socket status:', {
        socket: !!socket,
        socketConectado: socket?.connected,
        salasDisponiveis: Object.keys(salasDisponiveis || {}).length
    });*/
    
    if (!room) {
        console.error('❌ Nome da sala é undefined ou vazio');
        mostrarNotificacao('Erro: Sala não especificada', 'erro');
        return;
    }

    // ⭐⭐ CORREÇÃO: Verificar se socket está conectado
    if (!socket || !socket.connected) {
        console.error('❌ Socket não conectado, tentando reconectar...');
        conectarSocket();
        
        // Tentar novamente após reconexão
        setTimeout(() => {
            /*console.log('🔄 Retentando entrarSala após reconexão');*/
            entrarSala(room);
        }, 1000);
        return;
    }

    // ⭐⭐ CORREÇÃO: Garantir que salasDisponiveis existe
    if (!salasDisponiveis) {
        console.warn('⚠️ salasDisponiveis não definido, inicializando...');
        salasDisponiveis = {};
    }

    // Se a sala não existe, criar automaticamente
    if (!salasDisponiveis[room]) {
       /* console.log('➕ Criando sala automaticamente:', room);*/
        salasDisponiveis[room] = {
            nome: room,
            usuarios: 1
        };
        
        if (socket) {
            socket.emit('create-room', {
                room: room,
                nome: room,
                criador: usuarioLogado?.nome || 'Anônimo'
            });
        }
    }

    // ⭐⭐ CORREÇÃO: Verificar se a sala tem nome antes de usar
    const infoSala = salasDisponiveis[room];
    const nomeDaSala = infoSala?.nome || room;
    
  /*  console.log('✅ Sala configurada:', { room, nomeDaSala, infoSala });*/

    if (salaAtual === room) {
       /* console.log('✅ Já está na sala, mudando para aba chat');*/
        mudarAba('chat');
        return;
    }

    if (salaAtual) {
        socket.emit('leave-room', { room: salaAtual });
        socket.emit('voice-leave', { room: salaAtual });
        desativarVoz();
    }

    salaAtual = room;
    
    // ENTRAR NA SALA NO SERVIDOR
    socket.emit('join-room', {
        room: room,
        user: usuarioLogado?.nome || 'Visitante',
        merito: usuarioLogado?.merito || 0
    });

    // ATUALIZAR INTERFACE
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('voiceBtn').disabled = false;
    document.getElementById('chatInput').placeholder = `Mensagem em ${nomeDaSala}...`;
    
    // ⭐⭐ CORREÇÃO: Limpar mensagens de forma segura
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) chatMessages.innerHTML = '';
    
    // ATUALIZAR TÍTULO E STATUS
    document.getElementById('headerTitle').textContent = nomeDaSala;
    atualizarStatus(`Conectado em ${nomeDaSala}`);
    document.getElementById('voiceUsers').style.display = 'block';

    // ATUALIZAR LISTAS
    renderizarSalas();
    renderizarUsuarios();
    
    // MUDAR PARA ABA DO CHAT
    setTimeout(() => {
       /* console.log('🎯 Finalmente mudando para aba chat');*/
        mudarAba('chat');
    }, 100);
};
// === MUDAR ABA - CORRIGIDA ===
window.mudarAba = function(aba) {
    abaAtual = aba;
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.chat-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`.chat-tab[onclick="mudarAba('${aba}')"]`).classList.add('active');
    document.getElementById(`${aba}Content`).classList.add('active');

    // ATUALIZAR TÍTULO CORRETAMENTE
    let titulo = 'Chat Global';
    if (aba === 'chat' && salaAtual) {
        titulo = salasDisponiveis[salaAtual]?.nome || salaAtual;
    } else if (aba === 'usuarios') {
        titulo = salaAtual ? `Usuários - ${salasDisponiveis[salaAtual]?.nome || salaAtual}` : 'Usuários na Sala';
    }
    
    document.getElementById('headerTitle').textContent = titulo;
};

// ===== FUNÇÃO PARA CRIAR SALAS AUTOMÁTICAS =====
function criarSalasAutomaticas() {
    if (!AppState.socket) {
        //console.log('Aguardando conexão socket...');
        setTimeout(criarSalasAutomaticas, 1000);
        return;
    }

   // console.log('🔄 Criando salas automáticas...');
    
    // Salas para Jogos
    dados.jogos.forEach(jogo => {
        criarSalaSeNaoExistir(`🎮 ${jogo.nome}`, 'jogo');
        
        // Salas para Estádios
        jogo.estadios.forEach(estadio => {
            criarSalaSeNaoExistir(`🏟️ ${estadio.nome}`, 'estadio');
            
            // Salas para Times
            estadio.times.forEach(time => {
                criarSalaSeNaoExistir(`⚽ ${time.nome}`, 'time');
                
                // Salas para Lives
                (time.lives || []).forEach(live => {
                    criarSalaSeNaoExistir(`📺 ${live.titulo}`, 'live');
                    
                    // Salas para Divs Horizontais
                    (live.divsHorizontais || []).forEach(div => {
                        criarSalaSeNaoExistir(`📊 ${div.titulo || `Div ${div.id}`}`, 'div');
                        
                        // Salas para Cards
                        (div.cards || []).forEach(card => {
                            criarSalaSeNaoExistir(`🎴 ${card.titulo || `Card ${card.id}`}`, 'card');
                        });
                        
                        // Salas para Iframes
                        (div.iframes || []).forEach(iframe => {
                            if (iframe.url) {
                                criarSalaSeNaoExistir(`🌐 ${iframe.nome || 'Iframe'}`, 'iframe');
                            }
                        });
                    });
                });
            });
        });
    });
    
    console.log('✅ Salas automáticas criadas!');
}

// ===== FUNÇÃO PARA ENTRAR EM QUALQUER SALA
AUTOMATICAMENTE =====

// === ENTRAR SALA POR TIPO - CORRIGIDA ===
function entrarSalaPorTipo(tipo, id, nome) {
   // console.log('🎯 entrarSalaPorTipo:', { tipo, id, nome });

    if (!usuarioLogado?.nome) {
        usuarioLogado = { 
            nome: `Visitante${Math.floor(Math.random() * 1000)}`, 
            merito: 'visitante' 
        };
    }

    const nomeSala = getNomeSalaPorTipo(tipo, nome);
    abrirChatGlobal();

    // Função para atualizar o ID real da sala pelo nome
    function atualizarRoomId() {
        return Object.keys(salasDisponiveis).find(
            idSala => salasDisponiveis[idSala]?.nome === nomeSala
        );
    }

    function tentarEntrarSala() {
        const roomId = atualizarRoomId();
     /*   console.log('🔄 Tentando entrar na sala...', {
            socketConectado: !!socket,
            salaAtualDefinida: typeof salaAtual !== 'undefined',
            salasDisponiveis: Object.keys(salasDisponiveis || {}).length,
            roomId,
        });*/

        if (socket && typeof salaAtual !== 'undefined') {
            if (roomId) {
              //  console.log('✅ Sala encontrada:', roomId);
                entrarSala(roomId);
            } else {
                console.warn('⚠️ Sala não encontrada, criando nova:', nomeSala);
                criarSalaSeNaoExistir(nomeSala, tipo);
                setTimeout(() => {
                    const novaSala = atualizarRoomId();
                    if (novaSala) {
                     //   console.log('✅ Nova sala localizada após criação:', novaSala);
                        entrarSala(novaSala);
                    } else {
                        console.error('❌ Não foi possível localizar a sala criada:', nomeSala);
                    }
                }, 1000);
            }
        } else {
            console.log('⏳ Aguardando inicialização...');
            setTimeout(tentarEntrarSala, 500);
        }
    }

    // Inicia o processo
    setTimeout(tentarEntrarSala, 1000);

    // Garante que a aba de chat seja ativada
    setTimeout(() => {
        if (typeof mudarAba === 'function') {
         //   console.log('💬 Mudando para aba chat');
            mudarAba('chat');
        }
    }, 3000);
}
// ===== FUNÇÃO PARA OBTER NOME DA SALA POR TIPO =====
function getNomeSalaPorTipo(tipo, nome) {
    const prefixos = {
        'jogo': '🎮',
        'estadio': '🏟️', 
        'time': '⚽',
        'live': '📺',
        'div': '📊',
        'card': '🎴',
        'iframe': '🌐'
    };
    
    return `${prefixos[tipo] || '💬'} ${nome}`;
}
// ===== FUNÇÕES ESPECÍFICAS PARA CADA TIPO =====
function entrarSalaJogo(jogoId) {
    const jogo = dados.jogos.find(j => j.id === jogoId);
    if (jogo) entrarSalaPorTipo('jogo', jogoId, jogo.nome);
}
function entrarSalaEstadio(jogoId, estadioId) {
    const estadio = encontrarEstadio(jogoId, estadioId);
    if (estadio) entrarSalaPorTipo('estadio', estadioId, estadio.nome);
}
// Adicionar ao container de botões
function entrarSalaTime(jogoId, estadioId, timeId) {
    const time = encontrarTime(jogoId, estadioId, timeId);
    if (time) entrarSalaPorTipo('time', timeId, time.nome);
}
function entrarSalaLive(jogoId, estadioId, timeId, liveId) {
    const live = encontrarLive(jogoId, estadioId, timeId, liveId);
    if (live) entrarSalaPorTipo('live', liveId, live.titulo);
}
function entrarSalaDiv(jogoId, estadioId, timeId, liveId, divId) {
    const div = encontrarDivHorizontal(jogoId, estadioId, timeId, liveId, divId);
    if (div) entrarSalaPorTipo('div', divId, div.titulo || `Div ${divId}`);
}

// Adicionar ao container de botões
function entrarSalaCard(cardId) {
    const card = encontrarCardPorId && encontrarCardPorId(cardId);
    if (card) entrarSalaPorTipo('card', cardId, card.titulo || `Card ${cardId}`);
}
// ===== FUNÇÃO PARA SALA DE IFRAME =====

function entrarSalaIframe(jogoId, estadioId, timeId, liveId, divId, iframeId) {
   /* console.log("###########################");
    console.log("liveId", liveId);
    console.log("divId", divId);
    console.log("iframeId", iframeId);
    console.log("###########################");*/

    const iframe = encontrarIframe(jogoId, estadioId, timeId, liveId, divId, iframeId);

    if (iframe) {
        const nome = iframe.titulo || iframe.nome || `Iframe ${iframeId}`;
      //  console.log("🎯 Entrando na sala do iframe:", nome);
        entrarSalaPorTipo('iframe', iframeId, nome);
    } else {
        console.warn("⚠️ Nenhum iframe encontrado — criando sala genérica:", iframeId);
        criarSalaSeNaoExistir(`🌐 Iframe ${iframeId}`, 'iframe');
        setTimeout(() => entrarSalaPorTipo('iframe', iframeId, `Iframe ${iframeId}`), 1000);
    }
}
// ===== FUNÇÃO AUXILIAR PARA ENCONTRAR IFRAME =====
function encontrarIframe(jogoId, estadioId, timeId, liveId, divId, iframeId) {
   // console.log("_____encontrarIframe");

    const div = encontrarDivHorizontal(jogoId, estadioId, timeId, liveId, divId);

    if (!div) {
        console.warn("⚠️ Nenhuma div encontrada para IDs:", { jogoId, estadioId, timeId, liveId, divId });
        return null;
    }

    // compatibilidade com 'cards' ou 'iframes' ou 'iframers'
    const lista = div.cards || div.iframes || div.iframers || [];

   // console.log("_____div encontrada:", div);
    const iframe = lista.find(i => i.id === iframeId);

    if (!iframe) {
        console.warn("⚠️ Nenhum iframe encontrado dentro da div:", { divId, iframeId, lista });
    } else {
      //  console.log("✅ Iframe encontrado:", iframe);
    }

    return iframe || null;
}
// ===== ATUALIZAR A FUNÇÃO ORIGINAL =====
function criarOuEntrarSalaJogo(jogoId) {
    entrarSalaJogo(jogoId);
}
// ===== INICIALIZAR SALAS AUTOMATICAS =====
function inicializarSalasAutomaticas() {
    // Esperar socket conectar e então criar salas
    if (AppState.socket && AppState.socket.connected) {
        criarSalasAutomaticas();
    } else {
        setTimeout(inicializarSalasAutomaticas, 1000);
    }
}
// ===== ADICIONAR ESTE HANDLER NO initializeApp ou setupGlobalChatHandlers =====
function setupSalasAutomaticasHandlers() {
    if (!AppState.socket) return;

    // Quando o servidor confirma que uma sala foi criada
    AppState.socket.on('room-created', (data) => {
     //   console.log('✅ Sala criada pelo servidor:', data);
        if (data.room && data.info) {
            salasDisponiveis[data.room] = data.info;
            renderizarSalas(); // Atualizar a lista visual
        }
    });

    // Quando recebe a lista de salas do servidor
    AppState.socket.on('rooms-list', (salas) => {
      //  console.log('📋 Lista de salas recebida:', salas);
        salasDisponiveis = salas;
        renderizarSalas(); // Atualizar a lista visual
    });
}

// ===== ATUALIZAR O initializeApp =====
async function initializeApp() {
    const urlInfo = getIdFromUrl();
    
  await  initializeSocketConnection();
   await initializeAutoChats(urlInfo);
   await setupGlobalChatHandlers();
   await setupGameRoomHandlers();
  await  setupSalasAutomaticasHandlers(); // ⭐⭐ ADICIONAR ESTA LINHA ⭐⭐
    
    // Inicializar salas automáticas
  await  inicializarSalasAutomaticas()
    
    if (urlInfo) {
      await  handleUrlRouting(urlInfo);
    }
    
  await  joinGlobalChat()
}
// ===== MELHORAR A FUNÇÃO criarSalaSeNaoExistir =====

// === CRIAR SALA SE NÃO EXISTIR - OTIMIZADA ===
function criarSalaSeNaoExistir(nomeSala, tipo) {
    const salaExiste = Object.values(salasDisponiveis).some(
        sala => sala?.nome === nomeSala
    );

    if (!salaExiste && socket) {
        const roomId = `${tipo}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      //  console.log(`🔄 Criando sala: ${nomeSala} (${roomId})`);

        socket.emit('create-room', {
            room: roomId,
            nome: nomeSala,
            tipo,
            criador: usuarioLogado?.nome || 'Sistema'
        });

        salasDisponiveis[roomId] = { nome: nomeSala, usuarios: 0, tipo };
        renderizarSalas();

       // console.log(`➕ Sala criada localmente: ${nomeSala}`);
    } else if (salaExiste) {
        console.log(`⏩ Sala já existe: ${nomeSala}`);
    } else {
        console.warn('⚠️ Socket não disponível ao tentar criar sala');
    }
}
// ===== ADICIONAR DEBUG NA RENDERIZAÇÃO =====
// === RENDER SALAS - MAIS SEGURA ===
function renderizarSalas() {
    const container = document.getElementById('chatRoomsSection');
    
    if (!container) {
        console.error('❌ Container de salas não encontrado');
        return;
    }
    
   // console.log('🔄 Renderizando salas:', Object.keys(salasDisponiveis).length);

    if (Object.keys(salasDisponiveis).length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; font-size:13px;">Nenhuma sala disponível</div>';
        return;
    }

    container.innerHTML = Object.entries(salasDisponiveis).map(([roomId, info]) => {
        // ⭐⭐ CORREÇÃO: Verificar se info existe
        if (!info) {
            console.warn('⚠️ Info da sala é undefined para roomId:', roomId);
            return '';
        }
        
        const ativo = salaAtual === roomId ? 'active' : '';
        const usuarios = info.usuarios || 0;
        const nome = info.nome || roomId; // ⭐⭐ Fallback para roomId se nome não existir
        
       // console.log(`📝 Renderizando sala: ${nome} (${roomId}) - ${usuarios} users`);
        
        return `
            <div class="room-item ${ativo}" onclick="entrarSala('${roomId}')">
                <div class="room-info">
                    <div class="room-name">${nome}</div>
                    <div class="room-users">${usuarios} online</div>
                </div>
                ${ativo ? '<div style="font-size:10px; color:#28a745;">✓ Conectado</div>' : ''}
            </div>
        `;
    }).join('');
}
   // ===== CHAT GLOBAL + VOZ + CONTADOR + SUAS MENSAGENS APARECEM =====