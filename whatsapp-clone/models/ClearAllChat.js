module.exports = (sequelize, DataTypes) => {
  const ClearAllChat = sequelize.define("ClearAllChat", {
    clear_chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  ClearAllChat.associate = function (models) {
    ClearAllChat.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    ClearAllChat.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      onDelete: "CASCADE",
    });
    ClearAllChat.belongsTo(models.Chat, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
  };

  return ClearAllChat;
};
