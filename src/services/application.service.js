const mongoose = require("mongoose");
const InternshipCenterService = require("./internshipCenter.service");
const Application = require("../models/application.model");
const InternshipTopic = require("../models/internshiptopic.model");

const APPROVED_STATUS = "đã duyệt";
const PENDING_STATUS = "chờ duyệt";

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
  static async getApprovedCountByTopic(topicId, excludeApplicationId = null) {
    const filter = { topic: topicId, status: APPROVED_STATUS };
    if (excludeApplicationId) filter._id = { $ne: excludeApplicationId };
    return Application.countDocuments(filter);
  }

  static async attachTopicStats(applications) {
    const items = Array.isArray(applications) ? applications : [applications];
    const plainItems = items
      .filter(Boolean)
      .map((app) => (typeof app.toObject === "function" ? app.toObject() : app));
    const topicIds = [
      ...new Set(
        plainItems
          .map((app) => app?.topic?._id || app?.topic)
          .filter(Boolean)
          .map(String),
      ),
    ];

    if (!topicIds.length) {
      return Array.isArray(applications) ? plainItems : plainItems[0];
    }

    const counts = await Application.aggregate([
      {
        $match: {
          topic: { $in: topicIds.map((id) => new mongoose.Types.ObjectId(id)) },
          status: APPROVED_STATUS,
        },
      },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    const mapped = plainItems.map((app) => {
      if (!app.topic) return app;
      const topicId = String(app.topic._id || app.topic);
      const acceptedCount = countMap.get(topicId) || 0;
      const quantity = app.topic.quantity || 1;
      app.topic = {
        ...app.topic,
        acceptedCount,
        remainingSlots: Math.max(quantity - acceptedCount, 0),
      };
      return app;
    });

    return Array.isArray(applications) ? mapped : mapped[0];
  }

  static async closeTopicIfFull(topicId) {
    if (!topicId) return;
    const topic = await InternshipTopic.findById(topicId);
    if (!topic) return;

    const approvedCount = await this.getApprovedCountByTopic(topicId);
    if (approvedCount >= (topic.quantity || 1) && topic.status !== "closed") {
      topic.status = "closed";
      await topic.save();
    }
  }

  static buildInternshipInfo(data, topic, center) {
    const lecturer = topic?.lecturer || {};
    const lecturerName = hasValue(lecturer.username) ? lecturer.username : "";
    const lecturerEmail = hasValue(lecturer.email) ? lecturer.email : "";

    return {
      ...data,
      companyName: center.name,
      companyAddress: center.address,
      companyPhone: center.phone,
      supervisorName:
        lecturerName || (hasValue(topic?.supervisorName) ? topic.supervisorName : ""),
      supervisorPhone: hasValue(topic?.supervisorPhone) ? topic.supervisorPhone : "",
      supervisorEmail:
        lecturerEmail ||
        (hasValue(topic?.supervisorEmail) ? topic.supervisorEmail : center.email),
      hasOffice: center.hasOffice,
      hasComputer: center.hasComputer,
    };
  }

  static async mergeTopicInfo(data, topic) {
    if (!topic) return data;

    const center = await InternshipCenterService.get();
    const next = this.buildInternshipInfo(data, topic, center);
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

  static async assertTopicCanReceiveStudent(topic, excludeApplicationId = null) {
    if (topic.status !== "open") {
      throw new Error("This topic is not open for applications");
    }

    const approvedCount = await this.getApprovedCountByTopic(
      topic._id,
      excludeApplicationId,
    );
    if (approvedCount >= (topic.quantity || 1)) {
      topic.status = "closed";
      await topic.save();
      throw new Error("Đề tài đã đủ số lượng sinh viên");
    }
  }

  static async prepareTopicApplication(data, currentApplicationId = null) {
    if (!data.topic) return data;

    const topic = await InternshipTopic.findById(data.topic).populate(
      "lecturer",
      "username email",
    );
    if (!topic) {
      throw new Error("Internship topic not found");
    }

    await this.assertTopicCanReceiveStudent(topic, currentApplicationId);
    return this.mergeTopicInfo(data, topic);
  }

  // Tạo hồ sơ ứng tuyển. Có thể nộp theo đề tài hoặc hồ sơ tự do chưa gắn đề tài.
  static async createApplication(data) {
    if (data.topic === "") {
      data.topic = undefined;
    }

    if (data.topic) {
      const existed = await Application.findOne({
        student: data.student,
        topic: data.topic,
      });
      if (existed) {
        throw new Error("You have already applied to this topic");
      }
      data = await this.prepareTopicApplication(data);
    }

    return Application.create(data);
  }

  // Lấy tất cả hồ sơ
  static async getAllApplications() {
    const applications = await Application.find()
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate())
      .sort({ createdAt: -1 });

    return this.attachTopicStats(applications);
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

    return this.attachTopicStats(application);
  }

  static async getApplicationByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    const applications = await Application.find({ student: userId })
      .populate("student")
      .populate("approvedBy", "username email")
      .populate(topicPopulate());

    return this.attachTopicStats(applications);
  }

  // Cập nhật hồ sơ
  static async updateApplication(id, data) {
    const current = await Application.findById(id);
    if (!current) {
      throw new Error("Application not found");
    }

    if (data.topic === "") {
      data.topic = undefined;
    }

    if (data.topic) {
      const changingTopic = String(current.topic || "") !== String(data.topic);
      data = await this.prepareTopicApplication(data, changingTopic ? id : null);
    }

    const updated = await Application.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate());

    return this.attachTopicStats(updated);
  }

  // Cập nhật trạng thái
  static async updateStatus(id, status, approvedBy = null) {
    const current = await Application.findById(id);
    if (!current) {
      throw new Error("Application not found");
    }

    if (status === APPROVED_STATUS && current.topic) {
      const topic = await InternshipTopic.findById(current.topic);
      if (!topic) {
        throw new Error("Internship topic not found");
      }
      const approvedCount = await this.getApprovedCountByTopic(topic._id, id);
      if (approvedCount >= (topic.quantity || 1)) {
        topic.status = "closed";
        await topic.save();
        throw new Error("Đề tài đã đủ số lượng sinh viên");
      }
    }

    const updateData = { status };
    if (status === PENDING_STATUS) {
      updateData.approvedBy = null;
    } else if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }

    const updated = await Application.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new Error("Application not found");
    }

    if (status === APPROVED_STATUS && updated.topic) {
      await this.closeTopicIfFull(updated.topic);
    }

    const populated = await Application.findById(updated._id)
      .populate("student", "username email role")
      .populate("approvedBy", "username email")
      .populate(topicPopulate());

    return this.attachTopicStats(populated);
  }

  // Cập nhật đánh giá của giảng viên hướng dẫn
  static async updateEvaluation(id, evaluationData) {
    const { internshipStatus, score, feedback } = evaluationData;
    const updated = await Application.findByIdAndUpdate(
      id,
      { internshipStatus, score, feedback },
      { new: true },
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
