const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const systemRoutes = require("./routes/system.routes");

/*
|--------------------------------------------------------------------------
| Middlewares Globales
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(cors({
    origin: "*"
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(morgan("dev"));

app.use("/api/system", systemRoutes);

/*
|--------------------------------------------------------------------------
| Ruta Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Servidor operativo"
    });
});

app.get("/api/status", (req, res) => {

    return res.status(200).json({
        success: true,
        service: "Iris Backend",
        database: "MongoDB Connected"
    });

});

module.exports = app;