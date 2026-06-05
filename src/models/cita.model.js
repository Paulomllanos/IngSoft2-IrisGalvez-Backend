const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const Profesional = require('./profesional.model');
const Usuario = require('./usuario.model');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  pacienteNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoRoomUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'citas',
  timestamps: true
});

// Relación: Una cita pertenece a un profesional
Profesional.hasMany(Cita, { foreignKey: 'profesionalId', onDelete: 'RESTRICT' });
// Mapeo correcto para que coincida con el script SQL
Cita.belongsTo(Usuario, { foreignKey: 'usuarios_id_usuario', as: 'paciente' });
Cita.belongsTo(Profesional, { foreignKey: 'profesionales_id_profesional', as: 'profesional' });

module.exports = Cita;