'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NOTIFICATION', {
      NotificationID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'USER',
          key: 'UserID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Type: {
        type: Sequelize.ENUM('info', 'success', 'warning', 'error'),
        defaultValue: 'info',
        allowNull: false
      },
      DateSent: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      IsRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      RelatedApplicationID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'APPLICATION',
          key: 'ApplicationID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('NOTIFICATION', ['UserID'], {
      name: 'idx_notification_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NOTIFICATION');
  }
};
