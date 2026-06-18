const mongoose = require("mongoose");

const internshipCenterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    hasOffice: {
      type: Boolean,
      default: true,
    },
    hasComputer: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InternshipCenter", internshipCenterSchema);
