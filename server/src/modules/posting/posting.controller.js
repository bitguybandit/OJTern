const postingService = require('./posting.service');
const { success, error } = require('../../utils/response');

const createPosting = async (req, res, next) => {
  try {
    const { title, description, slots, requiredProgram, location, applicationDeadline, skills } = req.body;
    const details = {};

    if (!title || !title.trim()) {
      details.title = 'Internship title is required.';
    }
    if (!description || !description.trim()) {
      details.description = 'Job description is required.';
    }
    const slotsNum = parseInt(slots, 10);
    if (isNaN(slotsNum) || slotsNum <= 0) {
      details.slots = 'Slots must be a positive integer greater than 0.';
    }
    if (!requiredProgram || !requiredProgram.trim()) {
      details.requiredProgram = 'Required academic program is required.';
    }
    if (!location || !location.trim()) {
      details.location = 'Location is required.';
    }
    if (!applicationDeadline) {
      details.applicationDeadline = 'Application deadline is required.';
    } else {
      const deadlineDate = new Date(applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(deadlineDate.getTime()) || deadlineDate <= today) {
        details.applicationDeadline = 'Application deadline must be a future date.';
      }
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Posting validation failed.',
        details
      }, 400);
    }

    const posting = await postingService.createPosting({
      partnerUserId: req.user.UserID,
      data: {
        title: title.trim(),
        description: description.trim(),
        slots: slotsNum,
        requiredProgram: requiredProgram.trim(),
        location: location.trim(),
        applicationDeadline,
        skills: skills || []
      }
    });

    return success(res, posting, 201);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

const getPostings = async (req, res, next) => {
  try {
    const { mine, search, program, status } = req.query;
    const postings = await postingService.getPostings({
      userId: req.user ? req.user.UserID : null,
      role: req.user ? req.user.Role : null,
      mine: mine === 'true',
      search,
      program,
      status: status || (mine === 'true' ? 'All' : 'Active')
    });
    return success(res, postings);
  } catch (err) {
    next(err);
  }
};

const getPostingDetail = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const posting = await postingService.getPostingById(id);
    if (!posting) {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Internship posting not found.'
      }, 404);
    }
    return success(res, posting);
  } catch (err) {
    next(err);
  }
};

const updatePosting = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await postingService.updatePosting({
      postingId: id,
      partnerUserId: req.user.UserID,
      data: req.body
    });
    return success(res, updated);
  } catch (err) {
    if (err.status) {
      return error(res, { code: err.code, message: err.message }, err.status);
    }
    next(err);
  }
};

module.exports = {
  createPosting,
  getPostings,
  getPostingDetail,
  updatePosting
};
