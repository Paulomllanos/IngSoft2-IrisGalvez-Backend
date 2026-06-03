const router = require("express").Router();

const dbStatus = require("../config/database-status");

router.get("/status", (req, res) => {

    return res.status(200).json({
        success: true,
        databases: {
            mongo: dbStatus.mongo,
            postgres: dbStatus.postgres
        }
    });

});

module.exports = router;