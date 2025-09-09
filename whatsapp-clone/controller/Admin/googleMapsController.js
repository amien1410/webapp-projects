// to add New app settings 
const { GoogleMap_setting, Admin } = require("../../models");

// Edit AppSettings
async function editGoogleMapsSettings(req, res) {
    try {
        const { admin_id } = req.authData;
        const { setting_id, client_key, server_key, } = req.body;


        if (await Admin.findOne({ where: { admin_id } })) {
            if (await GoogleMap_setting.findOne({ where: { setting_id } })) {
                const [affectedRows] = await GoogleMap_setting.update(
                    { client_key, server_key },
                    { where: { setting_id } }
                  );
                  
                  if (affectedRows > 0) {
                  } else {
                  }
                  

                res.status(200).json({
                    success: true,
                    message: "Settings Edited Successfully",
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: "Setting Not Found",
                });
            }
        }
        else {
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


async function getGoogleMapsSetting(req, res) {
    try {

        const settings = await GoogleMap_setting.findAll();
        res.status(200).json({
            success: true,
            message: "Goggle Maps Setting is",
            settings,

        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in listing Google Maps Settings from Id" });
    }
}


module.exports = {
    editGoogleMapsSettings,
    getGoogleMapsSetting
};