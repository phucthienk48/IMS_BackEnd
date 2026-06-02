const express = require("express");
const router = express.Router();
const WeeklyReportController = require("../controllers/weeklyReport.controller");

// Sinh viên tạo nhật ký tuần mới
router.post("/", WeeklyReportController.create);

// Lấy danh sách nhật ký theo hồ sơ thực tập
router.get("/application/:applicationId", WeeklyReportController.getByApplication);

// Giảng viên nhận xét & duyệt
router.patch("/:id/feedback", WeeklyReportController.updateFeedback);

// Sinh viên sửa nội dung nhật ký
router.patch("/:id/content", WeeklyReportController.updateContent);

// Xoá nhật ký
router.delete("/:id", WeeklyReportController.delete);

module.exports = router;
