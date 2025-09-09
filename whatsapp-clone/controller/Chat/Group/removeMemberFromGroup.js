const jwt = require("jsonwebtoken");
const { Chat, ConversationsUser } = require("../../../models");
const { Op, where } = require("sequelize");
const EmitDataInGroup = require("./EmitDataInGroup");

const removeMemberFromGroup = async (req, res) => {
  const user_id = req.authData.user_id;
  let { remove_user_id, conversation_id } = req.body;

  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }
  if (!remove_user_id || remove_user_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "remove_user_id field is required" });
  }

  try {
    // First check user is admin or not ==================================================================================
    let isAdmin = await ConversationsUser.findOne({
      where: {
        conversation_id,
        user_id,
        is_admin: true,
      },
    });
    if (!isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Only group admin can remove member from group!",
      });
    }

    // Now Add user to conversation ======================================================
    let userAdded = await ConversationsUser.destroy({
      where: {
        conversation_id,
        user_id: remove_user_id,
      },
    });

    const newMessage = await Chat.create({
      message: user_id,
      message_type: "member_removed",
      senderId: remove_user_id,
      conversation_id,
    });

    // Emit one event to notify the member is removed from group
    await EmitDataInGroup(conversation_id, "update_data", {
      conversation_id: conversation_id,
      delete_from_everyone_id: [],
    });

    return res.status(200).json({
      success: true,
      message: "User removed from group",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { removeMemberFromGroup };
