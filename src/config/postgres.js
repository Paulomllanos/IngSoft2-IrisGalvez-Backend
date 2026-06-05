const { Sequelize } = require("sequelize");
const dbStatus = require("./database-status");

const sequelize = new Sequelize(
    process.env.POSTGRES_URI,
    {
        dialect: "postgres",
        logging: false
    }
);

const connectPostgres = async () => {
    try {

        await sequelize.authenticate();

        dbStatus.postgres = true;

        console.log("🐘 PostgreSQL conectado");
        // Importamos los modelos para registrar las relaciones
        // require('../models/usuario.model');
        // require('../models/tokenRecuperacion.model');
        // require('../models/profesional.model');
        // require('../models/cita.model');
        // require('../models/pago.model');
        // require('../models/evaluacion.model');
        
        // // Sincroniza los modelos con la base de datos (alter: true actualiza el esquema sin borrar datos)
        // await sequelize.sync({ alter: true });
        // console.log("🔄 Tablas de PostgreSQL sincronizadas exitosamente");

        return true;

    } catch (error) {

        dbStatus.postgres = false;

        console.error("❌ PostgreSQL:", error.message);

        return false;
    }
};

module.exports = {
    sequelize,
    connectPostgres
};