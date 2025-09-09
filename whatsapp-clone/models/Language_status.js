module.exports = (sequelize, DataTypes) => {
  const Language_status = sequelize.define("Language_status", {
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language_alignment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
    default_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
    // Dynamic colums .....
  });

  return Language_status;
};