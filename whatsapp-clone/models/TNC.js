module.exports = (sequelize, DataTypes) => {
  const TNC = sequelize.define("TNC", {
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

  return TNC;
};
