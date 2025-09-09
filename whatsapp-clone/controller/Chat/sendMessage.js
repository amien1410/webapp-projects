const {
  Chat,
  User,
  Block,
  ConversationsUser,
  Conversation,
  AllContact,
  UserSocket,
  DeletedChatList,
} = require("../../models");
const isLink = require("../../reusable/IsLink");
const { getSocketByUserId } = require("../../reusable/getSocketByUserId");
const { updateFieldIfDefined } = require("../../reusable/updatedFields");
const { Op, where } = require("sequelize");
const { sendChatListOnMessage } = require("./ChatList/sendChatListOnMessage");
const socketService = require("../../reusable/socketService");
const checkUserAreInTheConversation = require("./checkUserAreInTheConversation");
const pushMessageNotification = require("../../reusable/pushMessageNotification");
let mime = require("mime-types");

const sendMessage = async (req, res) => {
  try {
    let {
      phone_number,
      email_id,
      conversation_id,
      message,
      message_type, // image, video, text, location, document, audio, contact, status, gif, video_call, audio_call
      latitude,
      longitude,
      forward_id,
      reply_id,
      shared_contact_name,
      shared_contact_number,
      shared_contact_profile_image,
      status_id,
      video_time,
      audio_time,
      url,
      thumbnail,
      other_user_id,

      // filename,
      // thumbnailName,
      // video_time,
    } = req.body;

    let files = req.files;
    console.log(req.body, "req.body");

    const senderId = req.authData.user_id;

    // Validate required fields
    if (
      (!other_user_id || other_user_id === "") &&
      (!phone_number || phone_number === "") &&
      (!conversation_id || conversation_id === "")
    ) {
      return res.status(400).json({
        status: false,
        message: "phone_number, other_user_id or conversation_id field is required",
      });
    }

    console.log("\x1b[32m", "hello", "\x1b[0m");

    if (!message_type || message_type === "") {
      // Emit an error message to the sender
      return res.status(400).json({
        status: false,
        message: "message_type field is required",
      });
    }

    // check if the user has block other user or Conversation ====================================================
    // const isBlocked = await Block.findOne({
    //   where: {
    //     user_id: senderId,
    //     conversation_id,
    //   },
    // });

    // if (isBlocked) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "You Blocked this User",
    //   });
    // }

    let updateFields = {};

    // Insert into updateFields
    updateFields.senderId = senderId;
    // updateFields.receiverId = receiverId;
    isLinkTrue = isLink(message);
    if (isLinkTrue && message_type == "text") {
      message_type = "link";
    }

    if (files && files?.length != 0) {
      files.map((file) => {
        if (message_type == "video") {
          // for video only

          let filemimeType = mime.lookup(file.originalname);

          if (filemimeType.includes("image")) {
            updateFields.thumbnail = file.path;
          } else {
            updateFields.url = file.path;
          }
        } else {
          // for other files
          updateFields.url = file.path;
        }
      });
    }

    // if url is provided
    if (forward_id != undefined && forward_id != "") {
      updateFields.url = url.replaceAll(process.env.baseUrl, "");

      if (message_type == "video") {
        updateFields.thumbnail = thumbnail.replaceAll(process.env.baseUrl, "");
      }
    }

    updateFieldIfDefined(updateFields, "message_type", message_type);
    updateFieldIfDefined(updateFields, "forward_id", forward_id);
    updateFieldIfDefined(updateFields, "reply_id", reply_id);
    updateFieldIfDefined(updateFields, "message", message);
    updateFieldIfDefined(updateFields, "latitude", latitude);
    updateFieldIfDefined(updateFields, "longitude", longitude);
    updateFieldIfDefined(updateFields, "status_id", status_id);
    updateFieldIfDefined(updateFields, "audio_time", audio_time);
    updateFieldIfDefined(updateFields, "video_time", video_time);

    updateFieldIfDefined(
      updateFields,
      "shared_contact_name",
      shared_contact_name
    );
    updateFieldIfDefined(
      updateFields,
      "shared_contact_number",
      shared_contact_number
    );
    updateFieldIfDefined(
      updateFields,
      "shared_contact_profile_image",
      shared_contact_profile_image
    );

    // if (req.files && url.length != 0) {
    //   updateFields.url = url[0].path;
    // }

    // -------------------------------------------- Create or update the conversation ---------------------------------------------------- //
    console.log(conversation_id, "conversation_id");

    let conversationData;
    if (!conversation_id || conversation_id === "") {
      // Find Recevier user_id by phone_number ================================================================
      let receiverId;
      if (other_user_id) {
        receiverId = other_user_id;
      } else {
        let receiverUser = await User.findOne({
          where: {
            phone_number,
          },
        });
        receiverId = receiverUser.toJSON().user_id;
      }

      conversation_id = await checkUserAreInTheConversation(
        senderId,
        receiverId
      );
      console.log(conversation_id, "conversation_id");

      if (conversation_id) {
        updateFields.conversation_id = conversation_id;
      } else {
        //this means user wants to create new conversation ===============================================================================================
        conversationData = await Conversation.create({
          last_message: message,
          last_message_type: message_type,
        });

        conversation_id = conversationData.toJSON().conversation_id;
        console.log(conversation_id, "conversation_id below");

        // Now Add Sender user to conversation through conversationuser tabel ======================================================
        let senderAdded = await ConversationsUser.create({
          conversation_id,
          user_id: senderId,
        });

        // Now Add Recevier user to conversation through conversationuser tabel ======================================================
        let receiverAdded = await ConversationsUser.create({
          conversation_id,
          user_id: receiverId,
        });

        // Set New Conversation Id to add it to chats table
        updateFields.conversation_id = conversation_id;
      }
    } else {
      // let conversationData = await Conversation.update(
      //   {
      //     last_message: message,
      //     last_message_type: message_type,
      //   },
      //   {
      //     where: {
      //       conversation_id,
      //     },
      //   }
      // );
      // Set Conversation Id to add it to chats table
      updateFields.conversation_id = conversation_id;
    }

    // return res.send("Hello Send");
    // -------------------------------------------- Create the Chat ---------------------------------------------------- //
    const newMessage = await Chat.create(updateFields);

    let conversationUpdateData = await Conversation.update(
      {
        last_message: message,
        last_message_type: message_type,
        last_message_id: newMessage.dataValues.message_id,
      },
      {
        where: {
          conversation_id,
        },
      }
    );

    // -------------------------------------------- Update who_seen_the_message for sender ---------------------------------------------------- //

    await Chat.update(
      {
        who_seen_the_message: senderId,
      },
      {
        where: {
          message_id: newMessage.dataValues.message_id,
        },
      }
    );

    // Emit the message to the sender
    // socket.emit("messageSent", newMessage);

    // To find receiver User Id  ==================================================================================
    let receiverIdList = []; // ReciverId is array because i have used the same logic for single to single chat and group chat that's why
    let ConversationsUserList = await ConversationsUser.findAll({
      where: {
        conversation_id,
      },
    });

    ConversationsUserList.map((user) => {
      user = user.toJSON();
      // Exclue sender user ==================================================================================
      if (user.user_id !== senderId) {
        receiverIdList.push(user.user_id);
      }
    });
    // return res.send(receiverIdList);

    let responseSent = false;
    let newConversationData = await Conversation.findOne({
      where: { conversation_id },
    });

    let singleChat = await Chat.findOne({
      where: {
        conversation_id,
      },
      order: [
        ["message_id", "DESC"], // Order by message_id in descending order
      ],
      limit: 1, // Limit the result to 1 row to see latest message
    });

    // const receiverIdListPromis = await Promise.all(
    receiverIdList.map(async (receiverId) => {
      // Check If the receiver has block this conversation or not ================================================================
      const isBlocked = await Block.findOne({
        where: {
          user_id: receiverId,
          conversation_id,
        },
      });

      // if (isBlocked) {
      //   res.status(200).json(singleChat);
      //   responseSent = true;
      //   return; // Skip to the next iteration, before i used continue statement but we can not use that in async function
      // }

      const isDeleted = await DeletedChatList.findOne({
        where: { user_id: receiverId, conversation_id },
      });

      if (isDeleted) {
        await isDeleted.destroy();
      }

      // Find the socketId of the receiver and emit the message to them
      const receiverSocketIds = await UserSocket.findAll({
        where: { user_id: receiverId },
      });

      // -------------------------------------Send Message to receiver soket if user is connected--------------------------------------- //
      if (receiverSocketIds.length != 0) {
        // Fetch the user data of the sender --------------------------------------------------------------------------
        const user = await User.findOne({
          where: { user_id: senderId },
          attributes: [
            "user_id",
            "user_name",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "email_id",
          ],
        });

        // Use get() to ensure getters are invoked
        const userData = user.get();

        // ------------------------------------- Append required perameter to singleChat object --------------------------------------- //
        singleChat.dataValues.is_star_message = false;
        singleChat.dataValues.myMessage = false; // i set myMessage to false for receiver i will update it for sender
        // singleChat.dataValues.senderId == senderId; //singleChat.dataValues.senderId == senderId here senderId will allways going to be different
        // singleChat.dataValues.call_type = "0";
        singleChat.dataValues.senderData = userData;
        singleChat.dataValues.statusData = [];
        singleChat.dataValues.pollData = [];

        if (!isBlocked) {
          // Emit the message to the receiver's socket
          receiverSocketIds.forEach((receiverSocketId) => {
            socketService
              .getIo()
              .to(receiverSocketId.dataValues.socketId)
              .emit("messageReceived", singleChat);
          });
        }

        // Emit message back to sender to update inner message list
        const senderSocketId = await UserSocket.findOne({
          where: { user_id: receiverId },
        });
        singleChat.dataValues.myMessage = true; // myMessage true only for sender

        if (!isBlocked) {
          // To Update other user chatList in real-time
          receiverSocketIds.forEach((receiverSocketId) => {
            sendChatListOnMessage(
              socketService.getIo(),
              receiverSocketId.dataValues.socketId,
              receiverId
            );
          });

          if (newConversationData.dataValues.is_group) {
            pushMessageNotification({
              senderId,
              receiverId,
              senderName: newConversationData.dataValues.group_name,
              message: message_type === "text" ? message : message_type,
              message_type: message_type,
              conversation_id,
              is_group: true,
              profile_image: newConversationData.dataValues.group_profile_image,
              big_picture:
                message_type == "video"
                  ? newMessage.dataValues.thumbnail
                  : newMessage.dataValues.url,
            });
          } else {
            let receiverUser = await User.findOne({
              where: {
                user_id: receiverId,
              },
            });

            let userDetails = await AllContact.findOne({
              where: {
                phone_number: userData.phone_number, //sender phone number
                user_id: receiverId, // receiver id
              },
              attributes: ["full_name"],
            });

            pushMessageNotification({
              senderId,
              receiverId,
              senderName:
                userDetails?.full_name ||
                `${userData.first_name} ${userData?.last_name}`,
              message: message_type === "text" ? message : message_type,
              message_type: message_type,
              conversation_id,
              is_group: false,
              profile_image: userData.profile_image,
              big_picture:
                message_type == "video"
                  ? newMessage.dataValues.thumbnail
                  : newMessage.dataValues.url,
            });
          }
        }
        if (!responseSent) {
          res.status(200).json(singleChat);
        }
        responseSent = true;

        // user have seen a message (If a user is online, that does not mean that, the user has seen the message)
      } else {
        //  -----------------------------------------------send back response to sender----------------------------------------------------//
        // -------------------------------------Send Message to receiver soket if user is offline--------------------------------------- //

        // Fetch the user data for the sender
        // Fetch the user data of the sender
        const user = await User.findOne({
          where: { user_id: senderId },
          attributes: [
            "user_id",
            "user_name",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "email_id",
          ],
        });

        // Use get() to ensure getters are invoked
        const userData = user.get();

        // This will update all message to unread =++=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=++=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
        // const updatedRows = await Chat.update(
        //   { message_read: 1 }, // Data you want to update
        //   {
        //     where: {
        //       senderId: senderId,
        //       receiverId: receiverId,
        //     },
        //   }
        // );

        const singleChat = await Chat.findOne({
          where: {
            conversation_id,
          },
          order: [
            ["message_id", "DESC"], // Order by message_id in descending order
          ],
          limit: 1, // Limit the result to 1 row to see latest message
        });

        // ------------------------------------- Append required perameter to singleChat object --------------------------------------- //
        singleChat.dataValues.is_star_message = false;
        singleChat.dataValues.myMessage = false; // i set myMessage to false for receiver i will update it for sender
        // singleChat.dataValues.senderId == senderId; //singleChat.dataValues.senderId == senderId here senderId will allways going to be different
        // singleChat.dataValues.call_type = "0";
        singleChat.dataValues.senderData = userData;
        singleChat.dataValues.myMessage = true; // myMessage true only for sender

        // If user is bolck then he/she will not receive the notifications
        if (!isBlocked) {
          if (newConversationData.dataValues.is_group) {
            pushMessageNotification({
              senderId,
              receiverId,
              senderName: newConversationData.dataValues.group_name,
              message: message_type == "text" ? message : message_type,
              message_type: message_type,
              conversation_id,
              is_group: true,
              profile_image: newConversationData.dataValues.group_profile_image,
              big_picture:
                message_type == "video"
                  ? newMessage.dataValues.thumbnail
                  : newMessage.dataValues.url,
            });
          } else {
            let receiverUser = await User.findOne({
              where: {
                user_id: receiverId,
              },
            });

            // Check if receiver has different name for the sender or not ========================================
            let userDetails = await AllContact.findOne({
              where: {
                phone_number: userData.phone_number, //sender phone number
                user_id: receiverId, // receiver id
              },
              attributes: ["full_name"],
            });

            pushMessageNotification({
              senderId,
              receiverId,
              senderName:
                userDetails?.full_name ||
                `${userData.first_name} ${userData?.last_name}`,
              message: message_type === "text" ? message : message_type,
              message_type: message_type,
              conversation_id,
              is_group: false,
              profile_image: userData.profile_image,
              big_picture:
                message_type == "video"
                  ? newMessage.dataValues.thumbnail
                  : newMessage.dataValues.url,
            });
          }
        }

        if (!responseSent) {
          res.status(200).json(singleChat);
        }
        responseSent = true;
      }
    });
    // );
  } catch (error) {
    console.error("Error sending message:", error);
    // Emit an error message to the sender
    // socket.emit("errorMessage", {
    //   status: false,
    //   message: "An error occurred while sending the message",
    // });
  }
};

module.exports = { sendMessage };
