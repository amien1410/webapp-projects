const { UserSocket, User, ConversationsUser } = require("../../models");
const { Op } = require("sequelize");

// Function to handle last seen list
const userLastSeenList = async (io, socket) => {
  try {
    // Get the user_id from the socket's handshake query
    const user_id = socket.handshake.query.user_id;

    // Find all other user IDs involved in the same conversations as the current user ============================
    const otherUsers = await ConversationsUser.findAll({
      where: {
        user_id: {
          [Op.ne]: user_id, // Exclude the current user
        },
      },
      attributes: ["user_id"], // Only select the user_id attribute
    });

    // Extract unique user IDs from the list of other users ======================================================
    const other_user_ids = [
      ...new Set(otherUsers.map((otherUser) => otherUser.user_id)),
    ];

    // Find the updatedAt time of those users ============================================================
    let lastSeenUserList = await User.findAll({
      attributes: ["user_id", "updatedAt"], // Assuming 'id' is the primary key in User model
      where: {
        user_id: {
          [Op.in]: other_user_ids,
        },
      },
    });

    // Add a dummy user with user_id 0 (if required) ======================================================
    lastSeenUserList.push({
      user_id: 0,
      updatedAt: "2024-06-27T06:27:55.000Z",
    });

    // Emit the last seen information to the current user ============================================================
    socket.emit("userLastSeenList", { lastSeenUserList });

    // Update last seen status in other user devices ============================================================
    await Promise.all(
      other_user_ids.map(async (other_user_id) => {
        // Find the receiver's socket ID based on user_id
        const receiverSocket = await UserSocket.findOne({
          where: { user_id: other_user_id },
        });

        // If the receiver's socket ID is found ======================================================
        if (receiverSocket?.dataValues?.socketId) {
          // Find all user IDs involved in the same conversations as the receiver ======================================================
          const otherUsers = await ConversationsUser.findAll({
            where: {
              user_id: {
                [Op.ne]: other_user_id, // Exclude the receiver user
              },
            },
            attributes: ["user_id"], // Only select the user_id attribute
          });

          // Extract unique user IDs from the list of other users ============================================================
          const receiver_user_ids = [
            ...new Set(otherUsers.map((otherUser) => otherUser.user_id)),
          ];

          // Find the updatedAt time of those users ============================================================
          let receiverLastSeenList = await User.findAll({
            attributes: ["user_id", "updatedAt"],
            where: {
              user_id: {
                [Op.in]: receiver_user_ids,
              },
            },
          });

          // Add a dummy user with user_id 0 (if required) ======================================================
          receiverLastSeenList.push({
            user_id: 0,
            updatedAt: "2024-06-27T06:27:55.000Z",
          });

          // Emit the last seen information to the receiver ============================================================
          io.to(receiverSocket.dataValues.socketId).emit("userLastSeenList", {
            lastSeenUserList: receiverLastSeenList,
          });
        }
      })
    );
  } catch (error) {
    // Log any errors encountered during execution ============================================================
    console.error("Error handling last seen status:", error);
  }
};

module.exports = { userLastSeenList };
