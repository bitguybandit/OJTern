'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AUDIT_LOG', {
      AuditID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'USER',
          key: 'UserID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Action: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      EntityAffected: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      EntityID: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      OldValue: {
        type: Sequelize.JSON,
        allowNull: true
      },
      NewValue: {
        type: Sequelize.JSON,
        allowNull: true
      },
      Timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    await queryInterface.addIndex('AUDIT_LOG', ['UserID'], {
      name: 'idx_audit_log_user_id'
    });
    await queryInterface.addIndex('AUDIT_LOG', ['Action'], {
      name: 'idx_audit_log_action'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AUDIT_LOG');
  }
};
