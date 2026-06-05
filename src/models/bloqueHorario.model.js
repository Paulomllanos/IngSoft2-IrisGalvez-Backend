const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres'); // Asegúrate de que esta sea la ruta correcta a tu instancia configurada de Sequelize

const BloqueHorario = sequelize.define('BloqueHorario', {
  id_bloque: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_bloque' // Mapeo al estándar snake_case si se requiere en PostgreSQL
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'profesionales_id_profesional', // Nombre de la columna física en la BD relacional
    references: {
      model: 'profesionales', // Nombre de la tabla de destino
      key: 'id_profesional'
    },
    onDelete: 'CASCADE'
  },
  fecha: {
    type: DataTypes.DATEONLY, // Guarda únicamente la fecha (AAAA-MM-DD) sin zona horaria
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.TIME, // Guarda el formato de tiempo (HH:MM:SS)
    allowNull: false,
    field: 'hora_inicio'
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'hora_fin'
  },
  estado: {
    type: DataTypes.STRING(45),
    allowNull: false,
    defaultValue: 'Disponible' // Satisface la inicialización automática del controlador
  }
}, {
  tableName: 'bloques_horarios', // Nombre explícito de la tabla en PostgreSQL
  timestamps: false // Si usas createdAt y updatedAt, cámbialo a true
});

module.exports = BloqueHorario;