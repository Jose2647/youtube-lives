// src/sockets/sockets.js
import { setupChatSocket } from './chatSocket.js';
import { setupApostaSocket } from './apostaSocket.js';

export const setupSocket = (io) => {
    // Configura ambos os namespaces
    setupChatSocket(io);
    setupApostaSocket(io);
};