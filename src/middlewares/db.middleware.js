const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message:
      "Database chưa kết nối. Vui lòng khởi động MongoDB hoặc kiểm tra MONGO_URI.",
  });
};
