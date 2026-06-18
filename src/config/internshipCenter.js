const internshipCenter = {
  name:
    process.env.INTERNSHIP_CENTER_NAME ||
    "Trung tâm Công nghệ Phần mềm Đại học Cần Thơ (CUSC)",
  address:
    process.env.INTERNSHIP_CENTER_ADDRESS ||
    "Khu III, Trường Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ",
  phone: process.env.INTERNSHIP_CENTER_PHONE || "",
  email: process.env.INTERNSHIP_CENTER_EMAIL || "",
  hasOffice: process.env.INTERNSHIP_CENTER_HAS_OFFICE
    ? process.env.INTERNSHIP_CENTER_HAS_OFFICE === "true"
    : true,
  hasComputer: process.env.INTERNSHIP_CENTER_HAS_COMPUTER
    ? process.env.INTERNSHIP_CENTER_HAS_COMPUTER === "true"
    : true,
};

module.exports = internshipCenter;
