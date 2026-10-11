const { Op } = require('sequelize');
const { Application, StudentProfile, CompanyProfile, InternshipPosting, PlacementReport } = require('../../models');

const generatePlacementReport = async ({ month, year, coordinatorId }) => {
  const targetYear = parseInt(year, 10) || new Date().getFullYear();
  const targetMonth = parseInt(month, 10) || (new Date().getMonth() + 1);

  // Determine start & end date for the selected month/year
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  // Applications where Status is Placed or Approved within that timeframe (or overall for that month)
  const applications = await Application.findAll({
    where: {
      Status: {
        [Op.in]: ['Placed', 'Approved']
      },
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: StudentProfile,
        as: 'studentProfile',
        attributes: ['ProfileID', 'AcademicProgram']
      },
      {
        model: InternshipPosting,
        as: 'posting',
        include: [
          {
            model: CompanyProfile,
            as: 'company',
            attributes: ['CompanyID', 'CompanyName']
          }
        ]
      }
    ]
  });

  // Aggregations
  const companyCounts = {};
  const programCounts = {};

  for (const app of applications) {
    const compName = (app.posting && app.posting.company && app.posting.company.CompanyName)
      ? app.posting.company.CompanyName
      : 'Unknown Company';
    companyCounts[compName] = (companyCounts[compName] || 0) + 1;

    const progName = (app.studentProfile && app.studentProfile.AcademicProgram)
      ? app.studentProfile.AcademicProgram
      : 'Unknown Program';
    programCounts[progName] = (programCounts[progName] || 0) + 1;
  }

  const byCompany = Object.entries(companyCounts).map(([company, count]) => ({ company, count }));
  const byProgram = Object.entries(programCounts).map(([program, count]) => ({ program, count }));

  const reportData = {
    total: applications.length,
    byCompany,
    byProgram,
    month: targetMonth,
    year: targetYear
  };

  // Save PlacementReport row
  if (coordinatorId) {
    await PlacementReport.create({
      CoordinatorID: coordinatorId,
      Month: targetMonth,
      Year: targetYear,
      GeneratedDate: new Date(),
      ReportData: reportData
    }).catch(err => {
      console.warn('Failed to save PlacementReport history row:', err.message);
    });
  }

  return reportData;
};

const formatReportAsCsv = (reportData) => {
  const lines = [];
  lines.push(`"OJTerm Monthly Placement Report"`);
  lines.push(`"Month","${reportData.month}","Year","${reportData.year}"`);
  lines.push(`"Total Placements / Approved","${reportData.total}"`);
  lines.push('');
  lines.push('"BY COMPANY"');
  lines.push('"Company Name","Count"');
  if (reportData.byCompany && reportData.byCompany.length > 0) {
    reportData.byCompany.forEach(c => {
      lines.push(`"${c.company.replace(/"/g, '""')}","${c.count}"`);
    });
  } else {
    lines.push('"No company placements recorded","0"');
  }

  lines.push('');
  lines.push('"BY ACADEMIC PROGRAM"');
  lines.push('"Program","Count"');
  if (reportData.byProgram && reportData.byProgram.length > 0) {
    reportData.byProgram.forEach(p => {
      lines.push(`"${p.program.replace(/"/g, '""')}","${p.count}"`);
    });
  } else {
    lines.push('"No program placements recorded","0"');
  }

  return lines.join('\n');
};

const getReportHistory = async () => {
  return await PlacementReport.findAll({
    order: [['GeneratedDate', 'DESC']],
    limit: 20
  });
};

module.exports = {
  generatePlacementReport,
  formatReportAsCsv,
  getReportHistory
};
