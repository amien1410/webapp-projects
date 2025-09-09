module.exports = (sequelize, DataTypes) => {
  const StatusMedia = sequelize.define("StatusMedia", {
    status_media_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // After changes in flow status text will be different for every media so i added it in statusMedia
    status_text: {
      type: DataTypes.TEXT,
      defaultValue: "", // Corrected 'default' to 'defaultValue'
      get() {
        // To Provide full url in array 👇🏼
        const status_text = this.getDataValue("status_text");
        return status_text == null ? "" : status_text;
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        // const raw_urls = this.getDataValue("url").split(",");
        // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
        // return imageUrls != process.env.baseUrl ? imageUrls : [];

        // To Provide full url in array 👇🏼
        const raw_urls = this.getDataValue("url");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl ? imageUrls : "";
      },
    },
  });

  StatusMedia.associate = function (models) {
    StatusMedia.belongsTo(models.Status, {
      foreignKey: "status_id",
      onDelete: "CASCADE",
    });
  };

  return StatusMedia;
};
