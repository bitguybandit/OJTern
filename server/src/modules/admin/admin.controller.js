const bcrypt = require('bcryptjs');
const { User, AuditLog, StudentProfile, CompanyProfile } = require('../../models');
const { success, error } = require('../../utils/response');
const { logAudit } = require('../../utils/audit');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['UserID', 'Name', 'Email', 'Role', 'Status', 'createdAt', 'updatedAt'],
      include: [
        { model: StudentProfile, as: 'studentProfile', attributes: ['ProfileID', 'AcademicProgram'] },
        { model: CompanyProfile, as: 'companyProfile', attributes: ['CompanyID', 'CompanyName', 'VerificationStatus'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return success(res, users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;
    const details = {};

    if (!name || !name.trim()) details.name = 'Full name is required.';
    if (!email || !email.trim()) details.email = 'Email address is required.';
    if (!password || password.length < 6) details.password = 'Password must be at least 6 characters.';
    const validRoles = ['Student', 'IndustryPartner', 'OJTCoordinator', 'SchoolAdministrator'];
    if (!role || !validRoles.includes(role)) details.role = `Role must be one of: ${validRoles.join(', ')}.`;

    if (Object.keys(details).length > 0) {
      return error(res, {
        code: 'VALIDATION_ERROR',
        message: 'User creation failed.',
        details
      }, 400);
    }

    const existing = await User.findOne({ where: { Email: email.trim().toLowerCase() } });
    if (existing) {
      return error(res, {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email address already in use.',
        details: { email: 'Email address already exists.' }
      }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      Name: name.trim(),
      Email: email.trim().toLowerCase(),
      PasswordHash: passwordHash,
      Role: role,
      Status: status || 'active'
    });

    await logAudit({
      userId: req.user.UserID,
      action: 'ADMIN_CREATE_USER',
      entityAffected: 'USER',
      entityId: user.UserID,
      oldValue: null,
      newValue: { email: user.Email, role: user.Role, status: user.Status }
    });

    return success(res, {
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Role: user.Role,
      Status: user.Status
    }, 201);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id);

    if (!user) {
      return error(res, { code: 'NOT_FOUND', message: 'User not found.' }, 404);
    }

    const oldValue = {
      Name: user.Name,
      Email: user.Email,
      Role: user.Role,
      Status: user.Status
    };

    const { name, email, role, status, password } = req.body;

    if (name) user.Name = name.trim();
    if (email) user.Email = email.trim().toLowerCase();
    if (role && ['Student', 'IndustryPartner', 'OJTCoordinator', 'SchoolAdministrator'].includes(role)) {
      user.Role = role;
    }
    if (status && ['active', 'inactive'].includes(status)) {
      user.Status = status;
    }
    if (password && password.length >= 6) {
      user.PasswordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    await logAudit({
      userId: req.user.UserID,
      action: 'ADMIN_UPDATE_USER',
      entityAffected: 'USER',
      entityId: user.UserID,
      oldValue,
      newValue: {
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        Status: user.Status
      }
    });

    return success(res, {
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Role: user.Role,
      Status: user.Status
    });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['UserID', 'Name', 'Email', 'Role']
        }
      ],
      order: [['Timestamp', 'DESC']],
      limit: 100
    });
    return success(res, logs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  getAuditLogs
};
