module.exports = (sequelize, DataTypes) => {
  const ConversationsUser = sequelize.define("ConversationsUser", {
    conversations_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  ConversationsUser.associate = function (models) {
    ConversationsUser.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
    ConversationsUser.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return ConversationsUser;
};
