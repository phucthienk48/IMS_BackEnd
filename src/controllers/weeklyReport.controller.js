const WeeklyReportService = require("../services/weeklyReport.service");

class WeeklyReportController {
  // Sinh viên tạo nhật ký tuần mới
  static async create(req, res) {
    try {
      const report = await WeeklyReportService.create(req.body);
      return res.status(201).json({
        success: true,
        message: "Tạo nhật ký tuần thành công!",
        data: report,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy danh sách nhật ký theo hồ sơ
  static async getByApplication(req, res) {
    try {
      const reports = await WeeklyReportService.getByApplication(
        req.params.applicationId
      );
      return res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Giảng viên nhận xét và duyệt báo cáo
  static async updateFeedback(req, res) {
    try {
      const { feedback, status } = req.body;
      const updated = await WeeklyReportService.updateFeedback(
        req.params.id,
        feedback,
        status
      );
      return res.status(200).json({
        success: true,
        message: "Đã cập nhật nhận xét thành công!",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Sinh viên sửa nội dung nhật ký
  static async updateContent(req, res) {
    try {
      const updated = await WeeklyReportService.updateContent(
        req.params.id,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Cập nhật báo cáo tiến độ thành công!",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xoá nhật ký
  static async delete(req, res) {
    try {
      await WeeklyReportService.delete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Đã xóa nhật ký tuần!",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = WeeklyReportController;
