module.exports = (sequelize, DataTypes) => {
  const PrivacyPolicy = sequelize.define("PrivacyPolicy", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Link: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
  });

  return PrivacyPolicy;
};
