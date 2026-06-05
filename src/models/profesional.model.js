const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Profesional = sequelize.define('Profesional', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'profesionales',
  timestamps: true
});

module.exports = Profesional;