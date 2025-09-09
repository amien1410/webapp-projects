module.exports = (sequelize, DataTypes) => {
  const ReportedUser = sequelize.define("ReportedUser", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  ReportedUser.associate = function (models) {
    ReportedUser.belongsTo(models.User, {
      foreignKey: "reported_user_id",
      as: "Reported_User",
      onDelete: "CASCADE",
    });
    ReportedUser.belongsTo(models.User, {
      foreignKey: "who_report_id",
      as: "Who_Reported",
      onDelete: "CASCADE",
    });
    // ReportedUser.belongsTo(models.Conversation, {
    //   foreignKey: "conversation_id",
    //   onDelete: "CASCADE",
    // });
    // this means which type of report user had given
    ReportedUser.belongsTo(models.ReportType, {
      foreignKey: "report_id",
      onDelete: "CASCADE",
    });
  };

  return ReportedUser;
};
