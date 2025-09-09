const {
  User,
  Chat,
  ClearAllChat,
  Block,
  Chatlock,
  Conversation,
  ConversationsUser,
  AllContact,
  Archive,
  DeletedChatList,
} = require("../../../models");
const { Op } = require("sequelize");

const ChatList = async (io, socket, data) => {
  const user_id = socket.handshake.query.user_id;

  try {
    // Fetch user conversations
    const userConversations = await ConversationsUser.findAll({
      where: { user_id: user_id },
      include: [{ model: Conversation }],
      order: [[Conversation, "updatedAt", "DESC"]],
    });

    const chatList = [];

    for (const conversationUser of userConversations) {
      const conversation = conversationUser.Conversation;
      const isBlocked = await Block.findOne({
        where: {
          user_id: user_id,
          conversation_id: conversation.conversation_id,
        },
      });

      const clearAllChatRes = await ClearAllChat.findOne({
        where: {
          user_id,
          conversation_id: conversation.conversation_id,
        },
        order: [["updatedAt", "DESC"]],
      });
      var findLastMessage;
      let unread_count = 0;

      if (isBlocked) {
        findLastMessage = await Chat.findOne({
          where: {
            message_id: isBlocked.message_id_before_block,
          },
          // attributes: ["message_id"],
          order: [["message_id", "DESC"]],
          limit: 1,
        });
      } else {
        findLastMessage = await Chat.findOne({
          where: {
            conversation_id: conversation.conversation_id,
          },
          // attributes: ["message_id"],
          order: [["message_id", "DESC"]],
          limit: 1,
        });

        let unread_messages = await Chat.findAll({
          where: {
            message_read: 0,
            conversation_id: conversation.conversation_id,
          },
          attributes: ["who_seen_the_message"],
          order: [["message_id", "DESC"]],
        });

        unread_messages.forEach((message) => {
          const seenUsers = message.who_seen_the_message.split(","); // Split by comma
          if (!seenUsers.includes(String(user_id))) {
            unread_count++;
          }
        });
      }

      let last_message =
        String(clearAllChatRes?.message_id) ==
        String(conversation.last_message_id)
          ? ""
          : conversation.last_message_type == "delete_from_everyone"
          ? conversation.last_message
          : findLastMessage?.dataValues?.delete_for_me
              .split(",")
              .includes(String(user_id))
          ? "🚫 You deleted this message!"
          : isBlocked
          ? findLastMessage?.dataValues?.message
          : conversation.last_message;

      let last_message_type =
        String(clearAllChatRes?.message_id) ==
        String(conversation.last_message_id)
          ? ""
          : conversation.last_message_type == "delete_from_everyone"
          ? "text"
          : findLastMessage?.dataValues?.delete_for_me
              .split(",")
              .includes(String(user_id))
          ? "text"
          : isBlocked
          ? findLastMessage?.dataValues?.message_type
          : conversation.last_message_type;

      let chatDetail = {
        conversation_id: conversation.conversation_id,
        is_group: conversation.is_group,
        group_name: conversation.group_name,
        group_profile_image: conversation.group_profile_image,
        last_message,
        // last_message_type: conversation.last_message_type,
        last_message_type: last_message_type,
        // String(clearAllChatRes?.message_id) ==
        // String(conversation.last_message_id)
        //   ? "text"
        //   : conversation.last_message_type,
        user_id: 0,
        user_name: "",
        phone_number: "",
        profile_image: "",
        is_block: isBlocked != null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        unread_count,
        public_group: conversation.public_group,
      };

      if (!conversation.is_group) {
        const otherUser = await ConversationsUser.findOne({
          where: {
            conversation_id: conversation.conversation_id,
            user_id: { [Op.ne]: user_id },
          },
          include: [{ model: User }],
        });

        if (otherUser) {
          let userDetails = await AllContact.findOne({
            where: { phone_number: otherUser.User.phone_number, user_id },
            attributes: ["full_name"],
          });

          chatDetail = {
            ...chatDetail,
            user_id: otherUser.user_id,
            user_name:
              userDetails?.full_name ||
              `${otherUser.User.first_name} ${otherUser.User.last_name}`,
            profile_image: otherUser.User.profile_image,
            phone_number: otherUser.User.phone_number,
            unread_count,
          };
        }
      }

      chatList.push(chatDetail);
    }

    const newChatList = [];
    const archiveList = [];

    for (const chat of chatList) {
      const isArchived = await Archive.findOne({
        where: { user_id: user_id, conversation_id: chat.conversation_id },
      });

      const isDeleted = await DeletedChatList.findOne({
        where: { user_id: user_id, conversation_id: chat.conversation_id },
      });

      if (isDeleted) {
        continue;
      }

      if (isArchived) {
        archiveList.push(chat);
      } else {
        newChatList.push(chat);
      }
    }

    socket.emit("ChatList", { chatList: newChatList });
    socket.emit("ArchiveList", { archiveList: archiveList });
  } catch (error) {
    console.error(error);
    socket.emit("errorMessage", {
      message: "Failed to retrieve conversations!",
      error: error,
    });
  }
};

module.exports = {
  ChatList,
};
