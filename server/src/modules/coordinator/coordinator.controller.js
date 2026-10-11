const { CompanyProfile, Application, InternshipPosting, User } = require('../../models');
const { success, error } = require('../../utils/response');
const { logAudit } = require('../../utils/audit');
const { notifyUser } = require('../notification/notification.service');

const getCompanies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'All') {
      where.VerificationStatus = status;
    }

    const companies = await CompanyProfile.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['UserID', 'Name', 'Email'] }],
      order: [['createdAt', 'DESC']]
    });

    return success(res, companies);
  } catch (err) {
    next(err);
  }
};

const verifyCompany = async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: "Status is required and must be either 'Verified' or 'Rejected'."
      }, 400);
    }

    const company = await CompanyProfile.findByPk(companyId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!company) {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Company profile not found.'
      }, 404);
    }

    const oldValue = company.VerificationStatus;
    company.VerificationStatus = status;
    await company.save();

    await logAudit({
      userId: req.user.UserID,
      action: `COORDINATOR_VERIFY_COMPANY_${status.toUpperCase()}`,
      entityAffected: 'COMPANY_PROFILE',
      entityId: company.CompanyID,
      oldValue: { VerificationStatus: oldValue },
      newValue: { VerificationStatus: status }
    });

    // Notify partner
    if (company.user) {
      const isVerified = status === 'Verified';
      await notifyUser({
        userId: company.user.UserID,
        message: isVerified
          ? `Congratulations! Your company (${company.CompanyName}) has been VERIFIED by the OJT Coordinator. You can now post internship openings.`
          : `Your company verification request for (${company.CompanyName}) was not approved by the OJT Coordinator.`,
        type: isVerified ? 'success' : 'error',
        emailSubject: `Company Verification: ${status}`
      });
    }

    return success(res, company);
  } catch (err) {
    next(err);
  }
};

const getDashboardKPIs = async (req, res, next) => {
  try {
    const pendingApplications = await Application.count({ where: { Status: 'Pending' } });
    const approvedApplications = await Application.count({ where: { Status: 'Approved' } });
    const placedApplications = await Application.count({ where: { Status: 'Placed' } });
    const activePostings = await InternshipPosting.count({ where: { Status: 'Active' } });
    const pendingCompanies = await CompanyProfile.count({ where: { VerificationStatus: 'Pending' } });
    const verifiedCompanies = await CompanyProfile.count({ where: { VerificationStatus: 'Verified' } });

    return success(res, {
      pendingApplications,
      approvedApplications,
      placedApplications,
      activePostings,
      pendingCompanies,
      verifiedCompanies
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  verifyCompany,
  getDashboardKPIs
};
