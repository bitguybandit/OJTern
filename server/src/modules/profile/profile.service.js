const { StudentProfile, CompanyProfile, Skill, StudentSkill, User, sequelize } = require('../../models');
const { logAudit } = require('../../utils/audit');

/**
 * Resolves a list of skill IDs or skill names into Skill model instances.
 */
const resolveSkills = async (skillsInput = []) => {
  const resolved = [];
  for (const item of skillsInput) {
    if (typeof item === 'number' || (!isNaN(item) && typeof item === 'string' && Number.isInteger(Number(item)))) {
      const skill = await Skill.findByPk(parseInt(item, 10));
      if (skill) resolved.push(skill);
    } else if (typeof item === 'string' && item.trim()) {
      const [skill] = await Skill.findOrCreate({
        where: { SkillName: item.trim() }
      });
      resolved.push(skill);
    } else if (item && item.SkillID) {
      const skill = await Skill.findByPk(item.SkillID);
      if (skill) resolved.push(skill);
    }
  }
  return resolved;
};

// --- Student Profile ---

const getStudentProfileByUserId = async (userId) => {
  return await StudentProfile.findOne({
    where: { UserID: userId },
    include: [
      {
        model: Skill,
        as: 'skills',
        through: { attributes: [] }
      },
      {
        model: User,
        as: 'user',
        attributes: ['UserID', 'Name', 'Email', 'Role', 'Status']
      }
    ]
  });
};

const upsertStudentProfile = async (userId, data) => {
  const { academicProgram, yearLevel, interests, preferredLocation, resumePath, skills } = data;

  let profile = await StudentProfile.findOne({ where: { UserID: userId } });
  const isNew = !profile;
  const oldValue = profile ? profile.toJSON() : null;

  if (!profile) {
    profile = await StudentProfile.create({
      UserID: userId,
      AcademicProgram: academicProgram,
      YearLevel: yearLevel || 'Year 3',
      Interests: interests || '',
      PreferredLocation: preferredLocation,
      ResumePath: resumePath || null
    });
  } else {
    profile.AcademicProgram = academicProgram;
    if (yearLevel) profile.YearLevel = yearLevel;
    if (interests !== undefined) profile.Interests = interests;
    profile.PreferredLocation = preferredLocation;
    if (resumePath !== undefined) profile.ResumePath = resumePath;
    await profile.save();
  }

  // Handle skills association
  if (Array.isArray(skills)) {
    const resolvedSkills = await resolveSkills(skills);
    await profile.setSkills(resolvedSkills);
  }

  // Reload with relations
  const reloaded = await getStudentProfileByUserId(userId);

  await logAudit({
    userId,
    action: isNew ? 'CREATE_STUDENT_PROFILE' : 'UPDATE_STUDENT_PROFILE',
    entityAffected: 'STUDENT_PROFILE',
    entityId: profile.ProfileID,
    oldValue,
    newValue: reloaded.toJSON()
  });

  return reloaded;
};

// --- Company Profile ---

const getCompanyProfileByUserId = async (userId) => {
  return await CompanyProfile.findOne({
    where: { UserID: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['UserID', 'Name', 'Email', 'Role', 'Status']
      }
    ]
  });
};

const upsertCompanyProfile = async (userId, data) => {
  const { companyName, industry, officeAddress, contactPerson, contactEmail } = data;

  let profile = await CompanyProfile.findOne({ where: { UserID: userId } });
  const isNew = !profile;
  const oldValue = profile ? profile.toJSON() : null;

  if (!profile) {
    profile = await CompanyProfile.create({
      UserID: userId,
      CompanyName: companyName,
      Industry: industry,
      OfficeAddress: officeAddress,
      ContactPerson: contactPerson,
      ContactEmail: contactEmail,
      VerificationStatus: 'Pending' // New companies start Pending
    });
  } else {
    profile.CompanyName = companyName;
    profile.Industry = industry;
    profile.OfficeAddress = officeAddress;
    profile.ContactPerson = contactPerson;
    profile.ContactEmail = contactEmail;
    // Keep existing VerificationStatus on normal update
    await profile.save();
  }

  const reloaded = await getCompanyProfileByUserId(userId);

  await logAudit({
    userId,
    action: isNew ? 'CREATE_COMPANY_PROFILE' : 'UPDATE_COMPANY_PROFILE',
    entityAffected: 'COMPANY_PROFILE',
    entityId: profile.CompanyID,
    oldValue,
    newValue: reloaded.toJSON()
  });

  return reloaded;
};

const getAllSkills = async () => {
  return await Skill.findAll({
    order: [['SkillName', 'ASC']]
  });
};

module.exports = {
  getStudentProfileByUserId,
  upsertStudentProfile,
  getCompanyProfileByUserId,
  upsertCompanyProfile,
  getAllSkills,
  resolveSkills
};
