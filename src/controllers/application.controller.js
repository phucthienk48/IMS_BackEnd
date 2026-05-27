const ApplicationService = require("../services/application.service");

class ApplicationController {
  // Tạo hồ sơ
  static async create(req, res) {
    try {
      const application = await ApplicationService.createApplication({
        ...req.body,
        student: req.body.student,
      });

      return res.status(201).json({
        success: true,
        message: "Create application successfully",
        data: application,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy tất cả hồ sơ
  static async getAll(req, res) {
    try {
      const applications =
        await ApplicationService.getAllApplications();

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy theo ID
  static async getById(req, res) {
    try {
      const application =
        await ApplicationService.getApplicationById(req.params.id);

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
// Lấy hồ sơ theo user
static async getByUser(req, res) {
  try {
    const applications =
      await ApplicationService.getApplicationByUser(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
  // Cập nhật hồ sơ
  static async update(req, res) {
    try {
      const updated = await ApplicationService.updateApplication(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Update successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật trạng thái
  static async updateStatus(req, res) {
    try {
      const updated = await ApplicationService.updateStatus(
        req.params.id,
        req.body.status
      );

      return res.status(200).json({
        success: true,
        message: "Update status successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa hồ sơ
  static async delete(req, res) {
    try {
      await ApplicationService.deleteApplication(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Delete successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ApplicationController;