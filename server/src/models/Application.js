const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    ApplicationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ProfileID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'STUDENT_PROFILE',
        key: 'ProfileID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    PostingID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'INTERNSHIP_POSTING',
        key: 'PostingID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Status: {
      type: DataTypes.ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'ReturnedForCorrection',
        'Placed',
        'RejectedByPartner'
      ),
      defaultValue: 'Pending',
      allowNull: false
    },
    DateSubmitted: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    DateReviewed: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ReviewedByCoordinatorID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'USER',
        key: 'UserID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    PartnerDecision: {
      type: DataTypes.ENUM('None', 'Accepted', 'Rejected'),
      defaultValue: 'None',
      allowNull: false
    },
    FeedbackComment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'APPLICATION',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['ProfileID', 'PostingID']
      },
      {
        fields: ['Status']
      },
      {
        fields: ['PostingID']
      },
      {
        fields: ['ProfileID']
      }
    ]
  });

  return Application;
};
