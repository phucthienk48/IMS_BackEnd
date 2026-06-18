const mongoose = require("mongoose");

const weeklyAssignmentSchema = new mongoose.Schema(
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
      max: 12,
    },

    fromDate: {
      type: Date,
      default: null,
    },

    toDate: {
      type: Date,
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    hoursOrSessions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

weeklyAssignmentSchema.index({ application: 1, week: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyAssignment", weeklyAssignmentSchema);
