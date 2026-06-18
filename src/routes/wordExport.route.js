const express = require("express");
const WordExportController = require("../controllers/wordExport.controller");

const router = express.Router();

router.get("/:type/:applicationId", WordExportController.export);

module.exports = router;
