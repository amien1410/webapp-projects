const jwt = require("jsonwebtoken");
const {
  Chat,
  Block,
  Conversation,
  ConversationsUser,
} = require("../../models");
const { Op } = require("sequelize");
const checkUserAreInTheConversation = require("../Chat/checkUserAreInTheConversation");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const blockUser = async (req, res) => {
  let { conversation_id, blocked_user_id } = req.body;
  const user_id = req.authData.user_id;
  if (!conversation_id && !blocked_user_id) {
    return res.status(400).json({
      success: false,
      message: "conversation_id or user_id field is required",
    });
  } else if (!conversation_id && user_id) {
    conversation_id = await checkUserAreInTheConversation(
      user_id,
      blocked_user_id
    );
    if (!conversation_id) {
      //this means user wants to create new conversation ===============================================================================================
      let conversationData = await Conversation.create({
        last_message: "",
        last_message_type:"",
      });

      conversation_id = conversationData.toJSON().conversation_id;

      // Now Add user to conversation through conversationuser tabel ======================================================
      await ConversationsUser.create({
        conversation_id,
        user_id: user_id,
      });

      // Now Add other user to conversation through conversationuser tabel ======================================================
      await ConversationsUser.create({
        conversation_id,
        user_id: blocked_user_id,
      });
    }
  }
  try {
    const isBlocked = await Block.findOne({
      where: {
        user_id,
        conversation_id,
      },
    });

    if (isBlocked) {
      // Delete the block row
      await Block.destroy({
        where: {
          user_id,
          conversation_id,
        },
      });

      return res.status(200).json({
        is_block: false,
        success: true,
        message: "User Unblocked successfully",
        // isBlocked: [],
      });
    }
    // else {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Users are not blocked",
    //   });
    // }

    findLastMessage = await Chat.findOne({
      where: {
        conversation_id,
      },
      // attributes: ["message_id"],
      order: [["message_id", "DESC"]],
      limit: 1,
    });

    // Block the user
    await Block.create({
      user_id,
      conversation_id,
      message_id_before_block: findLastMessage?.message_id
        ? findLastMessage?.message_id
        : 0,
    });

    // const blockData = await Block.findOne({
    //   where: {
    //     [Op.or]: [
    //       { userId: authData.user_id, blockedUserId: blockedUserId },
    //       { userId: blockedUserId, blockedUserId: authData.user_id },
    //     ],
    //   },
    // });

    res.status(200).json({
      is_block: true,
      success: true,
      message: "User blocked successfully",
      // isBlocked: blockData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { blockUser };
