const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const ensureDbConnected = require("./middlewares/db.middleware");

const app = express();

// Middleware
app.use(cors({ exposedHeaders: ["Content-Disposition"] }));
app.use(express.json());
app.use(morgan("dev"));

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));
app.use("/api/upload", require("./routes/upload.route"));
app.use("/api/internship-center", ensureDbConnected, require("./routes/internshipCenter.route"));

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "IMS Backend API Running",
  });
});

/*API*/
app.use("/api/users", ensureDbConnected, require("./routes/user.route"));
app.use("/api/auth", ensureDbConnected, require("./routes/auth.route"));
app.use("/api/application", ensureDbConnected, require("./routes/application.route"));
app.use("/api/internship-topics", ensureDbConnected, require("./routes/internshipTopic.route"));
app.use("/api/weekly-reports", ensureDbConnected, require("./routes/weeklyReport.route"));
app.use("/api/weekly-assignments", ensureDbConnected, require("./routes/weeklyAssignment.route"));
app.use("/api/word-export", ensureDbConnected, require("./routes/wordExport.route"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

module.exports = app;
