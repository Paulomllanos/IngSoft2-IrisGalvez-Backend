const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const Rol = require('../models/rol.model');

const login = async (req, res) => {

    try {

        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                message: 'Correo y contraseña son requeridos.'
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                correo: correo.toLowerCase().trim()
            }
        });

        if (!usuario) {
            return res.status(401).json({
                message: 'Credenciales inválidas.'
            });
        }

        if (usuario.estado === 'Inactivo') {
            return res.status(401).json({
                message: 'La cuenta se encuentra deshabilitada.'
            });
        }

        // Si tus contraseñas están hasheadas con bcrypt
        const passwordValido = await bcrypt.compare(
            password,
            usuario.contrasena
        );

        // Si estás usando datos dummy en texto plano,
        // reemplaza temporalmente la línea anterior por:
        // const passwordValido = password === usuario.contrasena;

        if (!passwordValido) {
            return res.status(401).json({
                message: 'Credenciales inválidas.'
            });
        }

        const rol = await Rol.findOne({
            where: {
                usuarios_id_usuario: usuario.id
            }
        });

        const token = jwt.sign(
            {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: rol?.nombre_rol || 'Paciente'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        return res.status(200).json({

            success: true,

            message: 'Autenticación exitosa.',

            token,

            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: rol?.nombre_rol || 'Paciente'
            }

        });

    } catch (error) {

        console.error('Error en login:', error);

        return res.status(500).json({
            message: 'Error interno del servidor.'
        });

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
      return res.status(400).json({
        error: 'El correo electrónico es requerido.'
      });
    }

    const correoNormalizado = email.toLowerCase().trim();

    const usuario = await Usuario.findOne({
      where: { correo: correoNormalizado }
    });

    if (!usuario) {
      return res.status(200).json({
        mensaje:
          'Si el correo está registrado en nuestro sistema, recibirás un enlace de recuperación en breve.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiraEn = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await usuario.update({
      reset_token: resetToken,
      reset_token_expira: expiraEn
    });

    const resetUrl =
      `${process.env.FRONTEND_URL}/recuperar-clave?token=${resetToken}`;

    console.log(`
📧 RECUPERACIÓN DE CONTRASEÑA

Usuario: ${usuario.correo}
Enlace: ${resetUrl}
`);

    return res.status(200).json({
      mensaje:
        'Si el correo está registrado en nuestro sistema, recibirás un enlace de recuperación en breve.'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Ocurrió un error interno.'
    });
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

      return res.status(400).json({
        error: 'Token y contraseña requeridos.'
      });

    }

    const usuario = await Usuario.findOne({

      where: {
        reset_token: token
      }

    });

    if (!usuario) {

      return res.status(400).json({
        error: 'Token inválido.'
      });

    }

    if (
      !usuario.reset_token_expira ||
      new Date(usuario.reset_token_expira) < new Date()
    ) {

      return res.status(400).json({
        error: 'El token ha expirado.'
      });

    }

    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(
      nuevaContrasena,
      salt
    );

    await usuario.update({

      contrasena: passwordHash,

      reset_token: null,

      reset_token_expira: null

    });

    return res.status(200).json({

      mensaje:
        'Contraseña actualizada correctamente.'

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        'Error interno al actualizar contraseña.'

    });

  }

};

/**
 * Registra un nuevo usuario (Paciente o Profesional) en el sistema.
 * Ruta: POST /api/auth/register
 */
const registrarUsuario = async (req, res) => {

  try {

    const {
      rut,
      nombre,
      apellido,
      correo,
      contrasena
    } = req.body;

    if (
      !rut ||
      !nombre ||
      !apellido ||
      !correo ||
      !contrasena
    ) {

      return res.status(400).json({
        error:
          'rut, nombre, apellido, correo y contrasena son obligatorios.'
      });

    }

    const correoNormalizado =
      correo.toLowerCase().trim();

    const usuarioExistente =
      await Usuario.findOne({
        where: {
          correo: correoNormalizado
        }
      });

    if (usuarioExistente) {

      return res.status(400).json({
        error:
          'El correo ya se encuentra registrado.'
      });

    }

    const salt = await bcrypt.genSalt(10);

    const contrasenaHasheada =
      await bcrypt.hash(contrasena, salt);

    const nuevoUsuario =
      await Usuario.create({

        rut: rut.trim(),

        nombre: nombre.trim(),

        apellido: apellido.trim(),

        correo: correoNormalizado,

        contrasena: contrasenaHasheada,

        estado: 'Activo'

      });

      await Rol.create({

        nombre_rol: 'Paciente',

        usuarios_id_usuario: nuevoUsuario.id,

        profesionales_id_profesional: null

      });

    return res.status(201).json({

      success: true,

      mensaje:
        'Usuario registrado exitosamente.',

      usuario: {

        id: nuevoUsuario.id,

        rut: nuevoUsuario.rut,

        nombre: nuevoUsuario.nombre,

        apellido: nuevoUsuario.apellido,

        correo: nuevoUsuario.correo

      }

    });

  } catch (error) {

    console.error(
      'Error en registrarUsuario:',
      error
    );

    return res.status(500).json({

      error:
        'Error interno del servidor.'

    });

  }

};

module.exports = {
  solicitarRecuperacion,
  resetearContrasena,
  registrarUsuario,
  login
};