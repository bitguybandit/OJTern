const profileService = require('./profile.service');
const { success, error } = require('../../utils/response');

// --- Student Profile Controllers ---

const getStudentProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getStudentProfileByUserId(req.user.UserID);
    if (!profile) {
      return error(res, {
        code: 'PROFILE_NOT_FOUND',
        message: 'Student profile has not been created yet.'
      }, 404);
    }
    return success(res, profile);
  } catch (err) {
    next(err);
  }
};

const saveStudentProfile = async (req, res, next) => {
  try {
    const { academicProgram, yearLevel, interests, preferredLocation, skills, resumePath } = req.body;
    const details = {};

    if (!academicProgram || !academicProgram.trim()) {
      details.academicProgram = 'Academic program is required.';
    }
    if (!preferredLocation || !preferredLocation.trim()) {
      details.preferredLocation = 'Preferred location is required.';
    }
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      details.skills = 'At least one skill is required.';
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Student profile validation failed.',
        details
      }, 400);
    }

    const saved = await profileService.upsertStudentProfile(req.user.UserID, {
      academicProgram: academicProgram.trim(),
      yearLevel: yearLevel ? yearLevel.trim() : 'Year 3',
      interests: interests ? interests.trim() : '',
      preferredLocation: preferredLocation.trim(),
      skills,
      resumePath
    });

    return success(res, saved, 201);
  } catch (err) {
    next(err);
  }
};

// --- Company Profile Controllers ---

const getCompanyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getCompanyProfileByUserId(req.user.UserID);
    if (!profile) {
      return error(res, {
        code: 'PROFILE_NOT_FOUND',
        message: 'Company profile has not been created yet.'
      }, 404);
    }
    return success(res, profile);
  } catch (err) {
    next(err);
  }
};

const saveCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, industry, officeAddress, contactPerson, contactEmail } = req.body;
    const details = {};

    if (!companyName || !companyName.trim()) {
      details.companyName = 'Company name is required.';
    }
    if (!industry || !industry.trim()) {
      details.industry = 'Industry is required.';
    }
    if (!officeAddress || !officeAddress.trim()) {
      details.officeAddress = 'Office address is required.';
    }
    if (!contactPerson || !contactPerson.trim()) {
      details.contactPerson = 'Contact person is required.';
    }
    if (!contactEmail || !contactEmail.trim()) {
      details.contactEmail = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      details.contactEmail = 'A valid contact email address is required.';
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Company profile validation failed.',
        details
      }, 400);
    }

    const saved = await profileService.upsertCompanyProfile(req.user.UserID, {
      companyName: companyName.trim(),
      industry: industry.trim(),
      officeAddress: officeAddress.trim(),
      contactPerson: contactPerson.trim(),
      contactEmail: contactEmail.trim()
    });

    return success(res, saved, 201);
  } catch (err) {
    next(err);
  }
};

const getSkillsList = async (req, res, next) => {
  try {
    const skills = await profileService.getAllSkills();
    return success(res, skills);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentProfile,
  saveStudentProfile,
  getCompanyProfile,
  saveCompanyProfile,
  getSkillsList
};
