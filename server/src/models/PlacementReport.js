const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlacementReport = sequelize.define('PlacementReport', {
    ReportID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CoordinatorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USER',
        key: 'UserID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    GeneratedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    ReportData: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    tableName: 'PLACEMENT_REPORT',
    timestamps: true
  });

  return PlacementReport;
};
