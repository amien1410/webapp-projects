const { ConversationsUser, UserSocket } = require("../../../models");
// const socketService = require("../../../reusable/socketService");

/**
 * Emit data to all users in a conversation (group or one-to-one) via socket.
 *
 * @param {number} conversation_id - The ID of the conversation (group or single chat).
 * @param {string} event_name - The name of the event to emit.
 * @param {any} data - The data to send to the receivers.
 *
 * @returns {Promise<void>} - A Promise that resolves when the event is sent to all users.
 *
 * This function fetches all users in a conversation, identifies their socket IDs,
 * and emits the provided event with data to each of their sockets.
 */
const EmitDataInGroup = async (conversation_id, event_name, data) => {
  try {
    // To find receiver User Id
    let receiverIdList = [];

    // Fetch users from the conversation
    const ConversationsUserList = await ConversationsUser.findAll({
      where: {
        conversation_id,
      },
    });

    // Collect receiver IDs
    ConversationsUserList.forEach((user) => {
      receiverIdList.push(user.user_id);
    });

    // Notify each receiver
    receiverIdList.forEach(async (receiverId) => {
      // Find the socketId of the receiver
      // const receiverSocket = await UserSocket.findOne({
      //   where: { user_id: receiverId },
      // });
      const receiverSocketIds = await UserSocket.findAll({
        where: { user_id: receiverId },
      });

      // Emit the event to the receiver's socket
      if (receiverSocketIds.length != 0) {
        const socketService = require("../../../reusable/socketService");

        receiverSocketIds.forEach((receiverSocketId) => {
          socketService
            .getIo()
            .to(receiverSocketId.dataValues.socketId)
            .emit(event_name, data);
        });
      }
    });

    // console.log(`Event '${event_name}' sent to users:`, receiverIdList);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = EmitDataInGroup;
