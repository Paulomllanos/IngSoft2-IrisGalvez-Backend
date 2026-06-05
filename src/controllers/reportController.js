const { Parser } = require('json2csv');
const Cita = require('../models/cita.model');
const Pago = require('../models/pago.model');
const Profesional = require('../models/profesional.model');
const { Op, fn, col } = require('sequelize');

/**
 * Genera reportes indexados a nivel de BD y exporta los KPIs en CSV.
 * GET /api/reports/monthly?mes=06&anio=2026
 */
const generarReporteMensualCSV = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    if (!mes || !anio) {
      return res.status(400).json({ error: 'Debes proporcionar parámetros válidos para mes y anio.' });
    }

    // Rangos de fecha límites para la consulta
    const fechaInicio = new Date(`${anio}-${mes}-01T00:00:00.000Z`);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    // KPI 1: Total de Ingresos Financieros del mes (Monto acumulado de pagos completados)
    const ingresosTotales = await Pago.findOne({
      attributes: [[fn('SUM', col('monto')), 'total']],
      where: {
        estado: 'completado',
        fechaPago: { [Op.gte]: fechaInicio, [Op.lt]: fechaFin }
      }
    });
    const totalDinero = ingresosTotales.getDataValue('total') || 0;

    // KPI 2: Cantidad de citas según su estado operativo
    const conteoEstadisticas = await Cita.findAll({
      attributes: ['estado', [fn('COUNT', col('id')), 'total']],
      where: {
        fechaHora: { [Op.gte]: fechaInicio, [Op.lt]: fechaFin }
      },
      group: ['estado']
    });

    let completadas = 0;
    let canceladas = 0;
    conteoEstadisticas.forEach(c => {
      if (c.estado === 'completada') completadas = c.getDataValue('total');
      if (c.cancelada === 'cancelada') canceladas = c.getDataValue('total');
    });

    // KPI 3: Atenciones desglosadas por profesional (Consulta indexada estructurada)
    const rendimientoProfesionales = await Cita.findAll({
      attributes: [[fn('COUNT', col('Cita.id')), 'total_citas']],
      where: {
        estado: 'completada',
        fechaHora: { [Op.gte]: fechaInicio, [Op.lt]: fechaFin }
      },
      include: [{
        model: Profesional,
        as: 'profesional',
        attributes: ['nombre', 'especialidad']
      }],
      group: ['profesional.id', 'profesional.nombre', 'profesional.especialidad'],
      order: [[fn('COUNT', col('Cita.id')), 'DESC']],
      raw: true
    });

    // Estructurar la matriz de datos para el archivo CSV descargable
    const filasCSV = [
      { Seccion: 'FINANZAS', Metrica: 'Total Ingresos Mensuales', Valor: `$${totalDinero.toLocaleString('es-CL')} CLP` },
      { Seccion: 'OPERACIONES', Metrica: 'Total Citas Completadas', Valor: completadas.toString() },
      { Seccion: 'OPERACIONES', Metrica: 'Total Citas Canceladas', Valor: canceladas.toString() },
      { Seccion: '---', Metrica: '---', Valor: '---' },
      { Seccion: 'RENDIMIENTO PROFESIONAL', Metrica: 'Especialista', Valor: 'Atenciones Exitosas' }
    ];

    rendimientoProfesionales.forEach(item => {
      filasCSV.push({
        Seccion: 'PROFESIONALES',
        Metrica: `${item['profesional.nombre']} (${item['profesional.especialidad']})`,
        Valor: item.total_citas.toString()
      });
    });

    // Compilar el archivo mediante json2csv
    const json2csvParser = new Parser({ fields: ['Seccion', 'Metrica', 'Valor'] });
    const csvGenerado = json2csvParser.parse(filasCSV);

    // Streaming de descarga directa al cliente de frontend
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`Reporte_Gestion_${mes}_${anio}.csv`);
    return res.send(csvGenerado);

  } catch (error) {
    console.error('❌ Error en generarReporteMensualCSV:', error);
    return res.status(500).json({ error: 'Error del servidor al compilar las métricas de gestión.' });
  }
};

module.exports = {
  generarReporteMensualCSV
};