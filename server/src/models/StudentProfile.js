const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentProfile = sequelize.define('StudentProfile', {
    ProfileID: {
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
    AcademicProgram: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    YearLevel: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Interests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PreferredLocation: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ResumePath: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'STUDENT_PROFILE',
    timestamps: true,
    indexes: [
      {
        fields: ['AcademicProgram']
      }
    ]
  });

  return StudentProfile;
};
