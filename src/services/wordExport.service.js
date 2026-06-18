const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const internshipCenter = require("../config/internshipCenter");

const ROOT_DIR = path.resolve(__dirname, "../../..");
const SCRIPT_PATH = path.resolve(__dirname, "../scripts/fill-word-template.ps1");

const TEMPLATES = {
  "phieu-nhan": {
    file: "04-Phiếu nhận SV_12tuan.doc",
    prefix: "Phieu-nhan-SV",
    label: "Phiếu tiếp nhận sinh viên thực tập",
  },
  "giao-viec": {
    file: "M-TT-01-1-Phieugiaoviec_TTDN_12tuan.doc",
    prefix: "M-TT-01-Phieu-giao-viec",
    label: "Phiếu giao việc cho sinh viên thực tập",
  },
  "theo-doi": {
    file: "M-TT-02-1-Phieutheodoi_TTDN_12Tuan.doc",
    prefix: "M-TT-02-Phieu-theo-doi",
    label: "Phiếu theo dõi sinh viên thực tập",
  },
};

const sanitizeName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toPlain = (value) => {
  if (!value) return value;
  if (typeof value.toObject === "function") {
    return value.toObject({ virtuals: false, depopulate: false });
  }
  return JSON.parse(JSON.stringify(value));
};

const hasText = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const makeClientError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeList = (items) =>
  Array.isArray(items) ? items.map(toPlain).filter(Boolean) : [];

const validateExportData = (type, reports, assignments) => {
  if (type === "giao-viec") {
    const hasAssignments = assignments.some((item) => hasText(item.content));
    if (!hasAssignments) {
      throw makeClientError(
        "Vui lòng lập kế hoạch giao việc theo tuần trước khi xuất phiếu giao việc.",
      );
    }
  }

  if (type === "theo-doi") {
    const hasReports = reports.some((item) => hasText(item.content));
    if (!hasReports) {
      throw makeClientError(
        "Vui lòng có ít nhất một nhật ký tuần trước khi xuất phiếu theo dõi.",
      );
    }
  }
};

const runPowerShell = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", SCRIPT_PATH, ...args],
      { windowsHide: true },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(
        new Error(
          stderr ||
            stdout ||
            `Không thể tạo file Word. PowerShell exited with code ${code}`,
        ),
      );
    });
  });

class WordExportService {
  static async generate(type, application, reports = [], assignments = []) {
    const template = TEMPLATES[type];
    if (!template) {
      throw makeClientError("Loại biểu mẫu Word không hợp lệ");
    }

    const app = toPlain(application);
    const plainReports = normalizeList(reports);
    const plainAssignments = normalizeList(assignments);
    validateExportData(type, plainReports, plainAssignments);

    const safeStudent = sanitizeName(app.fullName || app.studentCode || "sinh-vien");
    const timestamp = Date.now();
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "ims-word-"));
    const templatePath = path.join(ROOT_DIR, template.file);
    const outputName = `${template.prefix}-${safeStudent}-${timestamp}.doc`;
    const outputPath = path.join(outputDir, outputName);
    const dataPath = path.join(outputDir, `${template.prefix}-${timestamp}.json`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Không tìm thấy file mẫu: ${template.file}`);
    }

    const payload = {
      application: app,
      center: internshipCenter,
      reports: plainReports,
      assignments: plainAssignments,
    };

    fs.writeFileSync(dataPath, JSON.stringify(payload), "utf8");

    try {
      await runPowerShell([
        "-Type",
        type,
        "-TemplatePath",
        templatePath,
        "-OutputPath",
        outputPath,
        "-DataPath",
        dataPath,
      ]);
    } finally {
      fs.rmSync(dataPath, { force: true });
    }

    return {
      path: outputPath,
      name: outputName,
      dir: outputDir,
    };
  }
}

module.exports = WordExportService;
