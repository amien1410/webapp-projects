const { Admin, User, Block } = require("../../models");
const { Op } = require('sequelize'); // Import Op from Sequelize

async function ViewUser(req, res) {
    try {
        const { admin_id } = req.authData;
        const { user_ids } = req.body; // Assuming `user_ids` is an array

        if (await Admin.findOne({ where: { admin_id } })) {
            const Viewd = await User.update(
                { viewed_by_admin: true },
                {
                    where: { user_id: { [Op.in]: user_ids } } // Use Sequelize's Op.in to target multiple user_ids
                }
            );

            if (Viewd[0] > 0) { // Check if any rows were updated
                
                return res.status(200).json({ success: true, message: "Users Viewed Successfully" });
            }
            res.status(404).json({ success: false, message: "Problem in Viewing Users" });
        } else {
            res.status(404).json({ success: false, message: "Invalid Admin" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in View" });
    }
}


async function ListUserListNotification(req, res) {
    try {
        const { admin_id } = req.authData;

        // Check if the admin exists
        const adminExists = await Admin.findOne({ where: { admin_id } });

        if (!adminExists) {
            return res.status(404).json({ success: 'false', message: "Invalid Admin" });
        }

        // Fetch notifications
        const notificationsData = await User.findAndCountAll({
            where: { viewed_by_admin: false }, // Uncomment if you need this condition
            limit: 5,
            order: [['createdAt', 'DESC']],  // Orders by `createdAt` in descending order
            attributes: [
                'profile_image',
                'user_id',
                'phone_number',
                'country',
                'first_name',
                'last_name',
                'user_name',
                'gender',
                'viewed_by_admin',
                'createdAt'
            ]
        });

        const { count, rows: Notifications } = notificationsData;

        if (Notifications.length > 0) {
            res.status(200).json({
                success: 'true',
                message: "Notifications Found",
                total_count: count,  // total number of matching notifications (can be greater than 5)
                returned_count: Notifications.length,  // number of notifications returned (will be 5)
                Notifications  // the actual notification records
            });
        } else {
            res.status(200).json({
                success: 'false',
                message: "No Notification Found"
            });
        }

    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in getting notifications" });
    }
}


module.exports = { ViewUser , ListUserListNotification }