module.exports = (sequelize, DataTypes) => {
  const DeletedChatList = sequelize.define("DeletedChatList", {
    deleted_chatlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  DeletedChatList.associate = function (models) {
    DeletedChatList.belongsTo(models.User, {
      foreignKey: "user_id",
    });

    DeletedChatList.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
  };

  return DeletedChatList;
};
