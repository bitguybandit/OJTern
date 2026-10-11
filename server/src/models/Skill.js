const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Skill = sequelize.define('Skill', {
    SkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SkillName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'SKILL',
    timestamps: true
  });

  return Skill;
};
