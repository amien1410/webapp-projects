const { Op, Sequelize } = require("sequelize"); // Ensure Sequelize is imported
const {
  User,
  Admin,
  Conversation,
  Call,
  ConversationsUser,
  sequelize,
} = require("../../../models");

async function getAllUsersCountWithLastWeek(req, res) {
  try {
    const { admin_id } = req.authData;

    // Check if admin exists
    const adminExists = await Admin.findByPk(admin_id);
    if (!adminExists) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Get the current date and date from one week ago
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Get the total count of users
    const allUsersCount = await User.count(); // Await here to get the count value

    // Get the count of users added in the last week
    const lastWeekUsersCount = await User.count({
      where: {
        createdAt: {
          [Op.between]: [oneWeekAgo, currentDate],
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User counts retrieved successfully",
      allUsersCount: allUsersCount,
      lastWeekUsersCount: lastWeekUsersCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting user counts" });
  }
}
async function getGroupCounts(req, res) {
  try {
    const { admin_id } = req.authData;

    // Check if admin exists
    const adminExists = await Admin.findByPk(admin_id);
    if (!adminExists) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Get the current date and date from one week ago
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Get the total count of users
    const totalGroupcount = await Conversation.count({
      where: { is_group: true },
    });
    // Get the count of users added in the last week
    const lastWeekGroupCount = await Conversation.count({
      where: {
        createdAt: {
          [Op.between]: [oneWeekAgo, currentDate],
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User counts retrieved successfully",
      allGroupCount: totalGroupcount,
      lastWeekGroupCount: lastWeekGroupCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting user counts" });
  }
}
async function getAudioCallCounts(req, res) {
  try {
    const { admin_id } = req.authData;

    // Check if admin exists
    const adminExists = await Admin.findByPk(admin_id);
    if (!adminExists) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Get the current date and date from one week ago
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Get the total count of users
    const totalAudioCallcount = await Call.count({
      where: { call_type: "audio_call" },
    });
    // Get the count of users added in the last week
    const lastWeekAudioCallcount = await Call.count({
      where: {
        call_type: "audio_call",
        createdAt: {
          [Op.between]: [oneWeekAgo, currentDate],
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User counts retrieved successfully",
      totalAudioCallcount: totalAudioCallcount,
      lastWeekAudioCallcount: lastWeekAudioCallcount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting user counts" });
  }
}
async function getVideoCallCounts(req, res) {
  try {
    const { admin_id } = req.authData;

    // Check if admin exists
    const adminExists = await Admin.findByPk(admin_id);
    if (!adminExists) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Get the current date and date from one week ago
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Get the total count of users
    const totalVideoCallcount = await Call.count({
      where: { call_type: "video_call" },
    });
    // Get the count of users added in the last week
    const lastWeekVideoCallcount = await Call.count({
      where: {
        call_type: "video_call",
        createdAt: {
          [Op.between]: [oneWeekAgo, currentDate],
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User counts retrieved successfully",
      totalVideoCallcount: totalVideoCallcount,
      lastWeekVideoCallcount: lastWeekVideoCallcount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting user counts" });
  }
}
async function getLatest5Users(req, res) {
  try {
    // Fetch the latest 5 users
    const latestUsers = await User.findAll({
      attributes: {
        exclude: ["device_token", "one_signal_player_id", "password", "otp"],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    latestUsers.forEach((element) => {
      // element.phone_number = "xxxxxxxxxx"
    });
    res.status(200).json({
      success: true,
      message: "Latest 5 Users",
      latestUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting the latest users" });
  }
}
async function getLoginTypes(req, res) {
  try {
    // Fetch the latest 5 users
    const emails = await User.count({
      where: {
        email_id: {
          [Op.ne]: "", // Not equal to empty string
        },
      },
    });
    const phone = await User.count({
      where: {
        phone_number: {
          [Op.ne]: "", // Not equal to empty string
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Login typed User",
      result: {
        emails,
        phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting the latest users" });
  }
}
async function getPlatformActivity(req, res) {
  try {
    // Fetch the latest 5 users
    const web = await User.count({
      where: {
        is_web: true,
        is_mobile: false,
      },
    });

    const mobile = await User.count({
      where: {
        is_mobile: true,
        is_web: false,
      },
    });
    const others = await User.count({
      where: {
        is_web: false,
        is_mobile: false,
      },
    });
    const both = await User.count({
      where: {
        is_web: true,
        is_mobile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Platform Activity",
      result: {
        web,
        mobile,
        others,
        both,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting the Platform Activity" });
  }
}

async function getLatest5groups(req, res) {
  try {
    // Fetch the latest 5 groups without pagination
    const groupsData = await Conversation.findAll({
      where: { is_group: true },
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
      order: [["createdAt", "DESC"]], // Order by creation date, latest first
      limit: 5, // Fetch only the latest 5 groups
    });

    // Format the data
    const groups = groupsData.map((group) => {
      const users = group.ConversationsUsers.map((cu) => ({
        is_admin: cu.is_admin,
        ...cu.User.dataValues,
      }));

      return {
        groupname: group.group_name,
        Groupid: group.conversation_id,
        GroupProfile: group.group_profile_image,
        CreatedAt: group.createdAt, // Add createdAt here
        GroupTotalUsersCount: users.length,
      };
    });

    if (groups.length > 0) {
      res.status(200).json({
        success: true,
        message: "Latest groups found",
        groups,
      });
    } else {
      res.status(404).json({ success: false, message: "No groups found" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error in getting latest groups" });
  }
}

async function getWeeklyNewUsersCount(req, res) {
  try {
    // Get the current date and calculate the start and end of the week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6)); // End of the week (Saturday)

    // Fetch the count of users created each day of the current week
    const weeklyUserCounts = await User.findAll({
      attributes: [
        [Sequelize.fn("DAYNAME", Sequelize.col("createdAt")), "dayOfWeek"], // Extract day name from createdAt
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "userCount"], // Count number of users
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      group: [Sequelize.fn("DAYOFWEEK", Sequelize.col("createdAt"))], // Group by day of the week
      order: [[Sequelize.fn("DAYOFWEEK", Sequelize.col("createdAt")), "ASC"]], // Order by day of the week
    });

    // Format the data for the response
    const dailyCounts = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].map((day) => {
      const count =
        weeklyUserCounts.find((item) => item.dataValues.dayOfWeek === day)
          ?.dataValues.userCount || 0;
      return { day, count };
    });

    res.status(200).json({
      success: true,
      message: "Weekly new user counts",
      weeklyUserCounts: dailyCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in getting weekly new users count" });
  }
}
async function getYearlyNewUsersCount(req, res) {
  try {
    // Get the year from query parameters or default to the current year
    const year = parseInt(req.body.year) || new Date().getFullYear();

    // Define the start and end of the year
    const startOfYear = new Date(year, 0, 1); // January 1st
    const endOfYear = new Date(year, 11, 31); // December 31st

    // Fetch the count of users created each month of the specified year
    const yearlyUserCounts = await User.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Extract month from createdAt
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "userCount"], // Count number of users
      ],
      where: {
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
        yearlyUserCounts.find((item) => item.dataValues.month === monthIndex)
          ?.dataValues.userCount || 0;
      return { month, count };
    });

    res.status(200).json({
      success: true,
      message: "Yearly new user counts by month",
      year, // Add year to the response
      yearlyUserCounts: monthlyCounts,
    });
  } catch (err) {
    console.error("Error fetching yearly new user counts:", err);
    res.status(500).json({ error: "Error in getting yearly new users count" });
  }
}

async function getCountrywiseTraffic(req, res) {
  try {
    const { page = 1, pageSize = 5 } = req.body; // Get page and pageSize from request body (default values)

    // Calculate offset based on page and pageSize
    const offset = (page - 1) * pageSize;

    const topCountries = await User.findAll({
      attributes: [
        "country",
        [
          sequelize.fn("MAX", sequelize.col("country_full_name")),
          "country_full_name",
        ], // Get one country_full_name per country
        [sequelize.fn("COUNT", sequelize.col("user_id")), "userCount"],
      ],
      group: ["country"],
      order: [[sequelize.literal("userCount"), "DESC"]],
      limit: pageSize,
      offset: offset || 0,
    });

    // Calculate the total number of distinct countries
    const totalCountries = await User.count({
      distinct: true,
      col: "country",
    });

    // Calculate the total number of users (independent of pagination)
    const totalUsers = await User.count();

    // Format the top countries data
    const topCountriesData = topCountries.map((entry) => ({
      country: entry.country,
      country_full_name: entry.country_full_name,
      userCount: entry.getDataValue("userCount"),
      percentage: (
        (entry.getDataValue("userCount") / totalUsers) *
        100
      ).toFixed(2),
    }));

    // Calculate total number of pages
    const totalPages = Math.ceil(totalCountries / pageSize);

    // Send the response with country data and pagination info
    res.json({
      success: true,
      data: topCountriesData,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalCountries, // Add totalCountries to the pagination info
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching country data",
    });
  }
}

async function getYearlyAudioCallCounts(req, res) {
  try {
    // Get the year from request body or default to the current year
    const year = parseInt(req.body.year) || new Date().getFullYear();

    // Define the start and end of the year
    const startOfYear = new Date(year, 0, 1); // January 1st
    const endOfYear = new Date(year, 11, 31); // December 31st

    // Fetch the count of audio calls made each month of the specified year
    const yearlyAudioCallCounts = await Call.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Extract month from createdAt
        [Sequelize.fn("COUNT", Sequelize.col("call_id")), "callCount"], // Count number of calls
      ],
      where: {
        call_type: "audio_call",
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
        yearlyAudioCallCounts.find(
          (item) => item.dataValues.month === monthIndex
        )?.dataValues.callCount || 0;
      return { month, count };
    });

    res.status(200).json({
      success: true,
      message: "Yearly audio call counts by month",
      year, // Add year to the response
      yearlyAudioCallCounts: monthlyCounts,
    });
  } catch (err) {
    console.error("Error fetching yearly audio call counts:", err);
    res
      .status(500)
      .json({ error: "Error in getting yearly audio call counts" });
  }
}

async function getYearlyVideoCallCounts(req, res) {
  try {
    // Get the year from the request body or default to the current year
    const year = parseInt(req.body.year) || new Date().getFullYear();

    // Define the start and end of the year
    const startOfYear = new Date(year, 0, 1); // January 1st
    const endOfYear = new Date(year, 11, 31); // December 31st

    // Fetch the count of video calls made each month of the specified year
    const yearlyVideoCallCounts = await Call.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Extract month from createdAt
        [Sequelize.fn("COUNT", Sequelize.col("call_id")), "callCount"], // Count number of calls
      ],
      where: {
        call_type: "video_call",
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
        yearlyVideoCallCounts.find(
          (item) => item.dataValues.month === monthIndex
        )?.dataValues.callCount || 0;
      return { month, count };
    });

    res.status(200).json({
      success: true,
      message: "Yearly video call counts by month",
      year, // Add year to the response
      yearlyVideoCallCounts: monthlyCounts,
    });
  } catch (err) {
    console.error("Error fetching yearly video call counts:", err);
    res
      .status(500)
      .json({ error: "Error in getting yearly video call counts" });
  }
}

async function getActiveUsers(req, res) {
  try {
    // Get the year and month from query parameters or default to the current month and year
    const year = parseInt(req.body.year) || new Date().getFullYear();
    const month = parseInt(req.body.month) || new Date().getMonth() + 1; // Months are 0-indexed

    // Define the start and end of the month
    const startOfMonth = new Date(year, month - 1, 1); // Start of the month
    const endOfMonth = new Date(year, month, 0); // End of the month (last day of the month)

    // Reset time to the start of the day
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch the count of users updated each day of the specified month
    const dailyUpdatedUserCounts = await User.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("updatedAt")), "date"], // Extract date from updatedAt
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "userCount"], // Count number of users
      ],
      where: {
        updatedAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      group: [Sequelize.fn("DATE", Sequelize.col("updatedAt"))], // Group by date
      order: [[Sequelize.fn("DATE", Sequelize.col("updatedAt")), "ASC"]], // Order by date
    });

    // Define month names for formatting
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Format the data for the response
    const dailyCounts = [];
    let currentDate = new Date(startOfMonth);
    while (currentDate <= endOfMonth) {
      const dayOfMonth = currentDate.getDate(); // Get day of the month
      const monthIndex = currentDate.getMonth(); // Get month index
      const dateString = `${dayOfMonth}\n${monthNames[monthIndex]}`; // Format as 'day\nMonth'
      const count =
        dailyUpdatedUserCounts.find((item) => {
          const itemDate = new Date(item.dataValues.date);
          return itemDate.getDate() === dayOfMonth;
        })?.dataValues.userCount || 0;
      dailyCounts.push({ date: dateString, count });
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    res.status(200).json({
      success: true,
      message: "Daily updated user counts for the specified month and year",
      year,
      month,
      dailyUpdatedUserCounts: dailyCounts,
    });
  } catch (err) {
    console.error("Error fetching daily updated user counts:", err);
    res
      .status(500)
      .json({ error: "Error in getting daily updated users count" });
  }
}

async function getRecentlyActiveUsers(req, res) {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Get list of active users in the last 30 minutes
    const activeUsers = await User.findAll({
      where: {
        updatedAt: {
          [Op.between]: [thirtyMinutesAgo, now],
        },
      },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email_id",
        "updatedAt",
        "country",
      ],
      order: [["updatedAt", "DESC"]],
    });

    // Get count of active users grouped by country
    const countryCounts = await User.findAll({
      where: {
        updatedAt: {
          [Op.between]: [thirtyMinutesAgo, now],
        },
      },
      attributes: [
        "country",
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "userCount"],
      ],
      group: ["country"],
      order: [[Sequelize.literal("userCount"), "DESC"]],
    });

    // Format country count data
    const countryData = countryCounts.map((item) => ({
      country: item.country,
      count: parseInt(item.dataValues.userCount),
    }));

    res.status(200).json({
      success: true,
      message: "Users active in the last 30 minutes",
      totalActiveUsers: activeUsers.length,
      users: activeUsers,
      activeCountries: countryData,
    });
  } catch (err) {
    console.error("Error fetching recently active users:", err);
    res.status(500).json({ error: "Failed to get active users" });
  }
}

module.exports = {
  getAllUsersCountWithLastWeek,
  getGroupCounts,
  getAudioCallCounts,
  getVideoCallCounts,
  getLatest5Users,
  getLatest5groups,
  getWeeklyNewUsersCount,
  getCountrywiseTraffic,
  getYearlyNewUsersCount,
  getYearlyAudioCallCounts,
  getYearlyVideoCallCounts,
  getActiveUsers,
  getLoginTypes,
  getPlatformActivity,
  getRecentlyActiveUsers,
};
