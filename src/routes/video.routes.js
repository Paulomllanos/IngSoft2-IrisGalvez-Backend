const express = require('express');
const router = express.Router();
const { crearSalaVideoconferencia } = require('../controllers/videoController');

// Endpoint que llamará el frontend antes de renderizar la videollamada
router.post('/create-room', crearSalaVideoconferencia);

module.exports = router;