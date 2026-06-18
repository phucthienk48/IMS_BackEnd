const defaults = require("../config/internshipCenter");
const InternshipCenter = require("../models/internshipCenter.model");

const sanitize = (data = {}) => ({
  name: data.name,
  address: data.address || "",
  phone: data.phone || "",
  email: data.email || "",
  hasOffice: Boolean(data.hasOffice),
  hasComputer: Boolean(data.hasComputer),
});

class InternshipCenterService {
  static async get() {
    const center = await InternshipCenter.findOne({ key: "default" }).lean();
    if (center) return center;
    return { key: "default", ...defaults };
  }

  static async update(data) {
    if (!data.name || !String(data.name).trim()) {
      throw new Error("Vui lòng nhập tên trung tâm thực tập");
    }

    return InternshipCenter.findOneAndUpdate(
      { key: "default" },
      { key: "default", ...sanitize(data) },
      { new: true, upsert: true, runValidators: true },
    ).lean();
  }
}

module.exports = InternshipCenterService;
