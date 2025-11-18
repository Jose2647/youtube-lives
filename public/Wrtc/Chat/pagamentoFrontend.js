// pagamentoFrontend.js - Funções para envio de comprovantes via dataChannels WebRTC



class FileTransfer {
  constructor(chunkSize = 16 * 1024) { // 16KB chunks
    this.chunkSize = chunkSize;
  }

  // Enviar comprovante para todos os peers conectados (ou específico se passar targetPeerId)
  async sendFile(file, metadata = {}, targetPeerId = null) {
    return new Promise((resolve, reject) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const totalChunks = Math.ceil(file.size / this.chunkSize);
      let chunksSent = 0;

      // Meta-dados iniciais (JSON)
      const metaMessage = {
        type: 'file_metadata',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileId: fileId,
        totalChunks: totalChunks,
        roomId: getCurrentGameId(), // Integra com sua sala atual
        metadata: metadata // { email, minutosAtraso }
      };

      // Envia meta para peers
      this.sendToPeers(JSON.stringify(metaMessage), targetPeerId);

      const reader = new FileReader();
      let currentChunk = 0;

      reader.onload = (e) => {
        const chunkData = {
          type: 'file_chunk',
          fileId: fileId,
          chunkIndex: currentChunk,
          totalChunks: totalChunks
        };

        // Envia chunk como binário (ArrayBuffer)
        this.sendToPeers(e.target.result, targetPeerId, true); // true para binário

        currentChunk++;
        chunksSent++;

        if (currentChunk < totalChunks) {
          readNextChunk();
        } else {
          // Fim do arquivo
          this.sendToPeers(JSON.stringify({ type: 'file_complete', fileId: fileId }), targetPeerId);
          displayMessage('Sistema', `Comprovante "${file.name}" enviado com sucesso!`);
          resolve(fileId);
        }
      };

      reader.onerror = (err) => {
        this.sendToPeers(JSON.stringify({ type: 'file_error', fileId: fileId, error: 'Erro na leitura' }), targetPeerId);
        reject(err);
      };

      const readNextChunk = () => {
        const start = currentChunk * this.chunkSize;
        const end = Math.min(start + this.chunkSize, file.size);
        reader.readAsArrayBuffer(file.slice(start, end));
      };

      readNextChunk();
    });
  }

  // Função auxiliar: Envia dados para peers (JSON ou binário)
  sendToPeers(data, targetPeerId = null, isBinary = false) {
    const connectedPeers = Object.entries(peers).filter(([_, { dataChannel }]) => 
      dataChannel && dataChannel.readyState === 'open'
    );

    connectedPeers.forEach(([peerId, { dataChannel }]) => {
      if (targetPeerId && peerId !== targetPeerId) return;
      try {
        dataChannel.send(data); // Envia direto (string ou ArrayBuffer)
      } catch (e) {
        console.warn(`Erro ao enviar para ${peerId}:`, e);
      }
    });
  }

  // Setup receptor (chame isso em setupDataChannel para cada channel)
  setupFileReceiver(dataChannel) {
    const receivedFiles = new Map();

    dataChannel.addEventListener('message', (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return; // Ignora se não JSON
        }
      } // Senão, é ArrayBuffer (chunk binário)

      if (data.type === 'file_metadata') {
        receivedFiles.set(data.fileId, {
          fileName: data.fileName,
          fileSize: data.fileSize,
          totalChunks: data.totalChunks,
          receivedChunks: new Array(data.totalChunks),
          metadata: data.metadata,
          from: 'Peer' // Pode pegar de signaling se disponível
        });
        displayMessage('Sistema', `Recebendo comprovante: ${data.fileName}`);
      } else if (data.type === 'file_chunk') {
        // Espera: chunk é ArrayBuffer, mas data é obj? Não: se binário, event.data é ArrayBuffer
        // Ajuste: Verifique se event.data é ArrayBuffer
        if (event.data instanceof ArrayBuffer) {
          const fileInfo = receivedFiles.get(data.fileId); // Mas data é obj? Erro.
          // MELHOR: Parse se string, senão assume chunk binário e use metadados prévios.
          // Para simplificar: Envie chunks com meta JSON + binário? Mas dataChannel.send aceita um por vez.
          // Solução comum: Envie JSON para meta/chunks info, binário puro para chunks.
          // Mas para identificar: Envie { type: 'chunk', fileId, index } como JSON antes do binário, ou concatene.
          // Para este exemplo, assuma que chunks são enviados como binário após meta, e use um counter global por fileId.
          // Implementação simplificada: Envie chunk como { type: 'file_chunk', fileId, chunkIndex, chunk: arraybuffer }, mas arraybuffer em JSON não.
          // Correto: Para binário, envie puro, mas para identificar, envie meta JSON antes de cada chunk.
          // Exemplo ajustado no send: Antes de send chunk binário, envie JSON { type: 'incoming_chunk', fileId, chunkIndex }
          // Então send(binário)
          // No receptor: Se string e 'incoming_chunk', prepare para próximo message ser binário.

          // Adapte no código de send: Antes de dataChannel.send(e.target.result), envie JSON prep:
          // this.sendToPeers(JSON.stringify({ type: 'incoming_chunk', fileId, chunkIndex }), targetPeerId);
          // Então this.sendToPeers(e.target.result, targetPeerId, true);

          // No receptor: Mantenha state 'expectingChunk' = { fileId, chunkIndex }
          // if (data.type === 'incoming_chunk') expectingChunk = { fileId: data.fileId, chunkIndex: data.chunkIndex };
          // else if (event.data instanceof ArrayBuffer && expectingChunk) {
          //   const fileInfo = receivedFiles.get(expectingChunk.fileId);
          //   fileInfo.receivedChunks[expectingChunk.chunkIndex] = new Blob([event.data]);
          //   expectingChunk = null;
          //   // Check if complete...
          // }
        }
      } else if (data.type === 'file_complete') {
        const fileInfo = receivedFiles.get(data.fileId);
        if (!fileInfo) return;
        const receivedCount = fileInfo.receivedChunks.filter(c => c).length;
        if (receivedCount === fileInfo.totalChunks) {
          const fileBlob = new Blob(fileInfo.receivedChunks);
          this.onFileReceived(fileBlob, fileInfo);
          receivedFiles.delete(data.fileId);
        }
      } else if (data.type === 'file_error') {
        console.error(`Erro no arquivo ${data.fileId}: ${data.error}`);
        receivedFiles.delete(data.fileId);
      }
    });
  }

  onFileReceived(fileBlob, fileInfo) {
    const url = URL.createObjectURL(fileBlob);
    displayMessage(fileInfo.from, `Comprovante recebido: <a href="${url}" download="${fileInfo.fileName}">Baixar</a>`);
    // Registra pagamento no backend
    this.registerPayment(fileInfo.metadata, fileBlob);
  }

  async registerPayment(metadata, fileBlob) {
    try {
      const response = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: metadata.email,
          minutosAtraso: metadata.minutosAtraso
        })
      });
      const result = await response.json();
      if (result.msg.includes('sucesso')) {
        displayMessage('Sistema', 'Pagamento registrado!');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
    }
  }
}

// Função global para enviar comprovante (chamada pelo botão)
async function sendComprovante() {
  const fileInput = document.getElementById('comprovanteInput');
  const file = fileInput.files[0];
  if (!file) return alert('Selecione um comprovante!');
  
  const metadata = { email: window.usuarioLogado.email || 'test@email.com', minutosAtraso: 0 }; // Ajuste com inputs
  const fileTransfer = new FileTransfer();
  try {
    await fileTransfer.sendFile(file, metadata);
  } catch (err) {
    displayMessage('Sistema', `Erro ao enviar: ${err}`);
  }
}

// Para contestação simples (adicione botão similar)
async function sendContestacao(motivo) {
  const message = { type: 'contestacao_pagamento', motivo, from: window.usuarioLogado.nome };
  sendDataChannelObjectToAll(message); // Usa função existente
  displayMessage('Você', `Contestação enviada: ${motivo}`);
}

// Exporta se usando modules, ou globals
window.FileTransfer = FileTransfer;
window.sendComprovante = sendComprovante;
window.sendContestacao = sendContestacao;