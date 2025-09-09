const { ConversationsUser, Chat } = require("../../../../models");
const { markMessageAsRead } = require("./chatService");

// Function to handle message viewed status
const messageViewed = async (io, socket, data) => {
  try {
    // Get the user_id from the socket's handshake query
    const user_id = socket.handshake.query.user_id;
    const { conversation_id, message_id } = data;

    if (!conversation_id || conversation_id == "") {
      return;
    }
    if (!message_id || message_id == "") {
      return;
    }

    const conversationUsers = await ConversationsUser.findAll({
      where: { conversation_id },
    });

    let user_id_list = conversationUsers.map((u) => u.user_id.toString());

    const messageData = await Chat.findOne({
      where: { message_id },
      attributes: ["who_seen_the_message", "message_read"],
    });

    if (!messageData) {
      console.log("\x1b[32m", "Message not found!", "\x1b[0m");
      return;
    }

    // Update who_seen the message ==================================================================================
    let who_seen_list = messageData.dataValues.who_seen_the_message
      ? messageData.dataValues.who_seen_the_message.split(",")
      : [];
    if (
      !messageData.dataValues.message_read &&
      !who_seen_list.includes(String(user_id))
    ) {
      await markMessageAsRead(
        conversation_id,
        message_id,
        user_id_list,
        who_seen_list,
        user_id
      );
    }
  } catch (error) {
    // Log any errors encountered during execution
    console.error("Error handling typing status:", error);
  }
};

module.exports = { messageViewed };
