const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InternshipPosting = sequelize.define('InternshipPosting', {
    PostingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CompanyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'COMPANY_PROFILE',
        key: 'CompanyID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Slots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    RequiredProgram: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Location: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ApplicationDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Status: {
      type: DataTypes.ENUM('Active', 'Closed', 'Draft'),
      defaultValue: 'Active',
      allowNull: false
    }
  }, {
    tableName: 'INTERNSHIP_POSTING',
    timestamps: true,
    indexes: [
      {
        fields: ['Status']
      },
      {
        fields: ['RequiredProgram']
      }
    ]
  });

  return InternshipPosting;
};
