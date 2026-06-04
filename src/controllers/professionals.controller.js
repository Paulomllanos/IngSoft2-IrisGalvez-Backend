const professionalsService = require(
    "../services/professionals.service"
);

const getProfessionalsBySpecialty = async (req, res) => {

    try {

        const { especialidad } = req.query;

        if (!especialidad) {
            return res.status(400).json({
                success: false,
                message: "Debe indicar una especialidad"
            });
        }

        const professionals =
            await professionalsService.getBySpecialty(
                especialidad
            );

        return res.status(200).json({
            success: true,
            total: professionals.length,
            data: professionals
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error obteniendo profesionales"
        });

    }

};

module.exports = {
    getProfessionalsBySpecialty
};