const { PinMessage } = require("../../../models");
const { Op } = require("sequelize");

const addToPinMessage = async (req, res) => {
  let { message_id, remove_from_pin, conversation_id, duration } = req.body;
  const user_id = req.authData.user_id;
  console.log(message_id, "message_id");

  if (!message_id) {
    return res
      .status(400)
      .json({ success: false, message: "message_id field is required" });
  }
  if (
    (remove_from_pin == "false" || !remove_from_pin) &&
    (!conversation_id || conversation_id == "")
  ) {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }
  console.log(remove_from_pin,'remove_from_pin');
  
  if (remove_from_pin != "true" && !duration) {
    return res
      .status(400)
      .json({ success: false, message: "duration field is required" });
  }

  let expiresAt = null;

  const now = new Date();
  switch (duration) {
    case "1_day":
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      break;
    case "7_days":
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      break;
    case "1_month":
      expiresAt = new Date(now.setMonth(now.getMonth() + 1)); // 1 month
      break;
    case "lifetime":
      expiresAt = null; // Never expires
      break;
  }

  // Create an array of message IDs by splitting the string by commas
  // this is for multiple message const messageIds = message_id.split(",").map((id) => id.trim());
  const messageIds = [message_id];

  try {
    let message = "";
    if (remove_from_pin == "true") {
      // Remove messages from PinMessage based on the array of message IDs
      await PinMessage.destroy({
        where: {
          user_id: user_id,
          message_id: {
            [Op.in]: messageIds,
          },
        },
      });
      message = "Messages Removed from Pin";
    } else {
      // Add each message to PinMessage
      const pinMessages = messageIds.map((id) => ({
        user_id: user_id,
        message_id: id,
        conversation_id: conversation_id,
        duration,
        expires_at: expiresAt,
      }));
      await PinMessage.bulkCreate(pinMessages);
      message = "Messages Added to Pin";
    }

    return res.status(200).json({
      message: message,
      success: true,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToPinMessage };
