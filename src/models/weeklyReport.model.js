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
      enum: ["chờ duyệt", "đã duyệt", "cần chỉnh sửa"],
      default: "chờ duyệt",
    },
  },
  {
    timestamps: true,
  }
);

// Không cho phép sinh viên tạo 2 báo cáo cho cùng 1 tuần của cùng 1 hồ sơ
weeklyReportSchema.index({ application: 1, week: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
