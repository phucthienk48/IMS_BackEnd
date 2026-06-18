const Application = require("../models/application.model");
const InternshipTopic = require("../models/internshiptopic.model");

const APPROVED_STATUS = "đã duyệt";

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
  if (payload.quantity !== undefined) {
    payload.quantity = Number(payload.quantity) || 1;
  }
  return payload;
};

const attachCounts = async (topics) => {
  const isArray = Array.isArray(topics);
  const items = (isArray ? topics : [topics]).filter(Boolean);
  const plainItems = items.map((topic) =>
    typeof topic.toObject === "function" ? topic.toObject() : topic,
  );
  const ids = plainItems.map((topic) => topic._id);
  if (!ids.length) return isArray ? plainItems : plainItems[0] || null;

  const counts = await Application.aggregate([
    { $match: { topic: { $in: ids }, status: APPROVED_STATUS } },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

  const mapped = plainItems.map((topic) => {
    const acceptedCount = countMap.get(String(topic._id)) || 0;
    const quantity = topic.quantity || 1;
    return {
      ...topic,
      acceptedCount,
      remainingSlots: Math.max(quantity - acceptedCount, 0),
      status: acceptedCount >= quantity ? "closed" : topic.status,
    };
  });

  return isArray ? mapped : mapped[0] || null;
};

const syncClosedStatus = async (topic) => {
  if (!topic) return topic;
  const acceptedCount = await Application.countDocuments({
    topic: topic._id,
    status: APPROVED_STATUS,
  });
  if (acceptedCount >= (topic.quantity || 1) && topic.status !== "closed") {
    topic.status = "closed";
    await topic.save();
  }
  return topic;
};

const InternshipTopicService = {
  // Lấy tất cả
  getAll: async () => {
    const topics = await InternshipTopic.find().populate("lecturer", "username email");
    return attachCounts(topics);
  },

  // Lấy theo ID
  getById: async (id) => {
    const topic = await InternshipTopic.findById(id).populate(
      "lecturer",
      "username email",
    );
    return attachCounts(topic);
  },

  // Tạo mới
  create: async (data) => {
    const created = await InternshipTopic.create(sanitizeTopicPayload(data));
    return attachCounts(
      await InternshipTopic.findById(created._id).populate("lecturer", "username email"),
    );
  },

  // Cập nhật
  update: async (id, data) => {
    const payload = sanitizeTopicPayload(data);
    const approvedCount = await Application.countDocuments({
      topic: id,
      status: APPROVED_STATUS,
    });
    if (payload.quantity !== undefined && payload.quantity < approvedCount) {
      throw new Error("Số lượng sinh viên không được nhỏ hơn số hồ sơ đã duyệt");
    }

    const updated = await InternshipTopic.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate("lecturer", "username email");

    await syncClosedStatus(updated);
    return attachCounts(updated);
  },

  // Xóa
  remove: async (id) => {
    return await InternshipTopic.findByIdAndDelete(id);
  },

  // Lấy theo giảng viên
  getByLecturer: async (lecturerId) => {
    const topics = await InternshipTopic.find({ lecturer: lecturerId }).populate(
      "lecturer",
      "username email",
    );
    return attachCounts(topics);
  },
};

module.exports = InternshipTopicService;
