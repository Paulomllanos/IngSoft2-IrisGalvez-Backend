const express = require('express');
const router = express.Router();
const { registrarUsuario, login, solicitarRecuperacion, resetearContrasena } = require('../controllers/authController');

// Endpoint para HU01 - Registrar Usuario
router.post('/register', registrarUsuario);

// Endpoint para HU02 - Iniciar Sesión
router.post('/login', login);

// Endpoints para HU15 - Recuperación de Contraseña
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', resetearContrasena);

module.exports = router;