const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentSkill = sequelize.define('StudentSkill', {
    ProfileID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'STUDENT_PROFILE',
        key: 'ProfileID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    SkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'SKILL',
        key: 'SkillID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'STUDENT_SKILL',
    timestamps: false
  });

  return StudentSkill;
};
