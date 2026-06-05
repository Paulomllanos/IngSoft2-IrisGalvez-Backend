const BloqueHorario = require('../models/bloqueHorario.model');
const { Op } = require('sequelize'); // Operadores de Sequelize para comparaciones temporales

/**
 * Registra un bloque de disponibilidad para un Profesional de la salud o coach.
 * Ruta: POST /api/agenda/configurar
 */
const configurarBloqueHorario = async (req, res) => {
  try {
    const { fecha, horaInicio, horaFin } = req.body;
    const profesionalId = req.usuario.id; // Extraído de manera segura del JWT por el middleware

    // Validaciones básicas de negocio
    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ error: 'La fecha, hora de inicio y hora de fin son campos obligatorios.' });
    }

    if (horaInicio >= horaFin) {
      return res.status(400).json({ error: 'La hora de inicio debe ser estrictamente anterior a la hora de fin.' });
    }

    // Control de Traslapes (Criterio de Aceptación HU04 / R004)
    // Buscamos si existe algún bloque activo del mismo profesional cuyas horas se crucen
    const bloqueTraslapado = await BloqueHorario.findOne({
      where: {
        profesionalId: profesionalId,
        fecha: fecha,
        [Op.or]: [
          {
            // Caso 1: El nuevo bloque empieza dentro de un bloque existente
            horaInicio: { [Op.lte]: horaInicio },
            horaFin: { [Op.gt]: horaInicio }
          },
          {
            // Caso 2: El nuevo bloque termina dentro de un bloque existente
            horaInicio: { [Op.lt]: horaFin },
            horaFin: { [Op.gte]: horaFin }
          },
          {
            // Caso 3: El nuevo bloque contiene por completo a un bloque existente
            horaInicio: { [Op.gte]: horaInicio },
            horaFin: { [Op.lte]: horaFin }
          }
        ]
      }
    });

    if (bloqueTraslapado) {
      return res.status(400).json({ 
        error: 'Conflicto de horario: El bloque que intentas configurar se traslapa con una disponibilidad ya registrada.' 
      });
    }

    // Persistencia de la disponibilidad
    const nuevoBloque = await BloqueHorario.create({
      profesionalId,
      fecha,
      horaInicio,
      horaFin,
      estado: 'Disponible' // Inicialmente disponible para agendamiento público
    });

    return res.status(201).json({
      success: true,
      mensaje: 'Bloque de atención configurado exitosamente.',
      bloque: nuevoBloque
    });

  } catch (error) {
    console.error('❌ Error en configurarBloqueHorario:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno en el servidor al guardar la disponibilidad.' });
  }
};

module.exports = {
  configurarBloqueHorario
};