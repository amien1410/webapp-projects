module.exports = (sequelize, DataTypes) => {
  const PollOption = sequelize.define("PollOption", {
    poll_option_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    optionText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PollOption.associate = (models) => {
    PollOption.belongsTo(models.Chat, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
    PollOption.hasMany(models.PollVote, {
      foreignKey: "poll_option_id",
      onDelete: "CASCADE",
    });
  };

  return PollOption;
};
