const { QueryTypes } = require("sequelize");

const {
    sequelize
} = require("../../config/postgres");

const findBySpecialty = async (especialidad) => {

    const query = `
        SELECT
            p.id_profesional,
            p.especialidad,
            p.registro_minsal,
            p.descripcion,
            p.foto_perfil,

            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.estado

        FROM profesionales p
        INNER JOIN usuarios u
            ON u.id_usuario = p.usuarios_id_usuario

        WHERE LOWER(p.especialidad) = LOWER(:especialidad)
    `;

    return await sequelize.query(query, {
        replacements: {
            especialidad
        },
        type: QueryTypes.SELECT
    });

};

module.exports = {
    findBySpecialty
};