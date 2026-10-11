const { error } = require('../utils/response');
const { logAudit } = require('../utils/audit');

/**
 * Role-based access control middleware.
 * Accepts one or more permitted roles.
 * On role mismatch, logs the 403 attempt to AuditLog and returns HTTP 403.
 */
const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return error(res, {
        code: 'UNAUTHORIZED',
        message: 'Authentication required before checking roles.'
      }, 401);
    }

    if (!roles.includes(req.user.Role)) {
      // Audit log the unauthorized access attempt
      await logAudit({
        userId: req.user.UserID,
        action: 'ACCESS_DENIED_ROLE_MISMATCH',
        entityAffected: 'ENDPOINT',
        entityId: req.originalUrl,
        oldValue: { attemptedRole: req.user.Role, requiredRoles: roles },
        newValue: { status: 403, ip: req.ip }
      });

      return error(res, {
        code: 'FORBIDDEN',
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Current role: '${req.user.Role}'.`
      }, 403);
    }

    next();
  };
};

module.exports = {
  requireRole
};
