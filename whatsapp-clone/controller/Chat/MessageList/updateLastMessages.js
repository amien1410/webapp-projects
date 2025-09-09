const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { User, Chat, Conversation, UserSocket } = require("../../../models");

async function updateLastMessages(io, socket, user_id, otheruser_id) {
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

    console.log(
      "receiverSocketId?.dataValues?.socketId",
      receiverSocketId?.dataValues?.socketId
    );
    if (receiverSocketId?.dataValues?.socketId) {
      // Emit the message to the sender's socket
      io.to(receiverSocketId.dataValues.socketId).emit("updateRecentMessages", {
        MessageList: modifiedData.reverse(),
      });
    }

    // console.log(resData);
    // return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return socket.emit("errorMessage", {
      message: "Something went wrong!",
      error: error,
    });
  }
}

module.exports = updateLastMessages;
