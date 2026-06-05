const { sequelize } = require('../config/postgres'); // Instancia de conexión para manejar transacciones
const BloqueHorario = require('../models/bloqueHorario.model');
const Cita = require('../models/cita.model');

/**
 * Motor de agendamiento de citas con control estricto de concurrencia.
 * Ruta: POST /api/citas/agendar
 */
const agendarCita = async (req, res) => {
  // Iniciamos una transacción gestionada por Sequelize para asegurar atomicidad
  const t = await sequelize.transaction();

  try {
    const { bloqueId } = req.body;
    const clienteId = req.usuario.id; // Extraído del token JWT por el middleware de autenticación

    if (!bloqueId) {
      return res.status(400).json({ error: 'El identificador del bloque horario (bloqueId) es requerido.' });
    }

    // Buscar el bloque usando SELECT FOR UPDATE para bloquear la fila en la BD
    // Esto evita que otra transacción simultánea lea el estado "Disponible" al mismo tiempo
    const bloque = await BloqueHorario.findOne({
      where: { id: bloqueId },
      lock: t.LOCK.UPDATE, // Bloqueo a nivel de fila (Row-level lock)
      transaction: t
    });

    // Validar si el bloque existe
    if (!bloque) {
      await t.rollback();
      return res.status(404).json({ error: 'El bloque horario seleccionado no existe.' });
    }

    // Criterio de Aceptación: Verificar disponibilidad real (Evitar condiciones de carrera)
    if (bloque.estado !== 'Disponible') {
      await t.rollback();
      return res.status(400).json({ 
        error: 'El bloque horario ya no se encuentra disponible. Por favor, selecciona otro horario.' 
      });
    }

    // Cambiar el estado del bloque a "Reservado" temporalmente para el flujo de pago
    bloque.estado = 'Reservado';
    await bloque.save({ transaction: t });

    // Crear el registro de la Cita enlazada
    // Inicialmente queda en estado 'Reservada' o 'Pendiente de Pago' hasta que HU07 la confirme
    const nuevaCita = await Cita.create({
      clienteId: clienteId,
      profesionalId: bloque.profesionalId,
      bloqueHorarioId: bloque.id,
      fechaHora: `${bloque.fecha} ${bloque.horaInicio}`, // Combinamos para trazabilidad
      estado: 'Reservada'
    }, { transaction: t });

    // Si todo salió bien, consolidamos los cambios en PostgreSQL
    await t.commit();

    return res.status(201).json({
      success: true,
      mensaje: 'Cita reservada exitosamente. Tienes un tiempo límite para procesar el pago.',
      cita: {
        id: nuevaCita.id,
        profesionalId: nuevaCita.profesionalId,
        fechaHora: nuevaCita.fechaHora,
        estado: nuevaCita.estado
      }
    });

  } catch (error) {
    // Si ocurre cualquier fallo, deshacemos todos los cambios para mantener la integridad de la agenda
    await t.rollback();
    console.error('❌ Error transaccional en agendarCita:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno al intentar procesar la reserva.' });
  }
};

module.exports = {
  agendarCita
};