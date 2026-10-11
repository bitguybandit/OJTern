'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PLACEMENT_REPORT', {
      ReportID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      CoordinatorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'USER',
          key: 'UserID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Month: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      Year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      GeneratedDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ReportData: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('PLACEMENT_REPORT');
  }
};
