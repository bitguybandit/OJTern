const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    NotificationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USER',
        key: 'UserID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      defaultValue: 'info',
      allowNull: false
    },
    DateSent: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    RelatedApplicationID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'APPLICATION',
        key: 'ApplicationID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'NOTIFICATION',
    timestamps: true
  });

  return Notification;
};
