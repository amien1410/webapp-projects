module.exports = (sequelize, DataTypes) => {
  const Web_Setting = sequelize.define("Website_Setting", {
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    website_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Whoxa Chat",
    },
    website_email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    website_text: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    website_color_primary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    website_color_secondary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    website_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    ios_link: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    copy_right: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Copyright by Whoxa Chat © 2025",
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
      defaultValue: "",
      get() {
        return process.env.baseUrl;
      },
    },
    TWILIO_ACCOUNT_SID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("TWILIO_ACCOUNT_SID");
        return value ? "xxxxxxxxxx" : value; // Mask the SID with 10 'x'
      },
    },
    TWILIO_AUTH_TOKEN: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("TWILIO_AUTH_TOKEN");
        return value ? "xxxxxxxxxx" : value; // Mask the Auth Token with 10 'x'
      },
    },
    TWILIO_FROM_NUMBER: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("TWILIO_FROM_NUMBER");
        return value ? "xxxxxxxxxx" : value; // Mask the Phone Number with 10 'x'
      },
    },
    email_service: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("email_service");
        return value ? "xxxxxxxxxx" : "xxxxxxxxxx"; // Mask the Phone Number with 10 'x'
      },
    },
    smtp_host: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("smtp_host");
        return value ? "xxxxxxxxxx" : "xxxxxxxxxx"; // Mask the Phone Number with 10 'x'
      },
    },
    mail_user: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("mail_user");
        return value ? "xxxxxxxxxx" : "xxxxxxxxxx"; // Mask the Phone Number with 10 'x'
      },
    },
    mail_password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        const value = this.getDataValue("mail_password");
        return value ? "xxxxxxxxxx" : "xxxxxxxxxx"; // Mask the Phone Number with 10 'x'
      },
    },
    JWT_SECRET_KEY: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    website_logo: {
      type: DataTypes.STRING,
      defaultValue: "uploads/others/logo.png",
      get() {
        let rawUrl = this.getDataValue("website_logo");
        let fullUrl = process.env.baseUrl + rawUrl;
        return fullUrl;
      },
    },
    banner_image: {
      type: DataTypes.STRING,
      defaultValue: "uploads/others/Whoxa_Email_template.png",
      get() {
        let rawUrl = this.getDataValue("banner_image");
        let fullUrl = process.env.baseUrl + rawUrl;
        return fullUrl;
      },
    },
    email_title: {
      type: DataTypes.STRING,
      defaultValue: "Otp Verification",
    },
    website_fav_icon: {
      type: DataTypes.STRING,
      defaultValue: "uploads/others/logo.png",
      get() {
        let rawUrl = this.getDataValue("website_fav_icon");
        let fullUrl = process.env.baseUrl + rawUrl;
        return fullUrl;
      },
    },
  });

  return Web_Setting;
};
