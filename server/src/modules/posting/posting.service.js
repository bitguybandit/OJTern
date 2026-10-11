const { Op } = require('sequelize');
const { InternshipPosting, CompanyProfile, Skill, PostingSkillRequirement } = require('../../models');
const { resolveSkills } = require('../profile/profile.service');
const { logAudit } = require('../../utils/audit');

const createPosting = async ({ partnerUserId, data }) => {
  const company = await CompanyProfile.findOne({ where: { UserID: partnerUserId } });
  if (!company) {
    throw { status: 400, code: 'COMPANY_PROFILE_REQUIRED', message: 'You must set up your company profile before posting internships.' };
  }

  // FR-03: Requires Verified company
  if (company.VerificationStatus !== 'Verified') {
    throw {
      status: 403,
      code: 'COMPANY_NOT_VERIFIED',
      message: `Your company verification status is '${company.VerificationStatus}'. Postings can only be created once verified by an OJT Coordinator.`
    };
  }

  const { title, description, slots, requiredProgram, location, applicationDeadline, skills } = data;

  const posting = await InternshipPosting.create({
    CompanyID: company.CompanyID,
    Title: title,
    Description: description,
    Slots: parseInt(slots, 10),
    RequiredProgram: requiredProgram,
    Location: location,
    ApplicationDeadline: applicationDeadline,
    Status: 'Active'
  });

  if (Array.isArray(skills) && skills.length > 0) {
    const resolvedSkills = await resolveSkills(skills);
    await posting.setSkills(resolvedSkills);
  }

  const reloaded = await InternshipPosting.findByPk(posting.PostingID, {
    include: [
      { model: CompanyProfile, as: 'company' },
      { model: Skill, as: 'skills' }
    ]
  });

  await logAudit({
    userId: partnerUserId,
    action: 'CREATE_INTERNSHIP_POSTING',
    entityAffected: 'INTERNSHIP_POSTING',
    entityId: posting.PostingID,
    oldValue: null,
    newValue: reloaded.toJSON()
  });

  return reloaded;
};

const getPostings = async ({ userId = null, role = null, mine = false, search = '', program = '', status = 'Active' }) => {
  const where = {};

  if (mine && role === 'IndustryPartner' && userId) {
    const company = await CompanyProfile.findOne({ where: { UserID: userId } });
    if (!company) return [];
    where.CompanyID = company.CompanyID;
  } else {
    if (status && status !== 'All') {
      where.Status = status;
    }
  }

  if (program) {
    where.RequiredProgram = { [Op.like]: `%${program}%` };
  }

  if (search) {
    where[Op.or] = [
      { Title: { [Op.like]: `%${search}%` } },
      { Description: { [Op.like]: `%${search}%` } },
      { Location: { [Op.like]: `%${search}%` } }
    ];
  }

  return await InternshipPosting.findAll({
    where,
    include: [
      { model: CompanyProfile, as: 'company' },
      { model: Skill, as: 'skills' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const getPostingById = async (id) => {
  return await InternshipPosting.findByPk(id, {
    include: [
      { model: CompanyProfile, as: 'company' },
      { model: Skill, as: 'skills' }
    ]
  });
};

const updatePosting = async ({ postingId, partnerUserId, data }) => {
  const company = await CompanyProfile.findOne({ where: { UserID: partnerUserId } });
  if (!company) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Unauthorized company access.' };
  }

  const posting = await InternshipPosting.findByPk(postingId);
  if (!posting || posting.CompanyID !== company.CompanyID) {
    throw { status: 403, code: 'FORBIDDEN', message: 'You do not have permission to modify this posting.' };
  }

  const oldValue = posting.toJSON();
  const { title, description, slots, requiredProgram, location, applicationDeadline, status, skills } = data;

  if (title) posting.Title = title;
  if (description) posting.Description = description;
  if (slots !== undefined) posting.Slots = parseInt(slots, 10);
  if (requiredProgram) posting.RequiredProgram = requiredProgram;
  if (location) posting.Location = location;
  if (applicationDeadline) posting.ApplicationDeadline = applicationDeadline;
  if (status && ['Active', 'Closed', 'Draft'].includes(status)) posting.Status = status;

  await posting.save();

  if (Array.isArray(skills)) {
    const resolvedSkills = await resolveSkills(skills);
    await posting.setSkills(resolvedSkills);
  }

  const reloaded = await getPostingById(postingId);

  await logAudit({
    userId: partnerUserId,
    action: 'UPDATE_INTERNSHIP_POSTING',
    entityAffected: 'INTERNSHIP_POSTING',
    entityId: posting.PostingID,
    oldValue,
    newValue: reloaded.toJSON()
  });

  return reloaded;
};

module.exports = {
  createPosting,
  getPostings,
  getPostingById,
  updatePosting
};
