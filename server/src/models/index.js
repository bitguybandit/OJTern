const { sequelize, Sequelize } = require('../config/db');

// Import model factories
const UserModel = require('./User');
const StudentProfileModel = require('./StudentProfile');
const CompanyProfileModel = require('./CompanyProfile');
const SkillModel = require('./Skill');
const StudentSkillModel = require('./StudentSkill');
const InternshipPostingModel = require('./InternshipPosting');
const PostingSkillRequirementModel = require('./PostingSkillRequirement');
const ApplicationModel = require('./Application');
const EndorsementDocumentModel = require('./EndorsementDocument');
const NotificationModel = require('./Notification');
const PlacementReportModel = require('./PlacementReport');
const AuditLogModel = require('./AuditLog');

// Initialize models
const User = UserModel(sequelize);
const StudentProfile = StudentProfileModel(sequelize);
const CompanyProfile = CompanyProfileModel(sequelize);
const Skill = SkillModel(sequelize);
const StudentSkill = StudentSkillModel(sequelize);
const InternshipPosting = InternshipPostingModel(sequelize);
const PostingSkillRequirement = PostingSkillRequirementModel(sequelize);
const Application = ApplicationModel(sequelize);
const EndorsementDocument = EndorsementDocumentModel(sequelize);
const Notification = NotificationModel(sequelize);
const PlacementReport = PlacementReportModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Associations

// User <-> StudentProfile (1:1)
User.hasOne(StudentProfile, { foreignKey: 'UserID', as: 'studentProfile', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'UserID', as: 'user', onDelete: 'CASCADE' });

// User <-> CompanyProfile (1:1)
User.hasOne(CompanyProfile, { foreignKey: 'UserID', as: 'companyProfile', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'UserID', as: 'user', onDelete: 'CASCADE' });

// StudentProfile <-> Skill (M:N via StudentSkill)
StudentProfile.belongsToMany(Skill, {
  through: StudentSkill,
  foreignKey: 'ProfileID',
  otherKey: 'SkillID',
  as: 'skills'
});
Skill.belongsToMany(StudentProfile, {
  through: StudentSkill,
  foreignKey: 'SkillID',
  otherKey: 'ProfileID',
  as: 'studentProfiles'
});

// CompanyProfile <-> InternshipPosting (1:N)
CompanyProfile.hasMany(InternshipPosting, { foreignKey: 'CompanyID', as: 'postings', onDelete: 'CASCADE' });
InternshipPosting.belongsTo(CompanyProfile, { foreignKey: 'CompanyID', as: 'company', onDelete: 'CASCADE' });

// InternshipPosting <-> Skill (M:N via PostingSkillRequirement)
InternshipPosting.belongsToMany(Skill, {
  through: PostingSkillRequirement,
  foreignKey: 'PostingID',
  otherKey: 'SkillID',
  as: 'skills'
});
Skill.belongsToMany(InternshipPosting, {
  through: PostingSkillRequirement,
  foreignKey: 'SkillID',
  otherKey: 'PostingID',
  as: 'postings'
});

// StudentProfile <-> Application (1:N)
StudentProfile.hasMany(Application, { foreignKey: 'ProfileID', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(StudentProfile, { foreignKey: 'ProfileID', as: 'studentProfile', onDelete: 'CASCADE' });

// InternshipPosting <-> Application (1:N)
InternshipPosting.hasMany(Application, { foreignKey: 'PostingID', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(InternshipPosting, { foreignKey: 'PostingID', as: 'posting', onDelete: 'CASCADE' });

// User (Coordinator) <-> Application (1:N)
User.hasMany(Application, { foreignKey: 'ReviewedByCoordinatorID', as: 'reviewedApplications' });
Application.belongsTo(User, { foreignKey: 'ReviewedByCoordinatorID', as: 'reviewedByCoordinator' });

// Application <-> EndorsementDocument (1:1)
Application.hasOne(EndorsementDocument, { foreignKey: 'ApplicationID', as: 'endorsementDocument', onDelete: 'CASCADE' });
EndorsementDocument.belongsTo(Application, { foreignKey: 'ApplicationID', as: 'application', onDelete: 'CASCADE' });

// User <-> Notification (1:N)
User.hasMany(Notification, { foreignKey: 'UserID', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'UserID', as: 'user', onDelete: 'CASCADE' });

// Application <-> Notification (1:N)
Application.hasMany(Notification, { foreignKey: 'RelatedApplicationID', as: 'notifications', onDelete: 'SET NULL' });
Notification.belongsTo(Application, { foreignKey: 'RelatedApplicationID', as: 'relatedApplication', onDelete: 'SET NULL' });

// User (Coordinator) <-> PlacementReport (1:N)
User.hasMany(PlacementReport, { foreignKey: 'CoordinatorID', as: 'placementReports', onDelete: 'CASCADE' });
PlacementReport.belongsTo(User, { foreignKey: 'CoordinatorID', as: 'coordinator', onDelete: 'CASCADE' });

// User <-> AuditLog (1:N)
User.hasMany(AuditLog, { foreignKey: 'UserID', as: 'auditLogs', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'UserID', as: 'user', onDelete: 'SET NULL' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  StudentProfile,
  CompanyProfile,
  Skill,
  StudentSkill,
  InternshipPosting,
  PostingSkillRequirement,
  Application,
  EndorsementDocument,
  Notification,
  PlacementReport,
  AuditLog
};
