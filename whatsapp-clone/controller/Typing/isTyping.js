const { UserSocket, isUserTyping, ConversationsUser } = require("../../models");
const { Op } = require("sequelize");

// Function to handle typing status
const isTyping = async (io, socket, data) => {
  try {
    // Get the user_id from the socket's handshake query
    const user_id = socket.handshake.query.user_id;
    const { conversation_id, is_typing } = data;

    // If conversation_id is missing or undefined, exit the function
    if (!conversation_id) return;

    // Check if there is an existing entry for the user_id and conversation_id combination
    const existingEntry = await isUserTyping.findOne({
      where: {
        user_id,
        conversation_id,
      },
    });

    if (is_typing === 1) {
      if (!existingEntry) {
        // Create a new entry if it doesn't exist
        await isUserTyping.create({
          user_id,
          conversation_id,
          is_typing,
        });
      } else {
        // Update the existing entry
        await existingEntry.update({ is_typing });
      }
    } else if (is_typing === 0) {
      // Delete the entry if is_typing is 0
      if (existingEntry) {
        await existingEntry.destroy();
      }
    }

    // Find other user IDs from ConversationsUser table
    const otherUsers = await ConversationsUser.findAll({
      where: {
        conversation_id,
        user_id: {
          [Op.ne]: user_id, // Exclude the current user
        },
      },
      attributes: ["user_id"], // Only select the user_id attribute
    });

    // Extract unique user IDs
    const other_user_ids = [
      ...new Set(otherUsers.map((otherUser) => otherUser.user_id)),
    ];

    // Emit typing status to other users
    // Emit typing status to other users
    await Promise.all(
      other_user_ids.map(async (other_user_id) => {
        // Find all socket IDs associated with the receiver's user_id
        const receiverSockets = await UserSocket.findAll({
          where: { user_id: other_user_id },
        });

        // If the receiver has any socket IDs
        if (receiverSockets.length > 0) {
          // Find all conversation IDs the other user is part of
          const userConversations = await ConversationsUser.findAll({
            where: { user_id: other_user_id },
            attributes: ["conversation_id"],
          });

          // Extract conversation IDs into an array
          const conversation_ids = userConversations.map(
            (conversation) => conversation.conversation_id
          );

          // Find all users who are typing in any of the other user's conversations
          const typingUsers = await isUserTyping.findAll({
            where: {
              conversation_id: {
                [Op.in]: conversation_ids,
              },
            },
            attributes: ["user_id", "conversation_id"],
          });

          // Emit the 'isTyping' event to all socket IDs associated with the receiver
          receiverSockets.forEach((receiverSocket) => {
            io.to(receiverSocket.dataValues.socketId).emit("isTyping", {
              typingUserList: typingUsers,
            });
          });
        }
      })
    );
  } catch (error) {
    // Log any errors encountered during execution
    console.error("Error handling typing status:", error);
  }
};

module.exports = { isTyping };
