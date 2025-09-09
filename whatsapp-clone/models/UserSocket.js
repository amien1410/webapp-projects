module.exports = (sequelize, DataTypes) => {
  const UserSocket = sequelize.define("UserSocket", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    socketId: {
      type: DataTypes.STRING, // Assuming Socket.IO socket IDs are strings
      allowNull: false,
    },
  });

  return UserSocket;
};
