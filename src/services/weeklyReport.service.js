const WeeklyReport = require("../models/weeklyReport.model");

class WeeklyReportService {
  // Sinh viên tạo nhật ký tuần mới
  static async create(data) {
    const existed = await WeeklyReport.findOne({
      application: data.application,
      week: data.week,
    });

    if (existed) {
      throw new Error(`Bạn đã nộp báo cáo cho Tuần ${data.week} rồi. Không thể tạo lại.`);
    }

    const report = await WeeklyReport.create(data);
    return report;
  }

  // Lấy toàn bộ nhật ký theo hồ sơ thực tập
  static async getByApplication(applicationId) {
    return await WeeklyReport.find({ application: applicationId })
      .populate("student", "username email")
      .sort({ week: 1 });
  }

  // Giảng viên nhận xét và cập nhật trạng thái
  static async updateFeedback(id, feedback, status) {
    const updated = await WeeklyReport.findByIdAndUpdate(
      id,
      { feedback, status },
      { new: true }
    );

    if (!updated) {
      throw new Error("Không tìm thấy nhật ký tuần");
    }

    return updated;
  }

  // Sinh viên sửa nội dung báo cáo tiến độ (nhật ký)
  static async updateContent(id, data) {
    const report = await WeeklyReport.findById(id);
    if (!report) {
      throw new Error("Không tìm thấy báo cáo tiến độ");
    }

    if (data.content !== undefined) report.content = data.content;
    if (data.fromDate !== undefined) report.fromDate = data.fromDate;
    if (data.toDate !== undefined) report.toDate = data.toDate;
    if (data.hoursOrSessions !== undefined) report.hoursOrSessions = data.hoursOrSessions;

    report.status = "đã gửi"; // Đặt trạng thái đã gửi khi cập nhật
    return await report.save();
  }

  // Xoá báo cáo tiến độ
  static async delete(id) {
    const report = await WeeklyReport.findById(id);
    if (!report) {
      throw new Error("Không tìm thấy báo cáo tiến độ");
    }

    return await WeeklyReport.findByIdAndDelete(id);
  }
}

module.exports = WeeklyReportService;
