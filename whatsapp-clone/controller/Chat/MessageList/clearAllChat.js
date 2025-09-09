const { ClearAllChat, StarMessage } = require("../../../models");
const checkRequiredFields = require("../../../reusable/checkRequiredFields");

const clearAllChat = async (req, res) => {
  let { message_id, conversation_id } = req.body;
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  // check which field is missing
  const fieldsToCheck = [
    { name: "conversation_id", value: conversation_id },
    { name: "message_id", value: message_id },
  ];

  const missingFieldError = checkRequiredFields(fieldsToCheck, res);

  if (missingFieldError) {
    return missingFieldError;
  }

  try {
    const user_id = req.authData.user_id;

    // Archive the user
    await ClearAllChat.create({
      user_id,
      message_id,
      conversation_id,
    });

    await StarMessage.destroy({
      where: {
        user_id: user_id,
        conversation_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Clear all chat done",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { clearAllChat };
