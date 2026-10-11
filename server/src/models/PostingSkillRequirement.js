const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostingSkillRequirement = sequelize.define('PostingSkillRequirement', {
    PostingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'INTERNSHIP_POSTING',
        key: 'PostingID'
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
    tableName: 'POSTING_SKILL_REQUIREMENT',
    timestamps: false
  });

  return PostingSkillRequirement;
};
