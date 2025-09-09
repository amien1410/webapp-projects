module.exports = (sequelize, DataTypes) => {
  const GoogleMap_setting = sequelize.define("GoogleMap_setting", {
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    client_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    server_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return GoogleMap_setting;
};