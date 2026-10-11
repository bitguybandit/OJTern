const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CompanyProfile = sequelize.define('CompanyProfile', {
    CompanyID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'USER',
        key: 'UserID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    CompanyName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Industry: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    OfficeAddress: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ContactPerson: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ContactEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    VerificationStatus: {
      type: DataTypes.ENUM('Pending', 'Verified', 'Rejected'),
      defaultValue: 'Pending',
      allowNull: false
    }
  }, {
    tableName: 'COMPANY_PROFILE',
    timestamps: true
  });

  return CompanyProfile;
};
