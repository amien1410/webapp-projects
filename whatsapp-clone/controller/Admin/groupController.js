const { Op, Sequelize } = require("sequelize"); // Ensure Sequelize is imported

const {
    Admin,
    ConversationsUser,
    Conversation,
    User,
} = require("../../models");

async function groupList(req, res) {
    try {
        const { admin_id } = req.authData;
        const { page = 1, limit = 10, search } = req.body; // Added search parameter

        // Default to page 1 and 10 items per page

        // Verify if the admin exists
        const admin = await Admin.findOne({ where: { admin_id } });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Admin" });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build where clause for search
        const whereClause = { is_group: true };

        if (search) {
            whereClause.group_name = {
                [Op.like]: `%${search}%`, // Use LIKE for partial matches
            };
        }

        // Fetch the total count of groups based on search criteria

        const { count } = await Conversation.findAndCountAll({
            where: whereClause,
        });


        // Fetch the groups and their participants with pagination
        const { rows: groupsData } = await Conversation.findAndCountAll({
            where: whereClause,
            include: {
                model: ConversationsUser,
                include: {
                    model: User,
                    attributes: [
                        "user_id",
                        "first_name",
                        "last_name",
                        "user_name",
                        "profile_image",
                        "phone_number",
                        "country",
                        "bio",
                        "gender",

                        "last_seen",
                    ],
                },
            },
            attributes: [
                "conversation_id",
                "group_name",
                "group_profile_image",
                "createdAt",
            ], // Include createdAt here
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit), // Limit number of results
            offset: offset, // Skip this many results
        });


        // Format the data
        const groups = groupsData.map((group) => {
            const users = group.ConversationsUsers.map((cu) => ({
                is_admin: cu.is_admin,
                ...cu.User.dataValues,
            }));

            const adminUsers = users.filter((user) => user.is_admin);
            const regularUsers = users.filter((user) => !user.is_admin);


            return {
                groupname: group.group_name,
                Groupid: group.conversation_id,
                GroupProfile: group.group_profile_image,
                CreatedAt: group.createdAt, // Add createdAt here
                GroupTotalUsersCount: users.length,
                UsersInGroup: {
                    Admins: adminUsers,

                    Users: regularUsers,
                },
            };
        });

        if (groups.length > 0) {

            res.status(200).json({
                success: true,
                message: "Groups found",
                totalGroups: count, // Total number of groups
                totalPages: Math.ceil(count / limit), // Total pages available
                currentPage: parseInt(page), // Current page number

                groups,
            });
        } else {
            res.status(200).json({ success: false, message: "No groups found" });

        }
    } catch (err) {
        console.error(err);

        res
            .status(500)

            .json({ success: false, message: "Error in getting group list" });
    }

}

async function getYearlyNewGroupsCount(req, res) {
    try {
        // Get the year from query parameters or default to the current year
        const year = parseInt(req.body.year) || new Date().getFullYear();

        // Define the start and end of the year
        const startOfYear = new Date(year, 0, 1); // January 1st
        const endOfYear = new Date(year, 11, 31); // December 31st

        // Fetch the count of groups created each month of the specified year
        const yearlyGroupCounts = await Conversation.findAll({
            attributes: [
                [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Extract month from createdAt
                [Sequelize.fn("COUNT", Sequelize.col("conversation_id")), "groupCount"], // Count number of groups
            ],
            where: {
                is_group: true,
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear],
                },
            },
            group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))], // Group by month
            order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]], // Order by month
        });

        // Format the data for the response
        const monthsInYear = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const monthlyCounts = monthsInYear.map((month, index) => {
            const monthIndex = index + 1; // Sequelize month index starts from 1
            const count =
                yearlyGroupCounts.find((item) => item.dataValues.month === monthIndex)
                    ?.dataValues.groupCount || 0;
            return { month, count };
        });

        res.status(200).json({
            success: true,
            message: "Yearly new group counts by month",
            year, // Add year to the response
            yearlyGroupCounts: monthlyCounts,
        });
    } catch (err) {
        console.error("Error fetching yearly new group counts:", err);
        res.status(500).json({ error: "Error in getting yearly new groups count" });
    }
}

async function UserListFromGroup(req, res) {
    try {
        const { admin_id } = req.authData;
        const { page = 1, limit = 10, conversation_id } = req.body;

        // Default to page 1 and 10 items per page

        // Verify if the admin exists
        const admin = await Admin.findOne({ where: { admin_id } });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Admin" });
        }

        // Calculate offset for pagination

        // Fetch the total count of groups

        // Fetch the groups and their participants with pagination
        const { rows: userData } = await ConversationsUser.findAndCountAll({
            where: { conversation_id },

            include: {
                model: User,
                attributes: [
                    "user_id",
                    "first_name",
                    "last_name",
                    "user_name",
                    "profile_image",
                    "phone_number",
                    "country",
                    "bio",
                    "gender",
                    "last_seen",
                ],
            },
            order: [["createdAt", "DESC"]],
            // Skip this many results
        });

        if (userData) {
            const updatedUsers = userData.map((user) => {
                const userObj = user.toJSON(); // Convert Sequelize instance to plain object
                return {
                    ...userObj,
                    User: {
                        ...userObj.User,
                        // phone_number: "xxxxxxxxxx", // Mask phone number
                    },
                };
            });

            return res.status(200).json({
                success: true,
                message: "Groups found",
                userData: updatedUsers,
            });
        } else {
            res.status(404).json({ success: false, message: "No Users found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error in getting User List of group ",
        });
    }
}
module.exports = {
    groupList,
    UserListFromGroup,
    getYearlyNewGroupsCount,
};


