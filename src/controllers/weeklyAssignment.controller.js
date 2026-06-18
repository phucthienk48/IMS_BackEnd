const WeeklyAssignmentService = require("../services/weeklyAssignment.service");

class WeeklyAssignmentController {
  static async getByApplication(req, res) {
    try {
      const assignments = await WeeklyAssignmentService.getByApplication(
        req.params.applicationId,
      );

      return res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async replaceByApplication(req, res) {
    try {
      const assignments = await WeeklyAssignmentService.replaceByApplication(
        req.params.applicationId,
        req.body.items || [],
      );

      return res.status(200).json({
        success: true,
        message: "Đã lưu kế hoạch giao việc theo tuần",
        data: assignments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = WeeklyAssignmentController;
