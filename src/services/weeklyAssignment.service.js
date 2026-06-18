const Application = require("../models/application.model");
const WeeklyAssignment = require("../models/weeklyAssignment.model");

const MAX_WEEKS = 12;

const hasText = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const normalizeDate = (value) => (hasText(value) ? value : null);

const normalizeItem = (item) => ({
  week: Number(item.week),
  fromDate: normalizeDate(item.fromDate),
  toDate: normalizeDate(item.toDate),
  content: String(item.content || "").trim(),
  hoursOrSessions: String(item.hoursOrSessions || "").trim(),
});

class WeeklyAssignmentService {
  static async getByApplication(applicationId) {
    return WeeklyAssignment.find({ application: applicationId })
      .populate("student", "username email")
      .sort({ week: 1 });
  }

  static async replaceByApplication(applicationId, items = []) {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new Error("Không tìm thấy hồ sơ thực tập");
    }

    const normalized = items
      .map(normalizeItem)
      .filter((item) => item.content.length > 0);

    const seenWeeks = new Set();
    for (const item of normalized) {
      if (!Number.isInteger(item.week) || item.week < 1 || item.week > MAX_WEEKS) {
        throw new Error("Tuần giao việc phải nằm trong khoảng từ 1 đến 12");
      }
      if (seenWeeks.has(item.week)) {
        throw new Error(`Tuần ${item.week} bị nhập trùng trong kế hoạch giao việc`);
      }
      if (item.fromDate && item.toDate && new Date(item.fromDate) > new Date(item.toDate)) {
        throw new Error(`Ngày bắt đầu của tuần ${item.week} không được lớn hơn ngày kết thúc`);
      }
      seenWeeks.add(item.week);
    }

    const keptWeeks = normalized.map((item) => item.week);
    const deleteFilter = { application: applicationId };
    if (keptWeeks.length > 0) {
      deleteFilter.week = { $nin: keptWeeks };
    }
    await WeeklyAssignment.deleteMany(deleteFilter);

    if (normalized.length > 0) {
      await WeeklyAssignment.bulkWrite(
        normalized.map((item) => ({
          updateOne: {
            filter: { application: applicationId, week: item.week },
            update: {
              $set: {
                student: application.student,
                application: applicationId,
                week: item.week,
                fromDate: item.fromDate,
                toDate: item.toDate,
                content: item.content,
                hoursOrSessions: item.hoursOrSessions,
              },
            },
            upsert: true,
          },
        })),
      );
    }

    return this.getByApplication(applicationId);
  }
}

module.exports = WeeklyAssignmentService;
