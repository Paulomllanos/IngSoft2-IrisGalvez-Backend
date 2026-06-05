const Cita = require('../models/cita.model');

/**
 * Genera una sala de videoconferencia segura en Daily.co asociada a una cita.
 * Ruta: POST /api/video/create-room
 */
const crearSalaVideoconferencia = async (req, res) => {
  try {
    const { citaId } = req.body;

    if (!citaId) {
      return res.status(400).json({ error: 'El ID de la cita es requerido.' });
    }

    // Validar la existencia de la cita
    const cita = await Cita.findByPk(citaId);
    if (!cita) {
      return res.status(404).json({ error: 'La cita especificada no existe.' });
    }

    // Si ya tiene una sala creada, evitamos duplicar y devolvemos la existente
    if (cita.videoRoomUrl) {
      return res.status(200).json({
        mensaje: 'La sala de video ya se encuentra activa.',
        videoRoomUrl: cita.videoRoomUrl
      });
    }

    // Llamada al servicio externo de Daily.co usando fetch nativo (Node 18+)
    // Configuramos propiedades de privacidad para evitar intrusos
    const respuestaDaily = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: `cita-iris-${citaId}-${Date.now()}`,
        privacy: 'public', // Puedes cambiarlo a 'private' si manejas tokens de acceso por usuario
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // La sala se destruye automáticamente en 1 hora
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false
        }
      })
    });

    if (!respuestaDaily.ok) {
      const errorData = await respuestaDaily.json();
      console.error('Error proveniente de Daily.co API:', errorData);
      return res.status(502).json({ error: 'Error al comunicarse con el proveedor de videoconferencia.' });
    }

    const dataDaily = await respuestaDaily.json();
    const urlSalaGenerada = dataDaily.url;

    // Persistir la URL de la sala en PostgreSQL
    await cita.update({ videoRoomUrl: urlSalaGenerada });

    return res.status(201).json({
      success: true,
      mensaje: 'Sala de videoconferencia creada y enlazada exitosamente.',
      videoRoomUrl: urlSalaGenerada
    });

  } catch (error) {
    console.error('❌ Error en crearSalaVideoconferencia:', error);
    return res.status(500).json({ error: 'Error interno del servidor al inicializar la videollamada.' });
  }
};

module.exports = {
  crearSalaVideoconferencia
};