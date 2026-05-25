const Application = require("../models/application.model");

class ApplicationService {
  // Tạo hồ sơ ứng tuyển
  static async createApplication(data) {
    const existed = await Application.findOne({
      studentCode: data.studentCode,
    });

    if (existed) {
      throw new Error("Student code already exists");
    }

    const application = await Application.create(data);

    return application;
  }

  // Lấy tất cả hồ sơ
  static async getAllApplications() {
    return await Application.find()
      .populate("student", "username email role")
      .sort({ createdAt: -1 });
  }

  // Lấy hồ sơ theo id
  static async getApplicationById(id) {
    const application = await Application.findById(id).populate(
      "student",
      "username email role"
    );

    if (!application) {
      throw new Error("Application not found");
    }

    return application;
  }

  // Cập nhật hồ sơ
  static async updateApplication(id, data) {
    const updated = await Application.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updated) {
      throw new Error("Application not found");
    }

    return updated;
  }

  // Cập nhật trạng thái
  static async updateStatus(id, status) {
    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      throw new Error("Application not found");
    }

    return updated;
  }

  // Xóa hồ sơ
  static async deleteApplication(id) {
    const deleted = await Application.findByIdAndDelete(id);

    if (!deleted) {
      throw new Error("Application not found");
    }

    return deleted;
  }
}

module.exports = ApplicationService;