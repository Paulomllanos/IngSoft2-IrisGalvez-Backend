const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Profesional = sequelize.define('Profesional', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_profesional'
  },

  usuarios_id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },

  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  registro_minsal: {
    type: DataTypes.STRING(45),
    allowNull: true
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true
  }

}, {
  tableName: 'profesionales',
  timestamps: false
});

module.exports = Profesional;