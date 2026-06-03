require("dotenv").config();

const app = require("./app");

const connectMongo = require("./config/mongo");

const {
    connectPostgres
} = require("./config/postgres");

const PORT = process.env.PORT || 3000;

const startServer = async () => {

    const mongoStatus = await connectMongo();

    const postgresStatus = await connectPostgres();

    console.log(`
=================================
MongoDB: ${mongoStatus ? "✅ UP" : "❌ DOWN"}
PostgreSQL: ${postgresStatus ? "✅ UP" : "❌ DOWN"}
=================================
    `);

    app.listen(PORT, () => {

        console.log(`
=================================
🚀 Iris Backend iniciado
📡 Puerto ${PORT}
=================================
        `);

    });
};

startServer();