'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('INTERNSHIP_POSTING', {
      PostingID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      CompanyID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'COMPANY_PROFILE',
          key: 'CompanyID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      Description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Slots: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      RequiredProgram: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      Location: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      ApplicationDeadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      Status: {
        type: Sequelize.ENUM('Active', 'Closed', 'Draft'),
        defaultValue: 'Active',
        allowNull: false
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

    await queryInterface.addIndex('INTERNSHIP_POSTING', ['Status'], {
      name: 'idx_posting_status'
    });
    await queryInterface.addIndex('INTERNSHIP_POSTING', ['RequiredProgram'], {
      name: 'idx_posting_required_program'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('INTERNSHIP_POSTING');
  }
};
