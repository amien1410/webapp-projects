module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("Admin", {
      admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      admin_email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      admin_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        
      },
      admin_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  
      profile_pic: {
        type: DataTypes.STRING,
        defaultvalue: " ",
        get() {
          let rawUrl = this.getDataValue("profile_pic");
          let fullUrl = process.env.baseUrl + rawUrl;
          return fullUrl;
        },
      },
    });
  
 
  
  
    return Admin;
  };