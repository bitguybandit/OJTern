const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentProfile, CompanyProfile, Skill } = require('../../models');
const env = require('../../config/env');
const { success, error } = require('../../utils/response');
const { logAudit } = require('../../utils/audit');

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const details = {};

    if (!name || !name.trim()) {
      details.name = 'Full name is required.';
    }
    if (!email || !email.trim()) {
      details.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      details.email = 'A valid email address is required.';
    }
    if (!password || password.length < 6) {
      details.password = 'Password must be at least 6 characters long.';
    }
    const validRoles = ['Student', 'IndustryPartner', 'OJTCoordinator', 'SchoolAdministrator'];
    if (!role || !validRoles.includes(role)) {
      details.role = `Role must be one of: ${validRoles.join(', ')}.`;
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Signup validation failed.',
        details
      }, 400);
    }

    const existingUser = await User.findOne({ where: { Email: email.trim().toLowerCase() } });
    if (existingUser) {
      return error(res, {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
        details: { email: 'Email address is already registered.' }
      }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      Name: name.trim(),
      Email: email.trim().toLowerCase(),
      PasswordHash: passwordHash,
      Role: role,
      Status: 'active'
    });

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role, email: user.Email },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    await logAudit({
      userId: user.UserID,
      action: 'USER_SIGNUP',
      entityAffected: 'USER',
      entityId: user.UserID,
      oldValue: null,
      newValue: { email: user.Email, role: user.Role }
    });

    return success(res, {
      token,
      user: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        Status: user.Status
      }
    }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const details = {};

    if (!email || !email.trim()) {
      details.email = 'Email address is required.';
    }
    if (!password) {
      details.password = 'Password is required.';
    }

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'Login validation failed.',
        details
      }, 400);
    }

    const user = await User.findOne({
      where: { Email: email.trim().toLowerCase() },
      include: [
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [{ model: Skill, as: 'skills' }]
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ]
    });

    if (!user) {
      return error(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      }, 401);
    }

    if (user.Status !== 'active') {
      return error(res, {
        code: 'ACCOUNT_INACTIVE',
        message: 'Your account has been deactivated. Please contact an administrator.'
      }, 403);
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return error(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      }, 401);
    }

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role, email: user.Email },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    return success(res, {
      token,
      user: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        Status: user.Status,
        studentProfile: user.studentProfile || null,
        companyProfile: user.companyProfile || null
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.UserID, {
      attributes: ['UserID', 'Name', 'Email', 'Role', 'Status', 'createdAt'],
      include: [
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [{ model: Skill, as: 'skills' }]
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ]
    });

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  getMe
};
