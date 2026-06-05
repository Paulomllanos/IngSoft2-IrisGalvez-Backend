const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const Cita = require('./cita.model');

const Evaluacion = sequelize.define('Evaluacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  puntuacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5 // Validación de escala estándar de satisfacción (estrellas de 1 a 5)
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true // El comentario escrito es opcional
  },
  fechaEvaluacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'evaluaciones',
  timestamps: true
});

// Relación: Una Cita puede tener una única Evaluación de calidad post-servicio
Cita.hasOne(Evaluacion, { foreignKey: 'citaId', onDelete: 'CASCADE' });
Evaluacion.belongsTo(Cita, { foreignKey: 'citaId', as: 'cita' });

module.exports = Evaluacion;