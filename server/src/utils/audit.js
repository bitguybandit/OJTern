const { AuditLog } = require('../models');

/**
 * Creates an entry in the AUDIT_LOG table.
 * Fails gracefully so an audit log failure never breaks core business actions,
 * while logging any errors to console.
 */
const logAudit = async ({ userId = null, action, entityAffected, entityId = null, oldValue = null, newValue = null }) => {
  try {
    const entry = await AuditLog.create({
      UserID: userId,
      Action: action,
      EntityAffected: entityAffected,
      EntityID: entityId !== null ? String(entityId) : null,
      OldValue: oldValue,
      NewValue: newValue,
      Timestamp: new Date()
    });
    return entry;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
    return null;
  }
};

module.exports = {
  logAudit
};
