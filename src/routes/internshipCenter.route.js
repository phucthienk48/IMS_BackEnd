const express = require("express");
const InternshipCenterService = require("../services/internshipCenter.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const center = await InternshipCenterService.get();
    res.status(200).json({
      success: true,
      data: center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const center = await InternshipCenterService.update(req.body);
    res.status(200).json({
      success: true,
      message: "Update internship center successfully",
      data: center,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
