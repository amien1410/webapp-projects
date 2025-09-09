module.exports = (sequelize, DataTypes) => {
  const Language_setting = sequelize.define("Language_setting", {
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    English: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Dynamic colums .....
  });

  return Language_setting;
};
