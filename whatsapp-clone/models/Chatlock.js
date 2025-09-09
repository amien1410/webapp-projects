module.exports = (sequelize, DataTypes) => {
  const Chatlock = sequelize.define("Chatlock", {
    chatlock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    otheruser_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
  });

  return Chatlock;
};
