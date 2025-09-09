module.exports = (sequelize, DataTypes) => {
  const Call = sequelize.define("Call", {
    call_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    missed_call: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    call_accept: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    call_decline: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    room_id: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    call_time: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    call_type: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  });

  Call.associate = function (models) {
    Call.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
    });
    Call.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return Call;
};
