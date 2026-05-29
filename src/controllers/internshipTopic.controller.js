const InternshipTopicService = require(
  "../services/internshipTopic.service"
);

const InternshipTopicController = {
  // Lấy tất cả
  getAll: async (req, res) => {
    try {
      const data = await InternshipTopicService.getAll();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy theo ID
  getById: async (req, res) => {
    try {
      const data = await InternshipTopicService.getById(
        req.params.id
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Internship topic not found",
        });
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy theo giảng viên
  getByLecturer: async (req, res) => {
    try {
      const data =
        await InternshipTopicService.getByLecturer(
          req.params.lecturerId
        );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Tạo mới
  create: async (req, res) => {
    try {
      const newTopic =
        await InternshipTopicService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Create internship topic successfully",
        data: newTopic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Cập nhật
  update: async (req, res) => {
    try {
      const updated =
        await InternshipTopicService.update(
          req.params.id,
          req.body
        );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Internship topic not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Update successfully",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Xóa
  remove: async (req, res) => {
    try {
      const deleted =
        await InternshipTopicService.remove(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Internship topic not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Delete successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = InternshipTopicController;