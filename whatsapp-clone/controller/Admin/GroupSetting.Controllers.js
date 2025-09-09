// to add New app settings
const { Group_Setting, Admin } = require("../../models");

async function getGroupSetting(req, res) {
  try {
    const settings = await Group_Setting.findAll();

    if (settings.length == 0) {
      await Group_Setting.create({});
    }
    res.status(200).json({
      success: true,
      message: "Group Setting is",
      settings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting Group Settings" });
  }
}
// Edit AppSettings
async function editGroupSettings(req, res) {
  try {
    const { admin_id } = req.authData;
    const { max_members, setting_id } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      if (await Group_Setting.findOne({ where: { setting_id } })) {
        const editedAppSetting = await Group_Setting.update(
          { max_members },
          { where: { setting_id } }
        );

        res.status(200).json({
          success: true,
          message: "Settings Edited Successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Setting Not Found",
        });
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

module.exports = {
  getGroupSetting,
  editGroupSettings,
};
