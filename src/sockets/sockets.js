

// src/sockets/sockets.js

// Certifique-se de ter os imports corretos para chat e aposta se for mantê-los
// import { setupChatSocket } from './chatSocket.js';
// import { setupApostaSocket } from './apostaSocket.js';
import { setupWebRTCSignaling } from './webrtcSocket.js'; // NOVO IMPORT

export const setupSocket = (io) => {
    // Configura os namespaces existentes
    // setupChatSocket(io); 
    // setupApostaSocket(io);
    
    // Configura o sinalizador WebRTC (Agora integrado)
    setupWebRTCSignaling(io); // NOVO
};