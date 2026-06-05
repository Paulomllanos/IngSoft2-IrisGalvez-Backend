const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_usuario' // Mapea directamente con la clave primaria del script SQL
  },
  rut: {
    type: DataTypes.STRING(12),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(45),
    defaultValue: 'Activo'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeSave: (usuario) => {
      if (usuario.correo) {
        usuario.correo = usuario.correo.toLowerCase().trim();
      }
    }
  }
});

module.exports = Usuario;