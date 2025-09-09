const { Op } = require("sequelize");
const { ReportedUser, User, UserSocket } = require("../../models");

async function getAllReportedUsers(req, res) {
  try {
    const { page = 1, limit = 10, fullName, phoneNumber } = req.body;

    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = {};

    if (fullName) {
      whereClause.user_name = {
        [Op.like]: `${fullName}%`,
      };
    }

    if (phoneNumber) {
      whereClause.phone_number = {
        [Op.like]: `${phoneNumber}%`,
      };
    }

    // Fetch reported users with pagination and search
    const { count, rows: allReportedUsers } =
      await ReportedUser.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "Reported_User", // this refers to the user who is reported
            attributes: {
              exclude: [
                "device_token",
                "one_signal_player_id",
                "password",
                "otp",
              ],
            },
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

    // Filter out reported users with null Reported_User data
    const filteredReportedUsers = allReportedUsers.filter(
      (reportedUser) => reportedUser.Reported_User !== null
    );

    // Add the report count for each reported user
    const allUsersWithCount = await Promise.all(
      filteredReportedUsers.map(async (reportedUser) => {
        const reportedUserId = reportedUser.Reported_User.user_id;
        // console.log(reportedUserId, "reportedUserId");

        // Count the number of times this user has been reported
        const reportCount = await ReportedUser.count({
          where: { reported_user_id: reportedUserId },
        });

        // Create a shallow copy of the reportedUser to avoid mutating the original object
        const reportedUserNew = { ...reportedUser.toJSON() }; // Convert to JSON to make a shallow copy

        // Add the report count to the copied object
        reportedUserNew.Reported_User.reportCount = reportCount;
        // reportedUserNew.Reported_User.phone_number = "xxxxxxxxxx";

        return reportedUserNew;
      })
    );

    // Return the response with the modified allUsers array
    res.status(200).json({
      success: true,
      message: "All Users",
      allUsers: allUsersWithCount, // Return the modified list of users with reportCount
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting Users" });
  }
}

module.exports = { getAllReportedUsers };
