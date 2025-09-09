const jwt = require("jsonwebtoken");
const {
  User,
  Chat,
  Conversation,
  UserSocket,
  ConversationsUser,
} = require("../../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;
const path = require("path");
const fs = require("fs");

const innerChatScreen = async (io, socket, data) => {
  // -=------------------------------------------- Update message_read ------------------------------------------------------

  // Listen for the "messageReceived" event
  const user_id = socket.handshake.query.user_id;

  const { otheruser_id, conversation_id } = data;

  if (conversation_id == "" || conversation_id == undefined) {
    return;
  }

  //  ================================================================================================================
  // to update message_read status first get the all conversation_users =======================================
  const conversationUsers = await ConversationsUser.findAll({
    where: {
      conversation_id: conversation_id,
    },
  });

  // Check if user_id is not already in who_seen_the_message
  const who_seen_list = item.dataValues.who_seen_the_message
    ? item.dataValues.who_seen_the_message.split(",")
    : [];
  // console.log(who_seen_list.includes(String(user_id)), "who_seen_list");
  if (!who_seen_list.includes(String(user_id))) {
    who_seen_list.push(user_id.toString());
    item.dataValues.who_seen_the_message = who_seen_list.join(",");
    await Chat.update(
      {
        who_seen_the_message: who_seen_list.join(","),
      },
      {
        where: {
          conversation_id: conversation_id,
          message_id: item.dataValues.message_id,
        },
      }
    );

    // Re-fetch the item to get the updated who_seen_the_message field
    const updatedItem = await Chat.findOne({
      where: { message_id: item.dataValues.message_id },
    });
    // const updatedWhoSeenList =
    //   updatedItem.dataValues.who_seen_the_message.split(",");
    // const user_id_list = conversationUsers.map((u) => u.user_id.toString());
    // const allSeen = user_id_list.every((uid) =>
    //   updatedWhoSeenList.includes(uid)
    // );

    const user_id_list = conversationUsers.map((u) => u.user_id.toString());
    const allSeen = user_id_list.every((uid) =>
      who_seen_list.includes(uid.toString())
    );
    // console.log(who_seen_list, "who_seen_list");
    // console.log(user_id_list, "user_id_list");
    // console.log(allSeen, "allSeen");

    if (allSeen) {
      // console.log("inside allSeen condition", item.dataValues.message_id);
      await Chat.update(
        {
          message_read: 1,
        },
        {
          where: {
            message_id: item.dataValues.message_id,
          },
        }
      );
      item.dataValues.message_read = 1;
      await item.save();
    }
  } else {
    // Check if all users in the conversation have seen the message
    const user_id_list = conversationUsers.map((u) => u.user_id.toString());
    // const who_seen_list = item.who_seen_the_message.split(",");
    const allSeen = user_id_list.every((uid) => who_seen_list.includes(uid));

    if (allSeen) {
      item.dataValues.message_read = 1;
      await item.save();
    }
  }

  //  ================================================================================================================

  const updateWhoSeen = await Chat.update(
    {
      who_seen_the_message: user_id,
    },
    {
      where: {
        conversation_id,
      },
    }
  );

  // const updatedRows = await Chat.update(
  //   //update those message which is send by other user to me
  //   { message_read: 2 },
  //   {
  //     where: {
  //       senderId: otheruser_id,
  //       receiverId: user_id,
  //       message_read: {
  //         [Op.or]: [0, 1],
  //       },
  //     },
  //   }
  // );
  // console.log("updateWhoSeen", updateWhoSeen);

  const resData = await Conversation.update(
    { message_read: 2 },
    {
      where: {
        [Op.or]: [
          { user_id: user_id, otheruser_id: otheruser_id },
          { user_id: otheruser_id, otheruser_id: user_id },
        ],
        message_read: {
          [Op.or]: [0, 1],
        },
      },
    }
  );

  if (updatedRows) {
    try {
      const singleChat = await Chat.findAll({
        where: {
          [Op.or]: [
            {
              senderId: user_id,
              receiverId: otheruser_id,
            },
            {
              senderId: otheruser_id,
              receiverId: user_id,
            },
          ],
        },
        order: [
          ["message_id", "DESC"], // Order by message_id in descending order
        ],
        limit: updatedRows[0] < 10 ? 10 : updatedRows[0] < 20 ? 20 : 30, // Limit the result to 1 row
      });

      const modifiedData = await Promise.all(
        singleChat.map(async (item) => {
          const senderId = item.dataValues.senderId;
          // console.log("senderId",item.dataValues.senderId);
          const myMessage = senderId == otheruser_id;

          // Fetch the user data for the sender
          const user = await User.findOne({
            where: { user_id: senderId },
            attributes: ["user_id", "user_name", "profile_image"],
          });

          // Use get() to ensure getters are invoked
          const userData = user.get();

          // console.log(item.dataValues.url);

          // const inputString = item.dataValues.url;
          // const parts = inputString.split("-");
          // const result = parts.slice(1).join("-");
          // item.dataValues.fileName = result;
          if (item.dataValues.message_type == "audio_call") {
            let call_status_array = item.dataValues.message.split(",");
            item.dataValues.missed_call = call_status_array[0];
            item.dataValues.call_accept = call_status_array[1];
            item.dataValues.call_decline = call_status_array[2];
          } else {
            item.dataValues.missed_call = "0";
            item.dataValues.call_accept = "0";
            item.dataValues.call_decline = "0";
          }

          item.dataValues.call_type = "0";
          item.dataValues.UTCformate = false;
          item.dataValues.myMessage = myMessage;
          item.dataValues.User = userData ? userData : null;
          return item;
        })
      );
      //   {
      //     "missed_call": "0",
      //     "call_accept": "0",
      //     "call_decline": "0",
      //     "call_type": "0",
      //     "myMessage": false,
      //     "User": {
      //         "profile_image": "",
      //         "user_id": 0,
      //         "user_name": ""
      //     }
      // }

      // Find the socketId of the receiver and emit the message to them
      const receiverSocketId = await UserSocket.findOne({
        where: { user_id: otheruser_id },
      });

      // console.log("receiverSocketId",receiverSocketId)

      // console.log("receiverSocketId", receiverSocketId?.dataValues?.socketId);
      if (receiverSocketId?.dataValues?.socketId) {
        // Emit the message to the sender's socket
        io.to(receiverSocketId.dataValues.socketId).emit(
          "updateRecentMessages",
          {
            MessageList: modifiedData.reverse(),
          }
        );
      }

      // console.log(resData);
      // return res.status(200).json({ status: true, message: "success" });
    } catch (error) {
      console.error(error);
      return socket.emit("errorMessage", {
        message: "Something went wrong!",
        error: error,
      });
    }
  }
};

// Usage:
// const user_id = 1; // Replace with the desired user_id
// const conversations = await getAllConversationsForUser(user_id);
// console.log(conversations);

module.exports = { innerChatScreen };
