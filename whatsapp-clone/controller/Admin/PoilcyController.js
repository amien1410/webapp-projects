// to add New app settings
const { Admin, PrivacyPolicy, TNC } = require("../../models");

async function getPrivacyPrivacyPolicy(req, res) {
    try {
        let privacy_policy = await PrivacyPolicy.findAll();
        if (privacy_policy.length == 0) {
            await PrivacyPolicy.create({});
            privacy_policy = await PrivacyPolicy.findAll();
        }
        res.status(200).json({
            success: true,
            message: "Privacy Policy is",
            privacy_policy,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting Privacy Policy" });
    }
}
async function getTermsAndConditions(req, res) {
    try {
        let TandCs = await TNC.findAll();
        if (TandCs.length == 0) {
            await TNC.create({});
            TandCs = await TNC.findAll();
        }
        res.status(200).json({
            success: true,
            message: "Terms and Conditions are ",
            TandCs,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting Terms And Condition" });
    }
}
// Edit AppSettings
async function editPrivacyPolicy(req, res) {
    try {
        const { admin_id } = req.authData;
        const { Link, id } = req.body;

        if (await Admin.findOne({ where: { admin_id } })) {
            if (await PrivacyPolicy.findOne({ where: { id } })) {
                const editedAppSetting = await PrivacyPolicy.update(
                    { Link },
                    { where: { id } }
                );

                res.status(200).json({
                    success: true,
                    message: "Privacy Policy Updated Successfully",
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Privacy Policy Not Found",
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
        res.status(500).json({ error: "Error in editing Privacy Policy" });
    }
}
async function editTermsAndCondition(req, res) {
    try {
        const { admin_id } = req.authData;
        const { Link, id } = req.body;

        if (await Admin.findOne({ where: { admin_id } })) {
            if (await TNC.findOne({ where: { id } })) {
                const editedAppSetting = await TNC.update({ Link }, { where: { id } });

                res.status(200).json({
                    success: true,
                    message: "T&C Updated Successfully",
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "T&C  Not Found",
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
        res.status(500).json({ error: "Error in Edit T&C" });
    }
}

module.exports = {
    getPrivacyPrivacyPolicy,
    getTermsAndConditions,
    editPrivacyPolicy,
    editTermsAndCondition,
};
