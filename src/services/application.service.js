const mongoose = require("mongoose");
const internshipCenter = require("../config/internshipCenter");
const Application = require("../models/application.model");
const InternshipTopic = require("../models/internshiptopic.model");

const TOPIC_SELECT = [
  "topicname",
  "department",
  "position",
  "status",
  "lecturer",
  "supervisorName",
  "supervisorPhone",
  "supervisorEmail",
  "description",
  "requirement",
  "quantity",
  "hasOffice",
  "hasComputer",
  "workDaysPerWeek",
  "workHoursPerDay",
  "startday",
  "endday",
].join(" ");

const topicPopulate = () => ({
  path: "topic",
  select: TOPIC_SELECT,
  populate: {
    path: "lecturer",
    select: "username email",
  },
});

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

class ApplicationService {
  static buildInternshipInfo(data, topic) {
    const lecturer = topic?.lecturer || {};
    const lecturerName = hasValue(lecturer.username) ? lecturer.username : "";
    const lecturerEmail = hasValue(lecturer.email) ? lecturer.email : "";

    return {
      ...data,
      companyName: internshipCenter.name,
      companyAddress: internshipCenter.address,
      companyPhone: internshipCenter.phone,
      supervisorName: lecturerName || (hasValue(topic?.supervisorName) ? topic.supervisorName : ""),
      supervisorPhone: hasValue(topic?.supervisorPhone)
        ? topic.supervisorPhone
        : "",
      supervisorEmail:
        lecturerEmail ||
        (hasValue(topic?.supervisorEmail) ? topic.supervisorEmail : internshipCenter.email),
      hasOffice: internshipCenter.hasOffice,
      hasComputer: internshipCenter.hasComputer,
    };
  }

  static mergeTopicInfo(data, topic) {
    if (!topic) return data;

    const next = this.buildInternshipInfo(data, topic);
    const fill = (field, value) => {
      if (!hasValue(next[field]) && hasValue(value)) {
        next[field] = value;
      }
    };

    fill("startDate", topic.startday);
    fill("endDate", topic.endday);
    fill("workDaysPerWeek", topic.workDaysPerWeek);
    fill("workHoursPerDay", topic.workHoursPerDay);

    if (!hasValue(next.projectedTasks)) {
      next.projectedTasks = [topic.description, topic.requirement]
        .filter(hasValue)
        .join("\n");
    }

    return next;
  }

  // Tạo hồ sơ ứng tuyển
  static async createApplication(data) {
    if (data.topic === "" || data.topic === null || data.topic === undefined) {
      throw new Error("Vui lòng chọn đề tài thực tập trước khi nộp hồ sơ");
    }

    if (data.topic) {
      const topic = await InternshipTopic.findById(data.topic).populate(
        "lecturer",
        "username email",
      );
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

      data = this.mergeTopicInfo(data, topic);
    }

    const application = await Application.create(data);

    return application;
  }

  // Lấy tất cả hồ sơ
  static async getAllApplications() {
    return await Application.find()
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate())
      .sort({ createdAt: -1 });
  }

  // Lấy hồ sơ theo id
  static async getApplicationById(id) {
    const application = await Application.findById(id)
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate());

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
      .populate("approvedBy", "username email")
      .populate(topicPopulate());
  }

  // Cập nhật hồ sơ
  static async updateApplication(id, data) {
    if (data.topic) {
      const topic = await InternshipTopic.findById(data.topic).populate(
        "lecturer",
        "username email",
      );
      if (!topic) {
        throw new Error("Internship topic not found");
      }
      data = this.mergeTopicInfo(data, topic);
    }

    const updated = await Application.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate());

    if (!updated) {
      throw new Error("Application not found");
    }

    return updated;
  }

  // Cập nhật trạng thái
  static async updateStatus(id, status, approvedBy = null) {
    const updateData = { status };
    if (status === "chờ duyệt") {
      updateData.approvedBy = null;
    } else if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      updateData,
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
