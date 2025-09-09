const jwt = require("jsonwebtoken");
const {
  User,
  Chat,
  Block,
  Conversation,
  ConversationsUser,
  AllContact,
} = require("../../../models");
const { Op } = require("sequelize");

const getGroupMembers = async (req, res) => {
  let { message_type, conversation_id } = req.body; // here conversation_id is other user id
  const user_id = req.authData.user_id;
  // console.log(message_type);

  if (conversation_id == "" || conversation_id == undefined) {
    return res.status(400).json({
      success: false,
      message: "conversation_id parameter is required!",
    });
  }

  try {
    let ConversationsUserList = await ConversationsUser.findAll({
      where: {
        conversation_id,
      },
      attributes: ["is_admin", "conversations_user_id", "createdAt"],
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "phone_number",
            "country_code",
            "profile_image",
            "country",
            "user_name",
            "first_name",
            "last_name",
          ],
        },
      ],
    });

    if (ConversationsUserList.length == 0) {
      return res
        .status(400)
        .json({ status: false, message: "Conversation not found" });
    }

    ConversationsUserList = await Promise.all(
      ConversationsUserList.map(async (item) => {
        item = item.toJSON();

        let userDetails = await AllContact.findOne({
          where: {
            phone_number: item.User.phone_number,
            user_id,
          },
          attributes: ["full_name"],
        });

        return {
          ...item,
          User: {
            ...item.User,
            user_name:
              userDetails?.full_name ||
              `${item.User?.first_name} ${item.User?.last_name}`,
          },
        };
      })
    );

    return res.status(200).json({
      status: true,
      ConversationsUserList,
      // is_block: isBlocked == null ? false : true,
      // is_chat_lock: chatLockData == null ? false : true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Usage:
// const user_id = 1; // Replace with the desired user_id
// const conversations = await getAllConversationsForUser(user_id);
// console.log(conversations);

module.exports = { getGroupMembers };
