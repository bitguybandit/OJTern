'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('USER', {
      UserID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      Name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      PasswordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Role: {
        type: Sequelize.ENUM('Student', 'IndustryPartner', 'OJTCoordinator', 'SchoolAdministrator'),
        allowNull: false
      },
      Status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
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

    await queryInterface.addIndex('USER', ['Email'], {
      name: 'idx_user_email',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('USER');
  }
};
