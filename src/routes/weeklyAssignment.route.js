const express = require("express");
const WeeklyAssignmentController = require("../controllers/weeklyAssignment.controller");

const router = express.Router();

router.get("/application/:applicationId", WeeklyAssignmentController.getByApplication);
router.put("/application/:applicationId", WeeklyAssignmentController.replaceByApplication);

module.exports = router;
