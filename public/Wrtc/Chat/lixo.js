async function callAll() {
  console.log('[CALL] Iniciando callAll para peers (na sala atual):', currentGameId);

  
  const peerIds = Object.keys(peers);
  for (const peerId of peerIds) {
    const peer = peers[peerId];
    if (!peer) continue;
    if (peer.dataChannel && peer.dataChannel.readyState === 'open') continue;
    
    // (Atenção: Esta lógica ainda tentará ligar para TODOS)
    // Uma lógica melhor seria filtrar peers por sala (exigiria mudança no 'peers')
    
    try {
      await createPeerConnection(peerId, true); // Tenta ser o Ofertante
    } catch (e) {
      console.warn('Erro criando offer para', peerId, e);
    }
  }
}
function syncDataToPeers() {
   salvarDados(); // Salva local

  const gameId = getCurrentGameId();
  const filteredPayload = getFilteredDataByGameId(gameId);
  const syncObject = { type: 'sync_data', payload: filteredPayload, version: Date.now(), gameId: gameId };
  sendDataChannelObjectToAll(syncObject);
  logMessage(`[LOG] Dados do Jogo ${gameId} sincronizados com peers.`);
}
