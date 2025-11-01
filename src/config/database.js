import mongoose from 'mongoose';
import 'dotenv/config'; // Certifique-se de usar 'dotenv' ou equivalente

// Pega a variável de ambiente (o nome pode variar conforme seu setup)
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