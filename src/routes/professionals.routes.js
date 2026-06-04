const express = require("express");
const router = express.Router();

const professionalsController = require(
    "../controllers/professionals.controller"
);

router.get(
    "/",
    professionalsController.getProfessionalsBySpecialty
);

module.exports = router;