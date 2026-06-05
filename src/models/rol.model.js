const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const Usuario = require('./usuario.model');

const Rol = sequelize.define('Rol', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_rol'
  },

  nombre_rol: {
    type: DataTypes.STRING(45),
    allowNull: false
  },

  usuarios_id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  profesionales_id_profesional: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  tableName: 'roles',
  timestamps: false
});


module.exports = Rol;