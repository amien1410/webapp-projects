const jwt = require("jsonwebtoken");
const {
  User,
  Chat,
  Block,
  Conversation,
  ConversationsUser,
  AllContact,
  DeleteMessage,
  ClearAllChat,
} = require("../../models");
const { Op } = require("sequelize");

const getOneToOneMedia = async (req, res) => {
  let { message_type, conversation_id } = req.body; // here conversation_id is other user id
  const user_id = req.authData.user_id;

  if (conversation_id == "" || conversation_id == undefined) {
    return res.status(400).json({
      success: false,
      message: "conversation_id parameter is required!",
    });
  }

  try {
    // let userData = user.get();
    let conversationDetails = await Conversation.findOne({
      where: {
        conversation_id,
      },
      attributes: [
        "is_group",
        "group_name",
        "group_profile_image",
        "blocked_by_admin",
        "createdAt",
      ],
      include: [
        {
          model: ConversationsUser,
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
                "bio",
                "createdAt",
              ],
              // where: {
              //   user_id: {
              //     [Op.ne]: user_id,
              //   },
              // },
              // include: [
              //   {
              //     model: AllContact,
              //   },
              // ],
            },
          ],
        },
      ],
      // order: [[Conversation, "updatedAt", "DESC"]], // Ordering by Conversation.updatedAt
    });

    if (!conversationDetails) {
      return res
        .status(400)
        .json({ status: false, message: "Conversation not found" });
    }

    const chatList = [];
    conversationDetails = conversationDetails.toJSON();

    // Conditionally filter out the user_id from ConversationsUsers if is_group is false
    if (!conversationDetails.is_group) {
      conversationDetails.ConversationsUsers =
        conversationDetails.ConversationsUsers.filter(
          (item) => item.User.user_id !== user_id
        );
    }

    conversationDetails.ConversationsUsers = await Promise.all(
      conversationDetails.ConversationsUsers.map(async (item) => {
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

    const clearAllChatRes = await ClearAllChat.findOne({
      where: {
        user_id,
        conversation_id: parseInt(conversation_id),
      },
      order: [["updatedAt", "DESC"]],
    });

    let updatedFiled = {};
    if (clearAllChatRes) {
      updatedFiled.message_id = {
        [Op.gt]: clearAllChatRes.dataValues.message_id,
      };
    }
    // if (message_id != 0 && message_id != undefined) {
    //   updatedFiled.message_id = {
    //     [Op.gt]: message_id,
    //   };
    // }
    // For Media ==================================================================================
    let mediaData = await Chat.findAll({
      where: {
        ...updatedFiled,
        conversation_id,
        message_type: {
          [Op.or]: ["image", "video"],
        },
      },
      attributes: [
        "message_id",
        "video_time",
        "url",
        "thumbnail",
        "message_type",
        "createdAt",
        "senderId",
        "delete_from_everyone",
        "delete_for_me",
      ],
      order: [
        ["message_id", "DESC"], // Order by message_id in descending order
      ],
    });

    // Filter out messages that exist in DeleteMessage
    let filteredMediaData = [];
    for (let item of mediaData) {
      const isDeleted = await DeleteMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.message_id,
        },
      });

      // Get the current value of delete_for_me and split it into an array
      let currentDeleteForMe = item.delete_for_me || "";
      let user_id_list = currentDeleteForMe
        ? currentDeleteForMe.split(",")
        : [];

      if (
        !isDeleted &&
        !user_id_list.includes(String(user_id)) &&
        !item.delete_from_everyone
      ) {
        filteredMediaData.push(item);
      }
    }

    mediaData = filteredMediaData;

    // For documents ==================================================================================
    let documentData = await Chat.findAll({
      where: {
        ...updatedFiled,
        conversation_id,
        message_type: {
          [Op.or]: ["document"],
        },
      },
      attributes: [
        "message_id",
        "url",
        "message_type",
        "createdAt",
        "senderId",
        "delete_from_everyone",
        "delete_for_me",
      ],
      order: [
        ["message_id", "DESC"], // Order by message_id in descending order
      ],
    });

    // Filter out messages that exist in DeleteMessage
    let filteredDocumentData = [];

    for (let item of documentData) {
      const isDeleted = await DeleteMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.message_id,
        },
      });

      // Get the current value of delete_for_me and split it into an array
      let currentDeleteForMe = item.delete_for_me || "";
      let user_id_list = currentDeleteForMe
        ? currentDeleteForMe.split(",")
        : [];

      if (
        !isDeleted &&
        !user_id_list.includes(String(user_id)) &&
        !item.delete_from_everyone
      ) {
        filteredDocumentData.push(item);
      }
    }

    documentData = filteredDocumentData;

    // For Links ==================================================================================
    let linkData = await Chat.findAll({
      where: {
        ...updatedFiled,
        conversation_id,
        message_type: {
          [Op.or]: ["link"],
        },
      },
      attributes: [
        "message_id",
        "message",
        "message_type",
        "createdAt",
        "senderId",
        "delete_from_everyone",
        "delete_for_me",
      ],
      order: [
        ["message_id", "DESC"], // Order by message_id in descending order
      ],
    });

    // Filter out messages that exist in DeleteMessage
    let filteredLinkData = [];
    for (let item of linkData) {
      const isDeleted = await DeleteMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.message_id,
        },
      });
      // Get the current value of delete_for_me and split it into an array
      let currentDeleteForMe = item.delete_for_me || "";
      let user_id_list = currentDeleteForMe
        ? currentDeleteForMe.split(",")
        : [];

      if (
        !isDeleted &&
        !user_id_list.includes(String(user_id)) &&
        !item.delete_from_everyone
      ) {
        filteredLinkData.push(item);
      }
    }

    linkData = filteredLinkData;

    return res.status(200).json({
      status: true,
      conversationDetails,
      mediaData,
      documentData,
      linkData,
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

module.exports = { getOneToOneMedia };
