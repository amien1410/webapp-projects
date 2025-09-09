module.exports = (sequelize, DataTypes) => {
    const Wallpaper = sequelize.define("Wallpaper", {
      wallpaper_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      wallpaper_image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
        get() {
          // const raw_urls = this.getDataValue("profile_image").split(",");
          // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
          // return imageUrls != process.env.baseUrl ? imageUrls : [];
          const raw_urls = this.getDataValue("wallpaper_image");
          const imageUrls = `${process.env.baseUrl}${raw_urls}`;
          return imageUrls != process.env.baseUrl
            ? imageUrls
            : `${process.env.baseUrl}uploads/not-found-images/profile-image.png`;
        },
      },

      wallpaper_title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      wallpaper_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      
      
    });
  
 
    return Wallpaper;
  };
  