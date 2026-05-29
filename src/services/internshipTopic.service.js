const InternshipTopic = require("../models/internshiptopic.model");

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
    return await InternshipTopic.create(data);
  },

  // Cập nhật
  update: async (id, data) => {
    return await InternshipTopic.findByIdAndUpdate(
      id,
      data,
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