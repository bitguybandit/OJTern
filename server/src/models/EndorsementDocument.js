const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EndorsementDocument = sequelize.define('EndorsementDocument', {
    DocumentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ApplicationID: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    FilePath: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    FileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UploadDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'ENDORSEMENT_DOCUMENT',
    timestamps: true
  });

  return EndorsementDocument;
};
