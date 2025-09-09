module.exports = (sequelize, DataTypes) => {
  const AppAudios = sequelize.define("AppAudios", {
    audio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    app_audio_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    audio_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return AppAudios;
};
