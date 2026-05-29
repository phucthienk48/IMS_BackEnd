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
      required: true,
      trim: true,
      lowercase: true,
    },

    sdt: {
      type: String,
      required: true,
      trim: true,
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

    major: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
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

    status: {
      type: String,
      enum: ["chờ duyệt", "đã duyệt", "từ chối"],
      default: "chờ duyệt",
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
