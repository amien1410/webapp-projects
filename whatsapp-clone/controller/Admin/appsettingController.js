// to add New app settings
const {
  App_Setting,
  Admin,
  One_signal_setting,
  Group_Setting,
} = require("../../models");
const updateEnvVariables = require("../../reusable/updateEnvVariables");

async function checkAppsettingAndCreate() {
  try {
    const isAppSetting = await App_Setting.findOne({
      where: { setting_id: 1 },
    });

    // for group setting ==================================================================================

    const settings = await Group_Setting.findAll();

    if (settings.length == 0) {
      await Group_Setting.create({ max_members: 10 });
    }
    // for group setting ==================================================================================

    if (isAppSetting) {
      return;
    } else {
      await App_Setting.create({
        app_name: "Whoxa",
        app_email: "demo@whoxa.com",
        app_text: "WhoxaText",
        app_color_primary: "#FDC604",
        app_color_secondary: "#FFF9E2",
        app_link: "https://whoxachat.com/",
        ios_link: "https://whoxachat.com/",
        android_link: "https://whoxachat.com/",
        tell_a_friend_link: "https://whoxachat.com/",
        baseUrl: "https://whoxachat.com/",
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
        JWT_SECRET_KEY: "JWT_SECRET_KEY",
        app_logo: "uploads/others/app-logo.png",
      });
    }
  } catch (err) {
    console.log(err);
  }
}
// Edit AppSettings
async function editAppSettings(req, res) {
  try {
    const { admin_id } = req.authData;
    const {
      app_name,
      app_text,
      app_color_primary,
      app_color_secondary,
      setting_id,
      app_email,
      app_link,
      ios_link,
      android_link,
      tell_a_friend_link,
      baseUrl,
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER,
      JWT_SECRET_KEY,
      email_auth,
      phone_auth,
    } = req.body;

    const app_logo = req.files;
    // dynamic payload as per enty
    let payload = {};
    if (app_name) payload.app_name = app_name;
    if (app_email) payload.app_email = app_email;
    if (app_text) payload.app_text = app_text;
    if (app_link) payload.app_link = app_link;
    if (ios_link) payload.ios_link = ios_link;
    if (phone_auth != undefined) payload.phone_auth = phone_auth;
    if (email_auth != undefined) payload.email_auth = email_auth;
    if (android_link) payload.android_link = android_link;
    if (tell_a_friend_link) payload.tell_a_friend_link = tell_a_friend_link;
    if (app_color_primary) payload.app_color_primary = app_color_primary;
    if (app_color_secondary) payload.app_color_secondary = app_color_secondary;
    if (baseUrl) {
      updateEnvVariables({ baseUrl: baseUrl });
      payload.baseUrl = baseUrl;
    }
    if (TWILIO_ACCOUNT_SID) {
      updateEnvVariables({ TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID });
      payload.TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID;
    }
    if (TWILIO_AUTH_TOKEN) {
      updateEnvVariables({ TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN });
      payload.TWILIO_AUTH_TOKEN = TWILIO_AUTH_TOKEN;
    }
    if (TWILIO_FROM_NUMBER) {
      updateEnvVariables({ TWILIO_FROM_NUMBER: TWILIO_FROM_NUMBER });
      payload.TWILIO_FROM_NUMBER = TWILIO_FROM_NUMBER;
    }
    if (JWT_SECRET_KEY) {
      updateEnvVariables({ JWT_SECRET_KEY: JWT_SECRET_KEY });
      payload.JWT_SECRET_KEY = JWT_SECRET_KEY;
    }

    if (app_logo && app_logo.length > 0) payload.app_logo = app_logo[0].path;
    if (await Admin.findOne({ where: { admin_id } })) {
      if (await App_Setting.findOne({ where: { setting_id } })) {
        const editedAppSetting = await App_Setting.update(payload, {
          where: { setting_id },
        });
        return res.status(200).json({
          success: true,
          message: "Settings Edited Successfully",
        });
      } else {
        let appDetails = await App_Setting.create(payload);
        return res.status(200).json({
          success: true,
          message: "Settings Edited Successfully",
        });
        // res.status(404).json({
        //   success: false,
        //   message: "Setting Not Found",
        // });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "You are Unauthorized for This action",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in Edit Settings" });
  }
}

async function getSetting(req, res) {
  try {
    let settings = await App_Setting.findAll();
    if (settings.length == 0) {
      await App_Setting.create({});
      settings = await App_Setting.findAll({
        exclude: {
          TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN,
          TWILIO_FROM_NUMBER,
        },
      });
    }
    try {
      // console.log(req);

      const settings_OneSignal = await One_signal_setting.findAll();
      return res.status(200).json({
        success: true,
        message: "One Signal Setting is",
        settings,
        settings_OneSignal,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error in listing One Signal Settings from Id" });
    }
    return res.status(200).json({
      success: true,
      message: "App Setting is",
      settings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in listing App Settings from Id" });
  }
}
// Delete App Setting

module.exports = {
  editAppSettings,
  getSetting,
  checkAppsettingAndCreate,
};
