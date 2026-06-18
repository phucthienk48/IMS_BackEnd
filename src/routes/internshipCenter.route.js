const express = require("express");
const internshipCenter = require("../config/internshipCenter");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: internshipCenter,
  });
});

module.exports = router;
