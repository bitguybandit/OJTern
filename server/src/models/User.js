const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Role: {
      type: DataTypes.ENUM('Student', 'IndustryPartner', 'OJTCoordinator', 'SchoolAdministrator'),
      allowNull: false
    },
    Status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    }
  }, {
    tableName: 'USER',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['Email']
      }
    ]
  });

  return User;
};
