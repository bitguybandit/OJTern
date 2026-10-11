'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('STUDENT_SKILL', {
      ProfileID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'STUDENT_PROFILE',
          key: 'ProfileID'
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
    await queryInterface.dropTable('STUDENT_SKILL');
  }
};
