const jwt = require("jsonwebtoken");
const { Conversation, Chat, ConversationsUser } = require("../../../models");
const { Op, where } = require("sequelize");
const EmitDataInGroup = require("./EmitDataInGroup");

const addMemberToGroup = async (req, res) => {
  const user_id = req.authData.user_id;
  let { multiple_user_id, conversation_id } = req.body;

  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }
  if (!multiple_user_id || multiple_user_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "multiple_user_id field is required" });
  }

  try {
    let conversationData = await Conversation.findOne({
      where: {
        conversation_id,
      },
    });
    // First check user is admin or not ==================================================================================
    let isAdmin = await ConversationsUser.findOne({
      where: {
        conversation_id,
        user_id,
        is_admin: true,
      },
    });

    if (!conversationData.public_group && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Only group admin can add member to group!",
      });
    }

    // Check is allready in the conversation ==================================================================================
    let user_id_list = multiple_user_id.split(",");

    // Helper function to introduce a delay
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // console.log(user_id_list, "user_id_list");

    for (const single_user_id of user_id_list) {
      // console.log(`Processing user_id: ${single_user_id}, Time: ${Date.now()}`);

      let isInGroup = await ConversationsUser.findOne({
        where: {
          conversation_id,
          user_id: single_user_id,
        },
      });

      if (isInGroup) {
        continue;
        // res.status(200).json({
        //   success: false,
        //   message: "User already in the group",
        // });
      }

      // Add user to conversation
      let userAdded = await ConversationsUser.create({
        conversation_id,
        user_id: single_user_id,
      });
      if (!conversationData.public_group) {
        await Chat.create({
          message: user_id,
          message_type: "member_added",
          senderId: single_user_id,
          conversation_id,
        });

        // Emit update_data event to notify the member is added to group
        await EmitDataInGroup(conversation_id, "update_data", {
          conversation_id: conversation_id,
          delete_from_everyone_id: [],
        });
        // Delay the next iteration to allow the frontend to process the event
        await sleep(500); // 0.5-second delay before processing the next user
      }
    }

    return res.status(200).json({
      success: true,
      message: "User Added to Group",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addMemberToGroup };
