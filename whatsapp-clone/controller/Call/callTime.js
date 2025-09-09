const jwt = require("jsonwebtoken");
const { Chat, Call } = require("../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const callTime = async (req, res) => {
  // CALL THIS API WHEN CALLER CUT THE CALL OR TIME UP LIKE RINGING FOR z
  let { message_id, call_time } = req.body;
  if (!message_id || message_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "message_id field is required" });
  }

  if (!call_time || call_time == "") {
    return res
      .status(400)
      .json({ success: false, message: "call_time field is required" });
  }

  try {
    // authtoken is required
    const authData = jwt.verify(req.authToken, jwtSecretKey);
    const user_id = authData.user_id;

    const updatedRow = await Call.update(
      { call_time: call_time },
      {
        where: {
          message_id: message_id,
        },
      }
    );

    return res.status(200).json({ message: "Success", success: true });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { callTime };
