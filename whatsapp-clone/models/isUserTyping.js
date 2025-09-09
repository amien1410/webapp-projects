module.exports = (sequelize, DataTypes) => {
  const isUserTyping = sequelize.define("isUserTyping", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    conversation_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    is_typing: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return isUserTyping;
};