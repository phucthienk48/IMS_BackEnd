const fs = require("fs");
const ApplicationService = require("../services/application.service");
const WeeklyAssignmentService = require("../services/weeklyAssignment.service");
const WeeklyReportService = require("../services/weeklyReport.service");
const WordExportService = require("../services/wordExport.service");

class WordExportController {
  static async export(req, res) {
    try {
      const { type, applicationId } = req.params;
      const application = await ApplicationService.getApplicationById(applicationId);
      const reports =
        type === "theo-doi"
          ? await WeeklyReportService.getByApplication(applicationId)
          : [];
      const assignments =
        type === "giao-viec"
          ? await WeeklyAssignmentService.getByApplication(applicationId)
          : [];

      const file = await WordExportService.generate(
        type,
        application,
        reports,
        assignments,
      );

      return res.download(file.path, file.name, (error) => {
        fs.rm(file.dir, { recursive: true, force: true }, () => {});

        if (error && !res.headersSent) {
          res.status(500).json({
            success: false,
            message: error.message,
          });
        }
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = WordExportController;
