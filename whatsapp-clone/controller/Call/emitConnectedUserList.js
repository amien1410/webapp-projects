const { User, UserSocket } = require("../../models");
const { Op } = require("sequelize");

async function emitConnectedUserList(room_id, io) {
  let clients = io.sockets.adapter.rooms.get(room_id);

  if (!clients) return; // Exit if no clients are in the room

  clients = Array.from(clients);

  // Find all user_ids based on the socket IDs
  let socketList = await UserSocket.findAll({
    attributes: ["user_id"],
    where: {
      socketId: {
        [Op.in]: clients,
      },
    },
  });

  // Extract user_ids from socketList
  const userIds = socketList.map(
    (socketDetails) => socketDetails.dataValues.user_id
  );

  // Fetch user details from User model based on user_ids
  let users = await User.findAll({
    where: {
      user_id: {
        [Op.in]: userIds,
      },
    },
    attributes: [
      "user_id",
      "user_name",
      "first_name",
      "last_name",
      "profile_image",
    ], // Include the attributes you need
  });

  // Convert users to JSON format
  // users = users.map((user) => user.toJSON());
  // console.log(users, "users =========================================");
  // Emit the connected user list with user details
  io.in(room_id).emit("connected-user-list", { connectedUsers: users });
}

module.exports = emitConnectedUserList;
