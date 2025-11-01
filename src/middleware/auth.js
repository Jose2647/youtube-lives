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