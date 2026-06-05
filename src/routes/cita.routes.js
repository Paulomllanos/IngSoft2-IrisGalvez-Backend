const express = require('express');
const router = express.Router();
const { agendarCita } = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Endpoint restringido solo para Pacientes/Clientes autenticados
router.post('/agendar', verificarToken(['Cliente']), agendarCita);

module.exports = router;