const reportingService = require('./reporting.service');
const { success } = require('../../utils/response');

const getPlacementReport = async (req, res, next) => {
  try {
    const { month, year, format } = req.query;

    const reportData = await reportingService.generatePlacementReport({
      month,
      year,
      coordinatorId: req.user.UserID
    });

    if (format === 'csv') {
      const csvContent = reportingService.formatReportAsCsv(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="placement_report_${reportData.year}_${reportData.month}.csv"`);
      return res.status(200).send(csvContent);
    }

    return success(res, reportData);
  } catch (err) {
    next(err);
  }
};

const getReportHistory = async (req, res, next) => {
  try {
    const history = await reportingService.getReportHistory();
    return success(res, history);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlacementReport,
  getReportHistory
};
