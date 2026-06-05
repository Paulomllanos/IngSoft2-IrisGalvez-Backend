const jwt = require('jsonwebtoken');

const verificarToken = (rolesPermitidos = []) => {
    return (req, res, next) => {
        const tokenHeader = req.headers['authorization'];
        
        if (!tokenHeader) {
            return res.status(403).json({ error: 'No se proporcionó un token de acceso.' });
        }

        // Formato estándar: "Bearer <token>"
        const token = tokenHeader.split(' ')[1];
        if (!token) {
            return res.status(403).json({ error: 'Formato de token inválido.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = decoded; // Inyectamos los datos decodificados en la petición

            // Validar si el rol del usuario está autorizado para este endpoint
            if (rolesPermitidos.length && !rolesPermitidos.includes(decoded.rol)) {
                return res.status(403).json({ error: 'Acceso denegado: No posees los permisos necesarios.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
};

module.exports = { verificarToken };