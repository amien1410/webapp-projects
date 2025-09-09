module.exports = (sequelize, DataTypes) => {
  const PinMessage = sequelize.define("PinMessage", {
    pin_message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    duration: {
      type: DataTypes.ENUM("1_day", "7_days", "1_month", "lifetime"),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE, // Stores expiration timestamp
      allowNull: true, // Null for lifetime pins
    },
  });

  PinMessage.associate = function (models) {
    PinMessage.belongsTo(models.User, { foreignKey: "user_id" });
    PinMessage.belongsTo(models.Chat, { foreignKey: "message_id" });
    PinMessage.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
  };

  return PinMessage;
};