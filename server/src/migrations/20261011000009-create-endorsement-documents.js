'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ENDORSEMENT_DOCUMENT', {
      DocumentID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ApplicationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'APPLICATION',
          key: 'ApplicationID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      FileName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      FilePath: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      FileSize: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      UploadDate: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ENDORSEMENT_DOCUMENT');
  }
};
