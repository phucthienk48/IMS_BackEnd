const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },

    sdt: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    studentCode: {
      type: String,
      required: true,
      trim: true,
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternshipTopic",
      required: false,
    },

    classCode: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    companyName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    companyAddress: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    companyPhone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    supervisorName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    supervisorPhone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    supervisorEmail: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    hasOffice: {
      type: Boolean,
      default: false,
    },

    hasComputer: {
      type: Boolean,
      default: false,
    },

    projectedTasks: {
      type: String,
      default: "",
      trim: true,
    },

    workDaysPerWeek: {
      type: Number,
      default: null,
    },

    workHoursPerDay: {
      type: Number,
      default: null,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    major: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    cvFile: {
      type: String,
      required: true,
    },

    transcriptFile: {
      type: String,
      required: true,
    },

    citizenIdFrontFile: {
      type: String,
      required: false,
      default: "",
    },

    citizenIdBackFile: {
      type: String,
      required: false,
      default: "",
    },

    status: {
      type: String,
      enum: ["chờ duyệt", "đã duyệt", "từ chối"],
      default: "chờ duyệt",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    internshipStatus: {
      type: String,
      enum: ["đang thực tập", "đã hoàn thành", "tạm dừng"],
      default: "đang thực tập",
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index(
  { student: 1, topic: 1 },
  { unique: true, partialFilterExpression: { topic: { $exists: true, $ne: null } } }
);

module.exports = mongoose.model("Application", applicationSchema);
