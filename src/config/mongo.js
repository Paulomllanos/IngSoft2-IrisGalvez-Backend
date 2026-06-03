const mongoose = require("mongoose");
const dbStatus = require("./database-status");

const connectMongo = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        dbStatus.mongo = true;

        console.log("🍃 MongoDB conectado");

        return true;

    } catch (error) {

        dbStatus.mongo = false;

        console.error("❌ MongoDB:", error.message);

        return false;
    }
};

module.exports = connectMongo;