const { StarMessage } = require("../../../models");
const { Op } = require("sequelize");

const addToStarMessage = async (req, res) => {
  let { message_id, remove_from_star, conversation_id } = req.body;
  const user_id = req.authData.user_id;

  if (!message_id || message_id?.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "message_id field is required" });
  }
  if (
    (remove_from_star == "false" || !remove_from_star) &&
    (!conversation_id || conversation_id == "")
  ) {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  // Create an array of message IDs by splitting the string by commas
  const messageIds = message_id.split(",").map((id) => id.trim());

  try {
    let message = "";
    if (remove_from_star === "true") {
      // Remove messages from StarMessage based on the array of message IDs
      await StarMessage.destroy({
        where: {
          user_id: user_id,
          message_id: {
            [Op.in]: messageIds,
          },
        },
      });
      message = "Messages Removed from Star";
    } else {
      // Add each message to StarMessage
      const starMessages = messageIds.map((id) => ({
        user_id: user_id,
        message_id: id,
        conversation_id: conversation_id,
      }));
      await StarMessage.bulkCreate(starMessages);
      message = "Messages Added to Star";
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

module.exports = { addToStarMessage };
