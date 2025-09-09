module.exports = (sequelize, DataTypes) => {
  const PollVote = sequelize.define("PollVote", {
    vote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // userId: {
    //   type: DataTypes.INTEGER, // Assuming user ID
    //   allowNull: false,
    // },
  });

  PollVote.associate = (models) => {
    PollVote.belongsTo(models.PollOption, {
      foreignKey: "poll_option_id",
      onDelete: "CASCADE",
    });
    PollVote.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    PollVote.belongsTo(models.Chat, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
  };

  return PollVote;
};
