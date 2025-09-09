module.exports = (sequelize, DataTypes) => {
  const ReportType = sequelize.define("ReportType", {
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    report_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    report_details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    report_for: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  ReportType.associate = function (models) {
    ReportType.hasMany(models.ReportedUser, {
      foreignKey: "report_id",
      onDelete: "CASCADE",
    });
  };

  return ReportType;
};
