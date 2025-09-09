const { getMessages } = require("./chatService");
const { getUserById } = require("./userService");
const { processMessageContent } = require("./messageHelper");

const receiveMessage = async (io, socket, data) => {
  try {
    const user_id = socket.handshake.query.user_id;
    const {
      conversation_id,
      user_timezone = "America/Hermosillo",
      page = 1,
      per_page_message = 50,
      message_id = 0, // Provide message_id if you want to fetch all the messages upto that message_id
    } = data;

    if (!conversation_id) {
      socket.emit("messageReceived", { MessageList: [] });
      return;
    }

    const { messages, totalPages, conversationUsers } = await getMessages({
      user_id,
      conversation_id,
      message_id,
      page,
      per_page_message,
    });

    const modifiedDataWithDate = await processMessageContent({
      messages,
      user_id,
      conversationUsers,
      user_timezone,
      conversation_id,
    });

    if (per_page_message == 1) {
      socket.emit("messageReceived", modifiedDataWithDate[1]);
    } else {
      socket.emit("messageReceived", {
        MessageList: modifiedDataWithDate,
        totalPages,
        currentPage: page,
      });
    }
  } catch (error) {
    console.error(error);
    socket.emit("errorMessage", {
      message: "Something went wrong!",
      error,
    });
  }
};

module.exports = { receiveMessage };
