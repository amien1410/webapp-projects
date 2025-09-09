const jwt = require("jsonwebtoken");
const { ReportedUser } = require("../../models");
const { Op } = require("sequelize");
const { updateFieldIfDefined } = require("../../reusable/updatedFields");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const reportUser = async (req, res) => {
  let { conversation_id, reported_user_id, report_id } = req.body;

  try {
    const user_id = req.authData.user_id;

    // if (!conversation_id || conversation_id == "") {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "conversation_id field is required" });
    // }
    if (!report_id || report_id == "") {
      return res
        .status(400)
        .json({ success: false, message: "report_id field is required" });
    }

    let updatedFiled = {};
    updateFieldIfDefined(updatedFiled, "who_report_id", user_id);
    updateFieldIfDefined(updatedFiled, "reported_user_id", reported_user_id);
    updateFieldIfDefined(updatedFiled, "conversation_id", conversation_id);
    updateFieldIfDefined(updatedFiled, "report_id", report_id);

    const isReported = await ReportedUser.findOne({
      where: updatedFiled,
    });

    if (isReported) {
      return res.status(200).json({
        success: true,
        message: "User Reported successfully",
      });
    }
    // Report the user
    await ReportedUser.create(updatedFiled);

    return res.status(200).json({
      success: true,
      message: "User Reported successfully",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { reportUser };
