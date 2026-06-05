const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const Cita = require('./cita.model');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  monto: {
    type: DataTypes.INTEGER, // Almacenamos en CLP netos (ej: 35000)
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  fechaPago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pagos',
  timestamps: true
});

// Relación 1:1 física: Un pago corresponde estrictamente a una cita
Cita.hasOne(Pago, { foreignKey: 'citaId', onDelete: 'CASCADE' });
Pago.belongsTo(Cita, { foreignKey: 'citaId' });

module.exports = Pago;