const Evaluacion = require('../models/evaluacion.model');
const Cita = require('../models/cita.model');

/**
 * Registra una nueva evaluación de satisfacción asociada a una cita completada.
 * Ruta: POST /api/evaluations
 */
const registrarEvaluacion = async (req, res) => {
  try {
    const { citaId, puntuacion, comentario } = req.body;

    // Validaciones básicas de entrada
    if (!citaId || !puntuacion) {
      return res.status(400).json({ error: 'El identificador de la cita y la puntuación son requeridos.' });
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'La puntuación debe ser un número entero entre 1 y 5.' });
    }

    // Verificar existencia y estado operativo de la cita
    const cita = await Cita.findByPk(citaId);
    if (!cita) {
      return res.status(404).json({ error: 'La cita especificada no existe en el sistema.' });
    }

    if (cita.estado !== 'completada') {
      return res.status(400).json({ error: 'No es posible evaluar una cita que no ha sido marcada como completada.' });
    }

    // Control de duplicados: Validar que la cita no haya sido evaluada previamente
    const evaluacionExistente = await Evaluacion.findOne({ where: { citaId } });
    if (evaluacionExistente) {
      return res.status(400).json({ error: 'Esta cita ya cuenta con una evaluación registrada.' });
    }

    // Persistir la evaluación en PostgreSQL
    const nuevaEvaluacion = await Evaluacion.create({
      citaId,
      puntuacion,
      comentario: comentario ? comentario.trim() : null
    });

    return res.status(201).json({
      success: true,
      mensaje: 'Evaluación registrada exitosamente. ¡Gracias por tu feedback!',
      data: nuevaEvaluacion
    });

  } catch (error) {
    console.error('❌ Error en registrarEvaluacion:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno al intentar guardar la evaluación.' });
  }
};

module.exports = {
  registrarEvaluacion
};