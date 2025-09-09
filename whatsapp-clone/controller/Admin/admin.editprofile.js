const { Admin, User } = require("../../models");

async function UpdateProfile(req, res) {
    try {
        const { admin_id } = req.authData;
        const profile_pic = req.files;
        const { fullName, email } = req.body;

        // Construct the update payload dynamically
        const updateUserPayload = {
            first_name: fullName,
        };
        const updatePayload = {
            admin_email: email,
            admin_name: fullName,
        };
        if (profile_pic.length > 0) {
            updatePayload.profile_pic = profile_pic[0].path;
            updateUserPayload.profile_image = profile_pic[0].path;
        }

        const [affectedCount, affectedRows] = await Admin.update(updatePayload, {
            where: { admin_id },
        });

        const [affectedCountProfile, affectedRowsProfile] = await User.update(updateUserPayload, {
            where: { user_id: 1 },
        });

        if (affectedCount > 0 && affectedCountProfile > 0) {
            const isAdmin = await Admin.findOne({
                where: { admin_id },
                attributes: { exclude: ['admin_password'] },
            });
            res.status(200).json({ success: "true", message: "Profile Updated Successfully", isAdmin });
        } else {
            res.status(200).json({ success: "false", message: "Invalid Credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in Updating Profile" });
    }
}

module.exports = { UpdateProfile };
