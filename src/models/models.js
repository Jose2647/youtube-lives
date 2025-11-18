


import mongoose from 'mongoose';
// Schemas separados para melhor organização no MongoDB
const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imagem: { type: String, default: 'default-usuario.png' },
    senha: { type: String, required: true },
    merito: { type: Number, default: 100, min: 0, max: 100 },
    conquistas: {
        type: String,
        enum: ['latão', 'bronze', 'platina', 'ouro', 'diamante'],
        default: 'latão'
    },
    contaBancaria: String,
    chavePix: String,
    desafiosCumpridos: Number,
    desafiosFalhados: Number,
    pagamentosRealizados: Number,
    pagamentosPendentes: Number,
    ultimoComprovantePix: { type: String, default: null },
    amigos: [String]
});

// Garante que mérito nunca ultrapasse 100 ou fique abaixo de 0
userSchema.pre('save', function(next) {
    if (this.merito > 100) this.merito = 100;
    if (this.merito < 0) this.merito = 0;
    next();
});

// Exemplo para ApostaSchema (e DesafioSchema)
const ApostaSchema = new mongoose.Schema({
    cardId: String,
    apostas: [{
        id: Number,
        titulo: String,
        opcoes: [String],
        valor: Number,
        dataEncerramento: Date,
        criador: String, // <-- Isto agora armazena o EMAIL do criador
        participantes: [{
            email: String, // <-- Mudou de 'usuario'
            opcao: String,
            data: Date
        }],
        status: String
    }],
    criador: String, // <-- Isto agora armazena o EMAIL do criador
    dataCriacao: Date
});
const desafioSchema = new mongoose.Schema({
    cardId: String,
    desafios: [{
        id: Number,
        titulo: String,
        descricao: String,
        opcoes: [String],
        valor: Number,
        dataEncerramento: Date,
        criador: String,  // email
        participantes: [{ email: String, opcao: String, data: Date }],  
        status: String,
        dataCriacao: Date,
        opcaoVENCEDORA: String, // ATENÇÃO: Corrigido para corresponder ao seu router (era 'opcaoVencedora')
        comprovantes: [{ email: String, comprovante: String, data: Date, status: String }]  
    }],
    criador: String,
    dataCriacao: Date
});

// ===== SCHEMAS MODIFICADOS (REQUERIMENTO 1 e 2) =====

const jogoSchema = new mongoose.Schema({
    id: Number,
    nome: String,
    iframeUrl: String,
    // CAMPOS ADICIONADOS:
    creatorId: { type: Number, required: true }, // Referência ao User.id
    senha: { type: String, required: true } // Senha para modificar este item (deve ser hasheada)
});
const estadioSchema = new mongoose.Schema({
    id: Number,
    jogoId: Number, // Referência ao jogo
    nome: String,
    iframeUrl: String,
    // CAMPOS ADICIONADOS:
    creatorId: { type: Number, required: true },
    senha: { type: String, required: true }
});
const timeSchema = new mongoose.Schema({
    id: Number,
    estadioId: Number, // Referência ao estádio
    nome: String,
    iframeUrl: String,
    // CAMPOS ADICIONADOS:
    creatorId: { type: Number, required: true },
    senha: { type: String, required: true }
});
const liveSchema = new mongoose.Schema({
    id: Number,
    timeId: Number, // Referência ao time
    titulo: String,
    descricao: String,
    status: String,
    iframeUrl: String,
    // CAMPOS MODIFICADOS/ADICIONADOS:
    creatorId: { type: Number, required: true }, // <-- SUBSTITUIU 'criador: String'
    senha: { type: String, required: true }, // <-- ADICIONADO
    dataCriacao: { type: Date, default: Date.now }
});
const divHorizontalSchema = new mongoose.Schema({
    id: Number,
    liveId: Number, // Referência à live
    titulo: String,
    tamanho: String,
    // CAMPOS MODIFICADOS/ADICIONADOS:
    creatorId: { type: Number, required: true }, // <-- SUBSTITUIU 'criador: String'
    senha: { type: String, required: true } // <-- ADICIONADO
});
const cardSchema = new mongoose.Schema({
    id: Number,
    divHorizontalId: Number, // Referência à div horizontal
    titulo: String,
    iframeUrl: String,
    // CAMPOS MODIFICADOS/ADICIONADOS:
    creatorId: { type: Number, required: true }, // <-- SUBSTITUIU 'criador: String'
    senha: { type: String, required: true } // <-- ADICIONADO
});

// ===== NOVO SCHEMA (REQUERIMENTO 3) =====

/**
 * Schema para a lista geral de iframes gravados
 */
const iframeRegistroSchema = new mongoose.Schema({
    iframeUrl: { type: String, required: true },
    // Informa de onde veio o iframe (ex: 'Jogo', 'Live', 'Card')
    origemTipo: { type: String, enum: ['Jogo', 'Estadio', 'Time', 'Live', 'Card'], required: true },
    // O ID (numérico) do item de origem
    origemId: { type: Number, required: true },
    // O ID (numérico) do usuário que o adicionou
    creatorId: { type: Number, required: true }, 
    createdAt: { type: Date, default: Date.now }
});

// ==========================================

// Exemplo de como o StreamerSchema deve ficar
const StreamerSchema = new mongoose.Schema({
    id: { type: Number },
    liveId: { type: Number },
    nome: { type: String },
    email: { type: String, required: true }, // <-- Mudou de 'usuario'
    online: { type: Boolean },
    imagem: { type: String },
    merito: { type: Number }
});
const notificacaoSchema = new mongoose.Schema({
    mensagem: String,
    tipo: String,
    data: Date,
    userId: Number
});
const eventoSchema = new mongoose.Schema({
    id: Number,
    nome: String,
    data: Date,
    descricao: String
});
// Schema para Invite
const inviteSchema = new mongoose.Schema({
    inviteCode: { type: String, unique: true },
    creatorId: { type: Number, required: true },
    invitedUserId: { type: Number, default: null },
    jogoId: { type: Number, default: null },
    estadioId: { type: Number, default: null },
    timeId: { type: Number, default: null },
    liveId: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    usedAt: { type: Date, default: null }
});
// Exemplo de como o ChatSchema deve ficar
const ChatSchema = new mongoose.Schema({
    room: { type: String, required: true },
    email: { type: String, required: true }, // <-- Mudou de 'usuario'
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Aposta = mongoose.model('Aposta', ApostaSchema);
const Desafio = mongoose.model('Desafio', desafioSchema);
//const Chat = mongoose.model('Chat', chatSchema);
const Jogo = mongoose.model('Jogo', jogoSchema);
const Estadio = mongoose.model('Estadio', estadioSchema);
const Time = mongoose.model('Time', timeSchema);
const Live = mongoose.model('Live', liveSchema);
const DivHorizontal = mongoose.model('DivHorizontal', divHorizontalSchema);
const Card = mongoose.model('Card', cardSchema);
const Streamer = mongoose.model('Streamer', StreamerSchema);
const Notificacao = mongoose.model('Notificacao', notificacaoSchema);
const Evento = mongoose.model('Evento', eventoSchema);
const Invite = mongoose.model('Invite', inviteSchema);
const Chat =  mongoose.model('Chat', ChatSchema);
const IframeRegistro = mongoose.model('IframeRegistro', iframeRegistroSchema); // <-- NOVO MODELO

// Exportação dos Modelos
export {
    User,
    Aposta,
    Desafio,
  //  Chat,
    Jogo,
    Estadio,
    Time,
    Live,
    DivHorizontal,
    Card,
    Streamer,
    Notificacao,
    Evento ,
    Invite ,
    Chat,
    IframeRegistro // <-- EXPORTAÇÃO DO NOVO MODELO
};