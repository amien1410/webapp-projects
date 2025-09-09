let ioInstance;

const emitConnectedUserList = require("../controller/Call/emitConnectedUserList");
const { ChatList } = require("../controller/Chat/ChatList/getChatList");
const {
  messageViewed,
} = require("../controller/Chat/MessageList/receiveMessage/messageViewed");
const {
  receiveMessage,
} = require("../controller/Chat/MessageList/receiveMessage/receiveMessage");
const { isTyping } = require("../controller/Typing/isTyping");
const { userLastSeenList } = require("../controller/Typing/userLastSeenList");
const {
  User,
  isUserTyping,
  Chat,
  Call,
  UserSocket,
  ConversationsUser,
} = require("../models");
const onlineUserStatusChange = require("./onlineUserStatusChange");
const { Op } = require("sequelize");

function initSocket(io) {
  ioInstance = io;

  io.on("connection", async (socket) => {
    // Update the user last_seen
    console.log("New client connected", socket.id);
    const user_id = socket.handshake.query.user_id;

    await User.update(
      { last_seen: 0 }, // Update only the last_seen field
      { where: { user_id: user_id } }
    );

    // Notify other user that new user is online ===================================================
    onlineUserStatusChange(io, user_id);

    // Update user last seen =====================================================
    userLastSeenList(io, socket);

    // Show typing ==================================================================================
    // Find all conversation IDs the other user is part of
    const userConversations = await ConversationsUser.findAll({
      where: { user_id: user_id },
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

    // Emit the 'isTyping' event to the receiver with the list of typing users
    socket.emit("isTyping", {
      typingUserList: typingUsers,
    });

    socket.on("messageReceived", (data) => {
      receiveMessage(io, socket, data);
    });

    socket.on("ChatList", (data) => {
      ChatList(io, socket, data);
    });

    // Typing Events ==================================================================================
    socket.on("isTyping", (data) => {
      isTyping(io, socket, data);
    });

    // messageViewed Events ==================================================================================
    socket.on("messageViewed", (data) => {
      messageViewed(io, socket, data);
    });

    // Call Events ==================================================================================
    socket.on(
      "join-call",
      ({ room_id, peer_id, user_id, call_type, user_name }) => {
        socket.join(room_id);
        console.log("\x1b[32m", "room_id", room_id, "\x1b[0m");
        console.log("\x1b[32m", "peer_id", peer_id, "\x1b[0m");
        console.log("\x1b[32m", "user_name", user_name, "\x1b[0m");
        console.log("\x1b[32m", "user_id", user_id, "\x1b[0m");
        socket
          .to(room_id)
          .emit("user-connected-to-call", { peer_id, user_name, user_id });
        emitConnectedUserList(room_id, io);
        // console.log(call_type, "call_type");
      }
    );

    socket.on("call-changes", (data) => {
      socket.to(data.room_id).emit("call-changes", data);
    });

    socket.on("leave-call", ({ room_id, peer_id, call_type }) => {
      console.log(room_id, peer_id, call_type, "room_id, peer_id, call_type");

      socket.leave(room_id);
      socket.to(room_id).emit("user-disconnected-from-call", peer_id);
      emitConnectedUserList(room_id, io);
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      // console.log(user_id,"User disconnected");

      try {
        // Access the user information from the data sent by the client
        const user_id = socket.handshake.query.user_id;

        let data = await isUserTyping.destroy({
          where: { user_id: user_id }, // Corrected the column names
        });

        // Remove the user/socket association from the database
        let userSocketDeleted = await UserSocket.destroy({
          where: { user_id: user_id, socketId: socket.id },
        });

        // Update the user last_seen
        await User.update(
          { last_seen: 0 }, // Update only the last_seen field
          { where: { user_id: user_id } }
        );

        // Notify other user that user is offline ===================================================
        onlineUserStatusChange(io, user_id);

        // Update user last seen =====================================================
        userLastSeenList(io, socket);
      } catch (error) {
        console.error("Error removing user/socket association:", error);
      }
    });
  });
}

function getIo() {
  if (!ioInstance) {
    throw new Error("IO not initialized");
  }
  return ioInstance;
}

// Create and export a singleton instance
const socketService = {
  initSocket,
  getIo,
};

module.exports = socketService;
