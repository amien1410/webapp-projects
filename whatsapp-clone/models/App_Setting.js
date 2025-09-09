module.exports = (sequelize, DataTypes) => {
  const App_Setting = sequelize.define("App_Setting", {
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    app_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Whoxa Chat",
    },
    app_email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    app_text: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    app_color_primary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    app_color_secondary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    app_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    ios_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    android_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    tell_a_friend_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    TWILIO_ACCOUNT_SID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    TWILIO_AUTH_TOKEN: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    TWILIO_FROM_NUMBER: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    JWT_SECRET_KEY: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    demo_credentials: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email_auth: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    phone_auth: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    app_logo: {
      type: DataTypes.STRING,
      defaultvalue: "uploads/others/app-logo.png",
      get() {
        let rawUrl = this.getDataValue("app_logo");
        let fullUrl = process.env.baseUrl + rawUrl;
        return fullUrl;
      },
    },
  });

  return App_Setting;
};