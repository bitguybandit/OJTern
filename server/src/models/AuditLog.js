const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    AuditID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'USER',
        key: 'UserID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    Action: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    EntityAffected: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    EntityID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    OldValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    NewValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    Timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'AUDIT_LOG',
    timestamps: true
  });

  return AuditLog;
};
