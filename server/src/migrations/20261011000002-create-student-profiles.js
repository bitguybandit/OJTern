'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('STUDENT_PROFILE', {
      ProfileID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      UserID: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.STRING(100),
        allowNull: false
      },
      YearLevel: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      Interests: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      PreferredLocation: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      ResumePath: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('STUDENT_PROFILE', ['AcademicProgram'], {
      name: 'idx_student_profile_academic_program'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('STUDENT_PROFILE');
  }
};
