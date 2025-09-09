const { Admin, User, Block } = require("../../models");

async function BlockUser(req, res) {
    try {
        const { admin_id } = req.authData;  // Get admin id from the auth data
        const { user_id } = req.body;  // Get the user ID to block from the request body

        // Ensure both admin_id and user_id are integers
        const parsedAdminId = parseInt(admin_id, 10);
        const parsedUserId = parseInt(user_id, 10);

        if (isNaN(parsedAdminId) || isNaN(parsedUserId)) {
            return res.status(400).json({ success: 'false', message: "Invalid ID format" });
        }

        // Check if the admin exists
        const admin = await Admin.findOne({ where: { admin_id: parsedAdminId } });
        if (!admin) {
            return res.status(404).json({ success: 'false', message: "Invalid Admin" });
        }

        // Check if the user exists
        const user = await User.findOne({ where: { user_id: parsedUserId } });
        if (!user) {
            return res.status(404).json({ success: 'false', message: "User Not found" });
        }

        // Check if the user is already blocked
        if (user.Blocked_by_admin) {
            return res.status(200).json({ success: 'false', message: "User is already blocked" });
        }

        // Block the user by updating the Blocked_by_admin field
        await User.update({ Blocked_by_admin: true }, { where: { user_id: parsedUserId } });

        // Record the block action in the Block model
        await Block.create({
            admin_id: parsedAdminId, // The admin who performed the block
            user_id: parsedUserId, // The user who is being blocked
            blocked_at: new Date() // Store the date/time when the user was blocked
        });

        return res.status(200).json({ success: "true", message: "User Blocked Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error in blocking the user" });
    }
}

async function unBlockUser(req, res) {
    try {
        const { admin_id } = req.authData;  // Get admin id from the auth data
        const { user_id } = req.body;  // Get the user ID to unblock from the request body

        // Ensure both admin_id and user_id are integers
        const parsedAdminId = parseInt(admin_id, 10);
        const parsedUserId = parseInt(user_id, 10);

        if (isNaN(parsedAdminId) || isNaN(parsedUserId)) {
            return res.status(400).json({ success: 'false', message: "Invalid ID format" });
        }

        // Check if the admin exists
        const admin = await Admin.findOne({ where: { admin_id: parsedAdminId } });
        if (!admin) {
            return res.status(404).json({ success: 'false', message: "Invalid Admin" });
        }

        // Check if the user exists
        const user = await User.findOne({ where: { user_id: parsedUserId } });
        if (!user) {
            return res.status(404).json({ success: 'false', message: "User Not found" });
        }

        // Check if the user is already unblocked
        if (!user.Blocked_by_admin) {
            return res.status(200).json({ success: 'false', message: "User is Already UnBlocked" });
        }

        // Unblock the user by updating the Blocked_by_admin field
        await User.update({ Blocked_by_admin: false }, { where: { user_id: parsedUserId } });

        return res.status(200).json({ success: "true", message: "User Unblocked Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error in unblocking the user" });
    }
}

module.exports = { BlockUser, unBlockUser };
