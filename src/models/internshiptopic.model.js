const mongoose = require("mongoose");

const internshipTopicSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    position: {
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

    topicname: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requirement: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: false,
      min: 1,
      default: 1,
    },

    hasOffice: {
      type: Boolean,
      default: false,
    },

    hasComputer: {
      type: Boolean,
      default: false,
    },

    workDaysPerWeek: {
      type: Number,
      default: null,
    },

    workHoursPerDay: {
      type: Number,
      default: null,
    },

    startday: {
      type: Date,
      required: true,
    },

    endday: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InternshipTopic",
  internshipTopicSchema
);
