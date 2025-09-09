module.exports = (sequelize, DataTypes) => {
  const One_signal_setting = sequelize.define("One_signal_setting", {
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ONESIGNAL_APPID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ONESIGNAL_API_KEY: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return One_signal_setting;
};