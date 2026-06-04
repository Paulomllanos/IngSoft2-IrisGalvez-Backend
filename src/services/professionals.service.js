const professionalsRepository = require(
    "../repositories/postgres/professionals.repository"
);

const getBySpecialty = async (especialidad) => {

    return await professionalsRepository
        .findBySpecialty(especialidad);

};

module.exports = {
    getBySpecialty
};