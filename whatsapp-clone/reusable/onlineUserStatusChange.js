const { UserSocket, Conversation, ConversationsUser } = require("../models");
const { Op } = require("sequelize");

async function onlineUserStatusChange(io, user_id) {
  // const conversation_idList = await ConversationsUser.findAll({
  //   where: {
  //     user_id: user_id,
  //   },
  //   attributes: ["conversation_id"],
  // });

  // let other_user_ids = [];

  // // Use Promise.all to wait for all async operations to complete
  // await Promise.all(
  //   conversation_idList.map(async (e) => {
  //     e = e.toJSON();
  //     const otherUsers = await ConversationsUser.findAll({
  //       where: {
  //         conversation_id: e.conversation_id,
  //         user_id: {
  //           [Op.ne]: user_id,
  //         },
  //       },
  //       attributes: ["user_id"],
  //     });

  //     // Extract user_ids and append them to other_user_ids
  //     otherUsers.forEach((otherUser) => {
  //       other_user_ids.push(otherUser.user_id);
  //     });

  //     console.log(e, "conversation_idList");
  //   })
  // );

  // function removeDuplicates(arr) {
  //   let unique = [];
  //   arr.forEach((element) => {
  //     if (!unique.includes(element)) {
  //       unique.push(element);
  //     }
  //   });
  //   return unique;
  // }

  // console.log(other_user_ids, "other_user_ids Old");
  // other_user_ids = removeDuplicates(other_user_ids);

  // // Find online users socket id =====================================================================
  // await Promise.all(
  //   other_user_ids.map(async (e) => {
  //     const otherUsers = await UserSocket.findOne({
  //       where: {
  //         user_id: e,
  //       },
  //     });

  //     // this means user is offline ==================================================================================
  //     if (otherUsers == null) {
  //       return;
  //     }

  //     otherUsers = otherUsers.toJSON();

  //     console.log(e, "conversation_idList");
  //   })
  // );

  // console.log(other_user_ids, "other_user_ids");

  // update is_online ==================================================================================
  let connectedUsers = await UserSocket.findAll({
    attributes: ["user_id"],
  });

  // Transform the connectedUsers array
  const formattedUserList = connectedUsers.map((user) => String(user.user_id));
  // Emit the formatted list to the clients
  io.emit("onlineUsers", { onlineUserList: formattedUserList });
}

module.exports = onlineUserStatusChange;
