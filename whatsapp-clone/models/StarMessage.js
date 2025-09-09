module.exports = (sequelize, DataTypes) => {
  const StarMessage = sequelize.define(
    "StarMessage",
    {
      star_message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    { tableName: "star_messages" }
  );

  StarMessage.associate = function (models) {
    StarMessage.belongsTo(models.User, {
      foreignKey: "user_id",
    });
    StarMessage.belongsTo(models.Chat, {
      foreignKey: "message_id",
    });
    StarMessage.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
  };

  return StarMessage;
};
