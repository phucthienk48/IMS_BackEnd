const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    week: {
      type: Number,
      required: true,
      min: 1,
    },

    fromDate: {
      type: Date,
      required: false,
    },

    toDate: {
      type: Date,
      required: false,
    },

    hoursOrSessions: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["chờ duyệt", "đã duyệt", "cần chỉnh sửa", "đã gửi"],
      default: "đã gửi",
    },
  },
  {
    timestamps: true,
  }
);

// Không cho phép sinh viên tạo 2 báo cáo cho cùng 1 tuần của cùng 1 hồ sơ
weeklyReportSchema.index({ application: 1, week: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
