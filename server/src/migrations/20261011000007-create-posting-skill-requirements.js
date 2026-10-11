'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('POSTING_SKILL_REQUIREMENT', {
      PostingID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'INTERNSHIP_POSTING',
          key: 'PostingID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      SkillID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'SKILL',
          key: 'SkillID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('POSTING_SKILL_REQUIREMENT');
  }
};
