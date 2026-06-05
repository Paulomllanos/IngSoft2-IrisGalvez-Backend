const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const systemRoutes = require("./routes/system.routes");
const authRoutes = require("./routes/auth.routes");
const professionalsRoutes = require("./routes/professionals.routes");
const reportRoutes = require("./routes/report.routes");
const evaluacionRoutes = require("./routes/evaluacion.routes");
const videoRoutes = require("./routes/video.routes");
const agendaRoutes = require("./routes/agenda.routes");
const citaRoutes = require("./routes/cita.routes");

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
app.use("/api/profesionales", professionalsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/evaluations", evaluacionRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/citas", citaRoutes);

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

app.use('/api/auth', authRoutes); // Tus rutas ahora responderán en /api/auth/forgot-password y /api/auth/reset-password

module.exports = app;