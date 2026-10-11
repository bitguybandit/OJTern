'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('APPLICATION', {
      ApplicationID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ProfileID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'STUDENT_PROFILE',
          key: 'ProfileID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      PostingID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'INTERNSHIP_POSTING',
          key: 'PostingID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Status: {
        type: Sequelize.ENUM(
          'Pending',
          'Approved',
          'Rejected',
          'ReturnedForCorrection',
          'Placed',
          'RejectedByPartner'
        ),
        defaultValue: 'Pending',
        allowNull: false
      },
      DateSubmitted: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      DateReviewed: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ReviewedByCoordinatorID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'USER',
          key: 'UserID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      PartnerDecision: {
        type: Sequelize.ENUM('None', 'Accepted', 'Rejected'),
        defaultValue: 'None',
        allowNull: false
      },
      FeedbackComment: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('APPLICATION', ['ProfileID', 'PostingID'], {
      name: 'uq_application_profile_posting',
      unique: true
    });
    await queryInterface.addIndex('APPLICATION', ['Status'], {
      name: 'idx_application_status'
    });
    await queryInterface.addIndex('APPLICATION', ['PostingID'], {
      name: 'idx_application_posting_id'
    });
    await queryInterface.addIndex('APPLICATION', ['ProfileID'], {
      name: 'idx_application_profile_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('APPLICATION');
  }
};
