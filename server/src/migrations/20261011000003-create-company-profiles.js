'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('COMPANY_PROFILE', {
      CompanyID: {
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
      CompanyName: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      Industry: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      OfficeAddress: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ContactPerson: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      ContactEmail: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      VerificationStatus: {
        type: Sequelize.ENUM('Pending', 'Verified', 'Rejected'),
        defaultValue: 'Pending',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('COMPANY_PROFILE');
  }
};
