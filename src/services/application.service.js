const mongoose = require("mongoose");
const Application = require("../models/application.model");
const InternshipTopic = require("../models/internshiptopic.model");

class ApplicationService {
  // Tạo hồ sơ ứng tuyển
  static async createApplication(data) {
    if (data.topic === "" || data.topic === null || data.topic === undefined) {
      delete data.topic;
    }

    if (data.topic) {
      const topic = await InternshipTopic.findById(data.topic);
      if (!topic) {
        throw new Error("Internship topic not found");
      }

      if (topic.status !== "open") {
        throw new Error("This topic is not open for applications");
      }

      const existed = await Application.findOne({
        student: data.student,
        topic: data.topic,
      });

      if (existed) {
        throw new Error("You have already applied to this topic");
      }
    }

    const application = await Application.create(data);

    return application;
  }

  // Lấy tất cả hồ sơ
  static async getAllApplications() {
    return await Application.find()
      .populate("student", "username email role")
      .populate({
        path: "topic",
        select: "topicname department position status lecturer",
        populate: {
          path: "lecturer",
          select: "username email",
        },
      })
      .sort({ createdAt: -1 });
  }

  // Lấy hồ sơ theo id
  static async getApplicationById(id) {
    const application = await Application.findById(id)
      .populate("student", "username email role")
      .populate({
        path: "topic",
        select: "topicname department position status lecturer",
        populate: {
          path: "lecturer",
          select: "username email",
        },
      });

    if (!application) {
      throw new Error("Application not found");
    }

    return application;
  }

  static async getApplicationByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    return await Application.find({
      student: userId,
    })
      .populate("student")
      .populate({
        path: "topic",
        select: "topicname department position status lecturer",
        populate: {
          path: "lecturer",
          select: "username email",
        },
      });
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
      { new: true },
    );

    if (!updated) {
      throw new Error("Application not found");
    }

    return updated;
  }

  // Cập nhật đánh giá của giảng viên hướng dẫn
  static async updateEvaluation(id, evaluationData) {
    const { internshipStatus, score, feedback } = evaluationData;
    const updated = await Application.findByIdAndUpdate(
      id,
      { internshipStatus, score, feedback },
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
