const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));
app.use("/api/upload", require("./routes/upload.route"));

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "IMS Backend API Running",
  });
});

/*API*/
app.use("/api/users", require("./routes/user.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/application", require("./routes/application.route"));
app.use("/api/internship-topics", require("./routes/internshipTopic.route"));
app.use("/api/weekly-reports", require("./routes/weeklyReport.route"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

module.exports = app;
