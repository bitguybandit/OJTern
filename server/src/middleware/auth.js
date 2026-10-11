const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const { error } = require('../utils/response');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.'
      }, 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (jwtErr) {
      return error(res, {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token.'
      }, 401);
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return error(res, {
        code: 'USER_NOT_FOUND',
        message: 'Authenticated user no longer exists.'
      }, 401);
    }

    if (user.Status !== 'active') {
      return error(res, {
        code: 'ACCOUNT_INACTIVE',
        message: 'User account has been deactivated.'
      }, 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireAuth
};
