import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega o arquivo .env do mesmo diretório
dotenv.config();

// Agora você pode acessar as variáveis do .env
const MONGO_URI = process.env.MONGO_URI;






export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado ao MongoDB Atlas');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err);
        throw err;
    }
};