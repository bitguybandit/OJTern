const path = require('path');
const fs = require('fs');
const applicationService = require('./application.service');
const { Application, EndorsementDocument, InternshipPosting, CompanyProfile, StudentProfile } = require('../../models');
const { success, error } = require('../../utils/response');
const env = require('../../config/env');

const submitApplication = async (req, res, next) => {
  try {
    const { postingId } = req.body;
    const details = {};

    if (!postingId) {
      details.postingId = 'Internship posting ID is required.';
    }

    // BR-01 enforcement
    if (!req.file) {
      details.document = 'Endorsement document is required before submission.';
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Endorsement document is required before submission.',
        details
      }, 400);
    }

    const result = await applicationService.submitApplication({
      userId: req.user.UserID,
      postingId: parseInt(postingId, 10),
      file: req.file
    });

    return success(res, result, 201);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const apps = await applicationService.getStudentApplications(req.user.UserID);
    return success(res, apps);
  } catch (err) {
    next(err);
  }
};

const getCoordinatorQueue = async (req, res, next) => {
  try {
    const { status } = req.query;
    const apps = await applicationService.getCoordinatorApplications(status);
    return success(res, apps);
  } catch (err) {
    next(err);
  }
};

const getCoordinatorDetail = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const app = await applicationService.getApplicationDetail(applicationId);
    if (!app) {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Application not found.'
      }, 404);
    }
    return success(res, app);
  } catch (err) {
    next(err);
  }
};

const reviewApplication = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const { action, comment } = req.body;

    if (!action || !['Approve', 'Reject', 'ReturnForCorrection'].includes(action)) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: "Action is required and must be 'Approve', 'Reject', or 'ReturnForCorrection'."
      }, 400);
    }

    const updated = await applicationService.reviewApplication({
      applicationId,
      action,
      comment,
      coordinatorId: req.user.UserID
    });

    return success(res, updated);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

const getPartnerApplicants = async (req, res, next) => {
  try {
    const postingId = parseInt(req.params.id, 10);
    const applicants = await applicationService.getApprovedApplicantsForPosting({
      postingId,
      partnerUserId: req.user.UserID
    });
    return success(res, applicants);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

const decidePartnerApplication = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const { decision } = req.body;

    if (!decision || !['Accept', 'Reject'].includes(decision)) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: "Decision is required and must be 'Accept' or 'Reject'."
      }, 400);
    }

    const updated = await applicationService.decideOnApplicant({
      applicationId,
      decision,
      partnerUserId: req.user.UserID
    });

    return success(res, updated);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

/**
 * Streams endorsement document to authorized parties.
 */
const viewDocument = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const app = await Application.findByPk(applicationId, {
      include: [
        { model: EndorsementDocument, as: 'endorsementDocument' },
        { model: StudentProfile, as: 'studentProfile' },
        { model: InternshipPosting, as: 'posting' }
      ]
    });

    if (!app || !app.endorsementDocument) {
      return error(res, { code: 'NOT_FOUND', message: 'Document not found.' }, 404);
    }

    // Role-based document access check
    const isCoordinator = req.user.Role === 'OJTCoordinator';
    const isAdmin = req.user.Role === 'SchoolAdministrator';
    const isOwnerStudent = req.user.Role === 'Student' && app.studentProfile && app.studentProfile.UserID === req.user.UserID;

    let isPostingPartner = false;
    if (req.user.Role === 'IndustryPartner') {
      const company = await CompanyProfile.findOne({ where: { UserID: req.user.UserID } });
      if (company && app.posting && app.posting.CompanyID === company.CompanyID) {
        // Partner can view document if status is Approved/Placed
        if (['Approved', 'Placed', 'RejectedByPartner'].includes(app.Status)) {
          isPostingPartner = true;
        }
      }
    }

    if (!isCoordinator && !isAdmin && !isOwnerStudent && !isPostingPartner) {
      return error(res, { code: 'FORBIDDEN', message: 'Access denied to this document.' }, 403);
    }

    // Find file path
    const doc = app.endorsementDocument;
    let absolutePath = path.resolve(env.UPLOAD_DIR, '..', doc.FilePath);
    if (!fs.existsSync(absolutePath)) {
      absolutePath = path.resolve(env.UPLOAD_DIR, doc.FilePath.replace(/^uploads\//, ''));
    }

    if (!fs.existsSync(absolutePath)) {
      // Fallback to sample endorsement PDF
      absolutePath = path.join(env.UPLOAD_DIR, 'sample_endorsement.pdf');
    }

    if (!fs.existsSync(absolutePath)) {
      return error(res, { code: 'FILE_NOT_FOUND', message: 'Physical document file missing on server.' }, 404);
    }

    const ext = path.extname(doc.FileName).toLowerCase();
    let contentType = 'application/pdf';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.FileName}"`);
    return res.sendFile(absolutePath);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getCoordinatorQueue,
  getCoordinatorDetail,
  reviewApplication,
  getPartnerApplicants,
  decidePartnerApplication,
  viewDocument
};
