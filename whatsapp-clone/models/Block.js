module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define("Block", {
    block_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message_id_before_block: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Block.associate = function (models) {
    Block.belongsTo(models.User, {
      foreignKey: "user_id",
    });

    Block.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
  };

  return Block;
};
