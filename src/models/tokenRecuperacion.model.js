const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const Usuario = require('./usuario.model');

const TokenRecuperacion = sequelize.define('TokenRecuperacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiraEn: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'tokens_recuperacion',
  timestamps: true
});

// Establecemos la relación física en la base de datos relacional
Usuario.hasMany(TokenRecuperacion, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
TokenRecuperacion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = TokenRecuperacion;