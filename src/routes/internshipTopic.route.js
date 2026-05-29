const express = require("express");

const router = express.Router();

const InternshipTopicController = require("../controllers/internshipTopic.controller");

// Lấy tất cả
router.get("/", InternshipTopicController.getAll);

// Lấy theo lecturer (phải ở trước /:id)
router.get("/lecturer/:lecturerId", InternshipTopicController.getByLecturer);

// Lấy theo ID
router.get("/:id", InternshipTopicController.getById);

// Tạo mới
router.post("/", InternshipTopicController.create);

// Cập nhật
router.put("/:id", InternshipTopicController.update);

// Xóa
router.delete("/:id", InternshipTopicController.remove);

module.exports = router;
