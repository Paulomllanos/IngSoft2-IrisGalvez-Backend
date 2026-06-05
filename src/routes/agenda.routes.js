const express = require('express');
const router = express.Router();
const { configurarBloqueHorario } = require('../controllers/agendaController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Endpoint exclusivo para usuarios con rol de 'Profesional'
router.post('/configurar', verificarToken(['Profesional']), configurarBloqueHorario);

module.exports = router;