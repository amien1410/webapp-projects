// getSocketByUserId.js
const { UserSocket } = require("../models");

const getSocketByUserId = async (io, userId) => {
  // console.log("userId", userId);
  try {
    const userSocket = await UserSocket.findOne({
      where: { user_id: userId },
    });
    // console.log("userSocket", userSocket);

    if (userSocket) {
      const socketId = userSocket.socketId;
      // console.log("socketId", socketId);

      // Check if the socket is connected before accessing it
      if (io.sockets.connected[socketId]) {
        return io.sockets.connected[socketId];
      } else {
        // console.log(`Socket with ID ${socketId} is not connected.`);
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error finding socket by userId:", error);
    return null;
  }
};

module.exports = { getSocketByUserId };
