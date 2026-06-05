const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const TokenRecuperacion = require('../models/tokenRecuperacion.model');
const { Op } = require('sequelize'); // Operadores de Sequelize para fechas

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Validar entrada básica
        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña son requeridos." });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ 
        where: { correo: correo.toLowerCase() },
        include: [{ model: Rol, as: 'rolInfo' }]
        });
        
        // Criterio de Aceptación: Validar existencia y estado activo
        if (!usuario || usuario.estado === 'Inactivo') {
            return res.status(401).json({ message: "Error de autenticación: Credenciales inválidas o cuenta deshabilitada." });
        }

        // Verificar contraseña cifrada
        const passwordValido = await bcrypt.compare(password, usuario.contrasena);
        if (!passwordValido) {
            return res.status(401).json({ message: "Error de autenticación: Credenciales inválidas." });
        }

        // Generar JSON Web Token (JWT) con el Rol del usuario (Criterio de arquitectura)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol,
                nombre: usuario.nombre 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } // Token válido por una jornada laboral
        );

        // Otorgar acceso exitoso
        return res.status(200).json({
            message: "Autenticación exitosa.",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en Login:", error);
        return res.status(500).json({ message: "Error interno del servidor al intentar iniciar sesión." });
    }
};

/**
 * Función para solicitar la recuperación de contraseña.
 * Ruta: POST /api/auth/forgot-password
 */
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es requerido.' });
    }

    // Pasamos el email a minúsculas para coincidir con nuestro hook (R002)
    const correoNormalizado = email.toLowerCase().trim();

    // Buscar al usuario
    const usuario = await Usuario.findOne({ where: { correo: correoNormalizado } });
    
    // Si no existe, devolvemos éxito igual para evitar "Email Enumeration"
    if (!usuario) {
      console.log(`Intento de recuperación para correo inexistente: ${correoNormalizado}`);
      return res.status(200).json({ 
        mensaje: 'Si el correo está registrado en nuestro sistema, recibirás un enlace de recuperación en breve.' 
      });
    }

    // Generar un token criptográfico seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Definir expiración (1 hora a partir de ahora)
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000); 

    // Guardar el token en PostgreSQL
    await TokenRecuperacion.create({
      token: resetToken,
      expiraEn: expiraEn,
      usuarioId: usuario.id // Sequelize usa camelCase por defecto para las llaves foráneas
    });

    // Simular el envío de correo (La integración con SendGrid la haremos luego)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recuperar-clave?token=${resetToken}`;
    console.log(`\n📧 [SIMULACIÓN DE CORREO] 
      Para: ${usuario.correo}
      Asunto: Recuperación de Contraseña - Iris Gálvez
      Enlace: ${resetUrl}\n`);

    return res.status(200).json({ 
      mensaje: 'Si el correo está registrado en nuestro sistema, recibirás un enlace de recuperación en breve.' 
    });

  } catch (error) {
    console.error('❌ Error en solicitarRecuperacion:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
  }
};

/**
 * Función para procesar el cambio de contraseña con el token válido.
 * Ruta: POST /api/auth/reset-password
 */
const resetearContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
      return res.status(400).json({ error: 'El token y la nueva contraseña son requeridos.' });
    }

    // Buscar el token en BD asegurándonos de que NO haya expirado
    const registroToken = await TokenRecuperacion.findOne({ 
      where: { 
        token: token,
        expiraEn: { [Op.gt]: new Date() } // Op.gt significa "Greater Than" (Mayor que la fecha actual)
      } 
    });

    if (!registroToken) {
      return res.status(400).json({ error: 'El token es inválido o ha expirado. Por favor, solicita uno nuevo.' });
    }

    // Encriptar la nueva contraseña
    // Un "salt" de 10 rondas es el estándar actual. Equilibra seguridad y rendimiento.
    const salt = await bcrypt.genSalt(10);
    const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, salt);

    // Actualizar la contraseña del usuario asociado al token
    await Usuario.update(
      { contrasena: contrasenaHasheada },
      { where: { id: registroToken.usuarioId } }
    );

    // Eliminar el token de la base de datos para que no se pueda usar 2 veces
    await registroToken.destroy();

    // Opcionalmente, aquí podríamos eliminar TODOS los tokens previos de ese usuario 
    // para limpiar la base de datos: TokenRecuperacion.destroy({ where: { usuarioId: registroToken.usuarioId } });

    return res.status(200).json({ 
      mensaje: 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión en la plataforma.' 
    });

  } catch (error) {
    console.error('❌ Error en resetearContrasena:', error);
    return res.status(500).json({ error: 'Ocurrió un error al intentar cambiar la contraseña.' });
  }
};

/**
 * Registra un nuevo usuario (Paciente o Profesional) en el sistema.
 * Ruta: POST /api/auth/register
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validaciones básicas de entrada
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos (nombre, correo, contrasena) son obligatorios.' });
    }

    // Normalizamos el correo quitando espacios extras y pasándolo a minúsculas
    const correoNormalizado = correo.toLowerCase().trim();

    // Control de duplicados: Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo: correoNormalizado } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en la plataforma.' });
    }

    // Encriptación Criptográfica de la contraseña
    // Generamos un salt de 10 rondas para un hasheo seguro
    const salt = await bcrypt.genSalt(10);
    const contrasenaHasheada = await bcrypt.hash(contrasena, salt);

    // Crear el registro en PostgreSQL a través de Sequelize
    // Gracias al hook 'beforeSave' del modelo Usuario, los campos se guardarán en minúsculas automáticamente cumpliendo R002.
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      contrasena: contrasenaHasheada
    });

    // Devolver la respuesta de éxito (Sin enviar el hash de la contraseña por seguridad)
    return res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente en la plataforma Iris Gálvez.',
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo
      }
    });

  } catch (error) {
    console.error('❌ Error en registrarUsuario:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno en el servidor al procesar el registro.' });
  }
};

module.exports = {
  solicitarRecuperacion,
  resetearContrasena,
  registrarUsuario,
  login
};