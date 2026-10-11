const path = require('path');
const fs = require('fs');
const {
  Application,
  EndorsementDocument,
  InternshipPosting,
  StudentProfile,
  CompanyProfile,
  Skill,
  User
} = require('../../models');
const { notifyUser } = require('../notification/notification.service');
const { logAudit } = require('../../utils/audit');
const env = require('../../config/env');

/**
 * Submit an application with a mandatory endorsement document (FR-05, FR-06, BR-01).
 */
const submitApplication = async ({ userId, postingId, file }) => {
  // 1. Verify student profile exists
  const studentProfile = await StudentProfile.findOne({ where: { UserID: userId } });
  if (!studentProfile) {
    throw {
      status: 400,
      code: 'PROFILE_REQUIRED',
      message: 'Please complete your student profile before applying for internships.'
    };
  }

  // 2. Verify posting exists and is Active
  const posting = await InternshipPosting.findByPk(postingId, {
    include: [{ model: CompanyProfile, as: 'company' }]
  });
  if (!posting || posting.Status !== 'Active') {
    throw {
      status: 400,
      code: 'POSTING_UNAVAILABLE',
      message: 'This internship posting is not currently accepting applications.'
    };
  }

  // 3. Verify student hasn't already applied
  const existingApp = await Application.findOne({
    where: {
      ProfileID: studentProfile.ProfileID,
      PostingID: postingId
    }
  });
  if (existingApp) {
    throw {
      status: 400,
      code: 'ALREADY_APPLIED',
      message: 'You have already submitted an application for this internship posting.'
    };
  }

  // 4. BR-01: Endorsement document is mandatory
  if (!file) {
    throw {
      status: 400,
      code: 'DOCUMENT_REQUIRED',
      message: 'Endorsement document is required before submission.'
    };
  }

  // 5. Create Application record
  const application = await Application.create({
    ProfileID: studentProfile.ProfileID,
    PostingID: postingId,
    Status: 'Pending',
    DateSubmitted: new Date(),
    PartnerDecision: 'None'
  });

  // 6. Move file to structured directory: uploads/applications/{applicationId}/
  const appDir = path.join(env.UPLOAD_DIR, 'applications', String(application.ApplicationID));
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const finalFilePath = path.join(appDir, file.filename);
  try {
    fs.renameSync(file.path, finalFilePath);
  } catch (mvErr) {
    // If cross-device or same directory, copy and unlink
    fs.copyFileSync(file.path, finalFilePath);
    try { fs.unlinkSync(file.path); } catch (e) {}
  }

  const relativeFilePath = `uploads/applications/${application.ApplicationID}/${file.filename}`;

  // 7. Create EndorsementDocument row
  const endorsementDoc = await EndorsementDocument.create({
    ApplicationID: application.ApplicationID,
    FileName: file.originalname,
    FilePath: relativeFilePath,
    FileSize: file.size,
    UploadDate: new Date()
  });

  // 8. Trigger Notification (FR-10) — In-app to student
  await notifyUser({
    userId,
    message: `Application received for "${posting.Title}" at ${posting.company ? posting.company.CompanyName : 'Company'}. Your endorsement document is pending coordinator review.`,
    type: 'info',
    relatedApplicationId: application.ApplicationID,
    emailSubject: `Application Received: ${posting.Title}`
  });

  // Notify coordinators
  const coordinators = await User.findAll({ where: { Role: 'OJTCoordinator', Status: 'active' } });
  for (const coord of coordinators) {
    await notifyUser({
      userId: coord.UserID,
      message: `New student application pending review: ${studentProfile.AcademicProgram} student for "${posting.Title}".`,
      type: 'info',
      relatedApplicationId: application.ApplicationID,
      emailSubject: `New OJT Application Pending Review`
    });
  }

  // 9. Audit Log
  await logAudit({
    userId,
    action: 'SUBMIT_APPLICATION',
    entityAffected: 'APPLICATION',
    entityId: application.ApplicationID,
    oldValue: null,
    newValue: {
      applicationId: application.ApplicationID,
      postingId,
      documentId: endorsementDoc.DocumentID,
      fileName: file.originalname
    }
  });

  return {
    application,
    endorsementDocument: endorsementDoc
  };
};

/**
 * Get all applications submitted by the current student.
 */
const getStudentApplications = async (userId) => {
  const profile = await StudentProfile.findOne({ where: { UserID: userId } });
  if (!profile) return [];

  return await Application.findAll({
    where: { ProfileID: profile.ProfileID },
    include: [
      {
        model: InternshipPosting,
        as: 'posting',
        include: [{ model: CompanyProfile, as: 'company' }]
      },
      {
        model: EndorsementDocument,
        as: 'endorsementDocument'
      }
    ],
    order: [['DateSubmitted', 'DESC']]
  });
};

/**
 * Coordinator Applications Queue (FR-07)
 */
const getCoordinatorApplications = async (statusFilter = null) => {
  const where = {};
  if (statusFilter && statusFilter !== 'All') {
    where.Status = statusFilter;
  }

  return await Application.findAll({
    where,
    include: [
      {
        model: StudentProfile,
        as: 'studentProfile',
        include: [
          { model: User, as: 'user', attributes: ['UserID', 'Name', 'Email'] },
          { model: Skill, as: 'skills' }
        ]
      },
      {
        model: InternshipPosting,
        as: 'posting',
        include: [{ model: CompanyProfile, as: 'company' }]
      },
      {
        model: EndorsementDocument,
        as: 'endorsementDocument'
      }
    ],
    order: [['DateSubmitted', 'DESC']]
  });
};

/**
 * Coordinator Full Application Detail (FR-07)
 */
const getApplicationDetail = async (applicationId) => {
  return await Application.findByPk(applicationId, {
    include: [
      {
        model: StudentProfile,
        as: 'studentProfile',
        include: [
          { model: User, as: 'user', attributes: ['UserID', 'Name', 'Email'] },
          { model: Skill, as: 'skills' }
        ]
      },
      {
        model: InternshipPosting,
        as: 'posting',
        include: [
          { model: CompanyProfile, as: 'company' },
          { model: Skill, as: 'skills' }
        ]
      },
      {
        model: EndorsementDocument,
        as: 'endorsementDocument'
      },
      {
        model: User,
        as: 'reviewedByCoordinator',
        attributes: ['UserID', 'Name', 'Email']
      }
    ]
  });
};

/**
 * Coordinator Review & Decision (FR-08, BR-01, BR-02)
 */
const reviewApplication = async ({ applicationId, action, comment, coordinatorId }) => {
  const application = await Application.findByPk(applicationId, {
    include: [
      { model: EndorsementDocument, as: 'endorsementDocument' },
      {
        model: StudentProfile,
        as: 'studentProfile',
        include: [{ model: User, as: 'user' }]
      },
      {
        model: InternshipPosting,
        as: 'posting',
        include: [{ model: CompanyProfile, as: 'company' }]
      }
    ]
  });

  if (!application) {
    throw {
      status: 404,
      code: 'APPLICATION_NOT_FOUND',
      message: 'Application not found.'
    };
  }

  // BR-01: An application cannot be Approved if the endorsement document is missing
  if (action === 'Approve' && !application.endorsementDocument) {
    throw {
      status: 400,
      code: 'ENDORSEMENT_DOCUMENT_MISSING',
      message: 'Cannot approve application: Endorsement document is missing.'
    };
  }

  let newStatus;
  if (action === 'Approve') {
    newStatus = 'Approved';
  } else if (action === 'Reject') {
    newStatus = 'Rejected';
  } else if (action === 'ReturnForCorrection') {
    newStatus = 'ReturnedForCorrection';
  } else {
    throw {
      status: 400,
      code: 'INVALID_ACTION',
      message: "Action must be 'Approve', 'Reject', or 'ReturnForCorrection'."
    };
  }

  const oldValues = {
    Status: application.Status,
    DateReviewed: application.DateReviewed,
    ReviewedByCoordinatorID: application.ReviewedByCoordinatorID,
    FeedbackComment: application.FeedbackComment
  };

  application.Status = newStatus;
  application.DateReviewed = new Date();
  application.ReviewedByCoordinatorID = coordinatorId;
  application.FeedbackComment = comment || null;
  await application.save();

  // Audit Log (BR-02)
  await logAudit({
    userId: coordinatorId,
    action: `COORDINATOR_${action.toUpperCase()}`,
    entityAffected: 'APPLICATION',
    entityId: application.ApplicationID,
    oldValue: oldValues,
    newValue: {
      Status: newStatus,
      DateReviewed: application.DateReviewed,
      ReviewedByCoordinatorID: coordinatorId,
      FeedbackComment: comment
    }
  });

  // Trigger Notifications (FR-10, FR-11)
  const studentUser = application.studentProfile ? application.studentProfile.user : null;
  if (studentUser) {
    let msg = '';
    let type = 'info';

    if (newStatus === 'Approved') {
      msg = `Your application for "${application.posting.Title}" has been APPROVED by the OJT Coordinator and forwarded to ${application.posting.company.CompanyName}.`;
      type = 'success';
    } else if (newStatus === 'Rejected') {
      msg = `Your application for "${application.posting.Title}" was REJECTED by the coordinator.${comment ? ' Remarks: ' + comment : ''}`;
      type = 'error';
    } else {
      msg = `Your application for "${application.posting.Title}" was RETURNED FOR CORRECTION.${comment ? ' Remarks: ' + comment : ''}`;
      type = 'warning';
    }

    await notifyUser({
      userId: studentUser.UserID,
      message: msg,
      type,
      relatedApplicationId: application.ApplicationID,
      emailSubject: `Application Status Update: ${newStatus}`
    });
  }

  return application;
};

/**
 * Partner Screens Coordinator-Approved Applicants (FR-09, BR-03)
 */
const getApprovedApplicantsForPosting = async ({ postingId, partnerUserId }) => {
  // Verify company ownership of this posting
  const company = await CompanyProfile.findOne({ where: { UserID: partnerUserId } });
  if (!company) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Company profile not registered.' };
  }

  const posting = await InternshipPosting.findByPk(postingId);
  if (!posting || posting.CompanyID !== company.CompanyID) {
    throw { status: 403, code: 'FORBIDDEN', message: 'You can only view applicants for postings created by your company.' };
  }

  // BR-03: Enforce Status = 'Approved' (or already Placed / RejectedByPartner by this partner)
  return await Application.findAll({
    where: {
      PostingID: postingId,
      Status: ['Approved', 'Placed', 'RejectedByPartner']
    },
    include: [
      {
        model: StudentProfile,
        as: 'studentProfile',
        include: [
          { model: User, as: 'user', attributes: ['UserID', 'Name', 'Email'] },
          { model: Skill, as: 'skills' }
        ]
      },
      {
        model: EndorsementDocument,
        as: 'endorsementDocument'
      }
    ],
    order: [['DateSubmitted', 'DESC']]
  });
};

/**
 * Partner Decision on Approved Application (FR-09)
 */
const decideOnApplicant = async ({ applicationId, decision, partnerUserId }) => {
  const company = await CompanyProfile.findOne({ where: { UserID: partnerUserId } });
  if (!company) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Company profile not registered.' };
  }

  const application = await Application.findByPk(applicationId, {
    include: [
      {
        model: InternshipPosting,
        as: 'posting'
      },
      {
        model: StudentProfile,
        as: 'studentProfile',
        include: [{ model: User, as: 'user' }]
      }
    ]
  });

  if (!application) {
    throw { status: 404, code: 'APPLICATION_NOT_FOUND', message: 'Application not found.' };
  }

  if (application.posting.CompanyID !== company.CompanyID) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Access denied. Posting belongs to another company.' };
  }

  // BR-03: Decision can only be made on Coordinator-Approved applications
  if (!['Approved', 'Placed', 'RejectedByPartner'].includes(application.Status)) {
    throw {
      status: 400,
      code: 'INVALID_STATUS',
      message: 'Only coordinator-approved applications can be accepted or rejected by the industry partner.'
    };
  }

  const oldValues = {
    Status: application.Status,
    PartnerDecision: application.PartnerDecision
  };

  if (decision === 'Accept') {
    application.PartnerDecision = 'Accepted';
    application.Status = 'Placed';
  } else if (decision === 'Reject') {
    application.PartnerDecision = 'Rejected';
    application.Status = 'RejectedByPartner';
  } else {
    throw { status: 400, code: 'INVALID_DECISION', message: "Decision must be 'Accept' or 'Reject'." };
  }

  await application.save();

  // Audit Log
  await logAudit({
    userId: partnerUserId,
    action: `PARTNER_${decision.toUpperCase()}_APPLICANT`,
    entityAffected: 'APPLICATION',
    entityId: application.ApplicationID,
    oldValue: oldValues,
    newValue: {
      PartnerDecision: application.PartnerDecision,
      Status: application.Status
    }
  });

  // Notify student
  const studentUser = application.studentProfile ? application.studentProfile.user : null;
  if (studentUser) {
    const isPlaced = application.Status === 'Placed';
    const msg = isPlaced
      ? `Congratulations! You have been ACCEPTED and PLACED as an intern for "${application.posting.Title}" at ${company.CompanyName}!`
      : `Your application for "${application.posting.Title}" was not selected by ${company.CompanyName}.`;

    await notifyUser({
      userId: studentUser.UserID,
      message: msg,
      type: isPlaced ? 'success' : 'warning',
      relatedApplicationId: application.ApplicationID,
      emailSubject: isPlaced ? 'OJT Placement Confirmed!' : 'Internship Application Update'
    });
  }

  return application;
};

module.exports = {
  submitApplication,
  getStudentApplications,
  getCoordinatorApplications,
  getApplicationDetail,
  reviewApplication,
  getApprovedApplicantsForPosting,
  decideOnApplicant
};
