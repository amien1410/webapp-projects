const { Admin} = require("../../models");


async function resetPasswordAdmin(req, res) {
    try {
        const { admin_id } = req.authData

        const { oldPassword, newPassword } = req.body


        const [affectedCount, affectedRows] = await Admin.update(
            {admin_password: newPassword},

            { where: {admin_id, admin_password: oldPassword} }
        )
        if (affectedCount > 0) {
            res.status(200).json({ success: "true", message: "Password Updated Sucessfully" })
        }
        else {
            res.status(404).json({ success: "false", message: "Invalid Password" })
        }
    }
    catch (err) {
        console.error(err);
        res.status(501).json({ error: " error in Adding Banner" })
    }
}

module.exports = { resetPasswordAdmin }