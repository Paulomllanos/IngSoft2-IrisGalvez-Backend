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