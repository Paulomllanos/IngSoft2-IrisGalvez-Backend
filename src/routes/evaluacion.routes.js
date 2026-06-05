const express = require('express');
const router = express.Router();
const { registrarEvaluacion } = require('../controllers/evaluacionController');

// Endpoint para el formulario de feedback automático
router.post('/', registrarEvaluacion);

module.exports = router;