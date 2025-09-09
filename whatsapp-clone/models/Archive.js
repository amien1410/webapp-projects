module.exports = (sequelize, DataTypes) => {
  const Archive = sequelize.define("Archive", {
    archive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  Archive.associate = function (models) {
    Archive.belongsTo(models.User, {
      foreignKey: "user_id",
    });

    Archive.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
  };

  return Archive;
};
