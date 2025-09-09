const { ReportedUser, User ,ReportType } = require("../../models");

async function getReportedUserDetail(req, res) {
    try{
        const { page = 1, limit = 10 } = req.body;
        const { user_id} = req.body;
        const offset = (page - 1) * limit;

        if (offset < 0) {
            offset = page * limit;
        }

        const whereClause = {reported_user_id:user_id};
        const UserDetails = await User.findOne(
            {where:{user_id}},
            {exclude: ['device_token', 'one_signal_player_id', 'password', 'otp'] }
        )
        // Fetch reported users with pagination and search
        const { count, rows: allReportedUsers } = await ReportedUser.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "Who_Reported",  // this refers to the user who is reported
                    attributes: { exclude: ['device_token', 'one_signal_player_id', 'password', 'otp'] },
                },
                {
                    model: ReportType,
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });



        res.status(200).json({
            success: true,
            message: "All Users",
            reported_user_details: UserDetails,
            allUsers: allReportedUsers, 
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting Users" });
    }
}

async function getReportedUserReports(req, res) {
    try {
        const { page = 1, limit = 10 } = req.body;
        const { user_id } = req.body;
        const offset = (page - 1) * limit;

        if (offset < 0) {
            offset = page * limit;
        }

        const whereClause = { reported_user_id: user_id };
        const UserDetails = await User.findOne(
            { where: { user_id } },
            { exclude: ['device_token', 'one_signal_player_id', 'password', 'otp'] }
        )
        // Fetch reported users with pagination and search
        const { count, rows: allReportedUsers } = await ReportedUser.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "Who_Reported",  // this refers to the user who is reported
                    attributes: { exclude: ['device_token', 'one_signal_player_id', 'password', 'otp'] },
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        // Add the report count for each reported user


        // Return the response with the modified allUsers array
        res.status(200).json({
            success: true,
            message: "All Users",
            reported_user_details: UserDetails,
            allUsers: allReportedUsers,  // Return the modified list of users with reportCount
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting Users" });
    }
}

module.exports = { getReportedUserDetail, getReportedUserReports };
