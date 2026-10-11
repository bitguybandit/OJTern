const matchingService = require('./matching.service');
const { StudentProfile } = require('../../models');
const { success, error } = require('../../utils/response');

const getRecommendations = async (req, res, next) => {
  try {
    const profileId = parseInt(req.params.profileId, 10);
    if (isNaN(profileId)) {
      return error(res, {
        code: 'INVALID_ID',
        message: 'Invalid profile ID provided.'
      }, 400);
    }

    // Verify ownership: Student role must own this profile
    const studentProfile = await StudentProfile.findByPk(profileId);
    if (!studentProfile) {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Student profile not found.'
      }, 404);
    }

    if (studentProfile.UserID !== req.user.UserID) {
      return error(res, {
        code: 'FORBIDDEN',
        message: 'You can only view recommendations for your own profile.'
      }, 403);
    }

    const recommendations = await matchingService.getRecommendationsWithTimeout(profileId);
    return success(res, recommendations);
  } catch (err) {
    if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Student profile not found.'
      }, 404);
    }
    next(err);
  }
};

module.exports = {
  getRecommendations
};
