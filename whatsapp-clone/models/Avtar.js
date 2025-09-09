module.exports = (sequelize, DataTypes) => {
  const Avatar = sequelize.define("Avatar", {
    avatar_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    avatar_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    default_avtar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    avtar_Media: {
      type: DataTypes.STRING,
      defaultvalue: " ",
      get() {
        let rawUrl = this.getDataValue("avtar_Media");
        let fullUrl = process.env.baseUrl + rawUrl;
        return fullUrl;
      },
    },
  });
  return Avatar;
};
