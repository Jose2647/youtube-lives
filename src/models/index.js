import mongoose from 'mongoose';



// Schemas separados para melhor organização no MongoDB
const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    nome: String,
    usuario: { type: String, unique: true },
    email: { type: String, unique: true },
    senha: String,
    contaBancaria: String,
    chavePix: String,
    merito: Number,
    desafiosCumpridos: Number,
    desafiosFalhados: Number,
    pagamentosRealizados: Number,
    pagamentosPendentes: Number,
    amigos: [String],
    imagem: String
});

const apostaSchema = new mongoose.Schema({
    cardId: String,
    apostas: [{
        id: Number,
        titulo: String,
        descricao: String,
        opcoes: [String],
        valor: Number,
        dataEncerramento: Date,
        criador: String,
        participantes: [{ usuario: String, opcao: String, data: Date }],
        status: String,
        dataCriacao: Date,
        opcaoVencedora: String,
        comprovantes: [{ usuario: String, comprovante: String, data: Date, status: String }]
    }],
    criador: String,
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
        criador: String,
        participantes: [{ usuario: String, opcao: String, data: Date }],
        status: String,
        dataCriacao: Date,
        opcaoVencedora: String,
        comprovantes: [{ usuario: String, comprovante: String, data: Date, status: String }]
    }],
    criador: String,
    dataCriacao: Date
});

// Schemas separados para estrutura MongoDB não relacional
const jogoSchema = new mongoose.Schema({
    id: Number,
    nome: String,
    imagem: String
});

const estadioSchema = new mongoose.Schema({
    id: Number,
    jogoId: Number, // Referência ao jogo
    nome: String,
    imagem: String
});

const timeSchema = new mongoose.Schema({
    id: Number,
    estadioId: Number, // Referência ao estádio
    nome: String,
    imagem: String
});

const liveSchema = new mongoose.Schema({
    id: Number,
    timeId: Number, // Referência ao time
    titulo: String,
    descricao: String,
    status: String,
    criador: String,
    dataCriacao: { type: Date, default: Date.now }
});

const divHorizontalSchema = new mongoose.Schema({
    id: Number,
    liveId: Number, // Referência à live
    titulo: String,
    tamanho: String,
    criador: String
});

const cardSchema = new mongoose.Schema({
    id: Number,
    divHorizontalId: Number, // Referência à div horizontal
    titulo: String,
    iframeUrl: String,
    criador: String
});

const streamerSchema = new mongoose.Schema({
    id: Number,
    liveId: Number, // Referência à live
    nome: String,
    usuario: String,
    senha: String,
    online: Boolean,
    imagem: String,
    chavePix: String,
    merito: Number
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

const chatSchema = new mongoose.Schema({
    room: { type: String, required: true, index: true }, // ex: "live-1-visitante"
    usuario: { type: String, required: true },
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
});
/*
const chatSchema = new mongoose.Schema({
    cardId: String,
    messages: [{
        usuario: String,
        mensagem: String,
        data: Date,
        readBy: [String]
    }],
    voiceParticipants: [String]
});
*/


// Models
const User = mongoose.model('User', userSchema);
const Aposta = mongoose.model('Aposta', apostaSchema);
const Desafio = mongoose.model('Desafio', desafioSchema);
//const Chat = mongoose.model('Chat', chatSchema);
const Jogo = mongoose.model('Jogo', jogoSchema);
const Estadio = mongoose.model('Estadio', estadioSchema);
const Time = mongoose.model('Time', timeSchema);
const Live = mongoose.model('Live', liveSchema);
const DivHorizontal = mongoose.model('DivHorizontal', divHorizontalSchema);
const Card = mongoose.model('Card', cardSchema);
const Streamer = mongoose.model('Streamer', streamerSchema);
const Notificacao = mongoose.model('Notificacao', notificacaoSchema);
const Evento = mongoose.model('Evento', eventoSchema);
// Modelo para Invite
const Invite = mongoose.model('Invite', inviteSchema);
// Exportação dos Modelos
const Chat =  mongoose.model('Chat', chatSchema);
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
    Chat
};