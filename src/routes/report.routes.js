const express = require('express');
const router = express.Router();
const { generarReporteMensualCSV } = require('../controllers/reportController');

// Ruta protegida para descargas administrativas
router.get('/monthly', generarReporteMensualCSV);

module.exports = router;