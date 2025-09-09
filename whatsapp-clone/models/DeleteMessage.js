module.exports = (sequelize, DataTypes) => {
  const DeleteMessage = sequelize.define("DeleteMessage", {
    deleted_message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  DeleteMessage.associate = function (models) {
    DeleteMessage.belongsTo(models.User, {
      foreignKey: "user_id",
    });

    // For delete Spesific message =====================
    DeleteMessage.belongsTo(models.Chat, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
  };

  return DeleteMessage;
};
