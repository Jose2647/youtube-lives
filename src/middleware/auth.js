import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret';


export const authenticateOptional = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (err) {
            console.log('Token inválido, continuando como visitante');
        }
    }
    next();
};


const authOptional = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // Agora decoded.userId é Number (do user.id)
            const user = { userId: decoded.userId, nome: 'Autenticado', merito: 0 }; // Adapte se precisar de mais dados
            req.user = user;
        } catch (e) {
            req.user = { userId: null, nome: 'Anônimo', merito: 0 };
        }
    } else {
        req.user = { userId: null, nome: 'Anônimo', merito: 0 };
    }
    next();
};