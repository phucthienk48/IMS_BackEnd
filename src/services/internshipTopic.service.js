const InternshipTopic = require("../models/internshiptopic.model");

const TOPIC_MANAGED_FIELDS = [
  "companyName",
  "companyAddress",
  "companyPhone",
  "supervisorName",
  "supervisorPhone",
  "supervisorEmail",
  "hasOffice",
  "hasComputer",
];

const sanitizeTopicPayload = (data = {}) => {
  const payload = { ...data };
  TOPIC_MANAGED_FIELDS.forEach((field) => {
    delete payload[field];
  });
  return payload;
};

const InternshipTopicService = {
  // Lấy tất cả
  getAll: async () => {
    return await InternshipTopic.find()
      .populate("lecturer", "username email");
  },

  // Lấy theo ID
  getById: async (id) => {
    return await InternshipTopic.findById(id)
      .populate("lecturer", "username email");
  },

  // Tạo mới
  create: async (data) => {
    return await InternshipTopic.create(sanitizeTopicPayload(data));
  },

  // Cập nhật
  update: async (id, data) => {
    return await InternshipTopic.findByIdAndUpdate(
      id,
      sanitizeTopicPayload(data),
      { new: true }
    );
  },

  // Xóa
  remove: async (id) => {
    return await InternshipTopic.findByIdAndDelete(id);
  },

  // Lấy theo giảng viên
  getByLecturer: async (lecturerId) => {
    return await InternshipTopic.find({
      lecturer: lecturerId,
    }).populate("lecturer", "username email");
  },
};

module.exports = InternshipTopicService;
