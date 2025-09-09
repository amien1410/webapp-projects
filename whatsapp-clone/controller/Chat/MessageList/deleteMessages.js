const { DeleteMessage, Chat, Conversation } = require("../../../models");
let { Op } = require("sequelize");
let path = require("node:path");
let fs = require("node:fs");
const EmitDataInGroup = require("../Group/EmitDataInGroup");

const deleteMessages = async (req, res) => {
  let { message_id_list, delete_from_every_one, conversation_id } = req.body;
  if (!message_id_list || message_id_list == "") {
    return res
      .status(400)
      .json({ success: false, message: "message_id_list field is required" });
  }
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  try {
    const user_id = req.authData.user_id;

    // Delete from EveryOne ==================================================================================

    if (delete_from_every_one == "true") {
      // console.log("delete from every one");
      let messageIdArray = message_id_list.split(",");

      const beforeChatData = await Chat.findAll({
        where: {
          message_id: {
            [Op.in]: messageIdArray,
          },
        },
      });

      // console.log(beforeChatData, "beforeChatData");
      beforeChatData.map(async (e) => {
        // console.log(e.dataValues);

        // Below commented code is to hard delete the message ======================
        // if (e.dataValues.url !== "") {
        //   // Replace `${process.env.baseUrl}` with an empty string to remove it
        //   // const relativePath = url[0].replace(process.env.baseUrl, "");
        //   // console.log("relativePath", relativePath);

        //   // Construct the absolute path by joining __dirname with the relative path
        //   const absolutePath = path.join(
        //     __dirname,
        //     "..",
        //     "..",
        //     "..",
        //     e.dataValues.url
        //   );
        //   // console.log(absolutePath, "absolutePath=======================");

        //   // console.log("filePath", absolutePath);

        //   if (fs.existsSync(absolutePath)) {
        //     fs.unlinkSync(absolutePath); // Delete the file
        //   }
        // }

        // delete thumbnail of video
        // if (e.dataValues.thumbnail != "") {
        //   // Construct the absolute path by joining __dirname with the relative path
        //   const absolutePath = path.join(
        //     __dirname,
        //     "..",
        //     "..",
        //     "..",
        //     e.dataValues.thumbnail
        //   );

        //   // console.log("filePath", absolutePath);

        //   if (fs.existsSync(absolutePath)) {
        //     fs.unlinkSync(absolutePath); // Delete the file
        //   }
        // }

        let udpateMessage = await Chat.update(
          {
            delete_from_everyone: true,
          },
          {
            where: {
              conversation_id,
              message_id: e.dataValues.message_id,
            },
          }
        );
      });

      // Update last_message for that conversation ===================+
      const findLastMessageId = await Chat.findOne({
        where: {
          conversation_id: conversation_id,
        },
        attributes: ["message_id"],
        order: [["message_id", "DESC"]],
        limit: 1,
      });

      if (messageIdArray.includes(findLastMessageId.message_id.toString())) {
        // Only update chatlist if it is last message ==================================================================================
        let conversationData = await Conversation.update(
          {
            last_message: "🚫 This message was deleted!",
            last_message_type: "delete_from_everyone",
          },
          {
            where: {
              conversation_id,
            },
          }
        );
      }
      messageIdArray = messageIdArray.map((e) => {
        return Number(e);
      });
      // Emit one event to notify the member is removed from group
      await EmitDataInGroup(conversation_id, "update_data", {
        conversation_id: conversation_id,
        delete_from_everyone_ids: messageIdArray,
      });
      // Below code is to hard delete the message permanatly
      // const resData = await Chat.destroy({
      //   where: {
      //     message_id: {
      //       [Op.in]: messageIdArray,
      //     },
      //   },
      // });

      res.status(200).json({
        success: true,
        message: "Message Deleted Successfully",
      });
    } else {
      // Delete Message only from me ==================================================================================
      let messageIdArray = message_id_list.split(",");

      try {
        await Promise.all(
          messageIdArray.map(async (message_id) => {
            const message = await Chat.findOne({
              where: {
                conversation_id,
                message_id,
              },
              attributes: ["delete_for_me", "delete_from_everyone"],
            });

            if (message) {
              // Get the current value of delete_for_me and split it into an array
              let currentDeleteForMe = message.delete_for_me || "";
              let user_id_list = currentDeleteForMe
                ? currentDeleteForMe.split(",")
                : [];

              // Check if the user_id already exists in the list
              if (
                user_id_list.includes(String(user_id)) ||
                message.delete_from_everyone
              ) {
                // This will remove the deleted message entry from message_list ===========================================
                const isDeletedMessagese = await DeleteMessage.findOne({
                  where: {
                    user_id,
                    message_id,
                  },
                });

                // this is for if message is allready deleted then remove the entry for that
                if (!isDeletedMessagese) {
                  // DeleteMessage the user
                  await DeleteMessage.create({
                    user_id,
                    message_id,
                  });
                }
              } else {
                user_id_list.push(String(user_id));
              }

              // Join the updated user_id_list back into a string
              const updatedDeleteForMe = user_id_list.join(",");

              // Update the delete_for_me field in the database
              let udpateMessage = await Chat.update(
                {
                  delete_for_me: updatedDeleteForMe,
                },
                {
                  where: {
                    conversation_id,
                    message_id,
                  },
                }
              );
            } else {
              console.log("Message not found");
            }

            // let udpateMessage = await Chat.update(
            //   {
            //     delete_for_me: user_id,
            //   },
            //   {
            //     where: {
            //       conversation_id,
            //       message_id: message_id,
            //     },
            //   }
            // );
          })
        );
      } catch (error) {
        console.error(error.message);
      }

      return res.status(200).json({
        success: true,
        message: "Message Deleted Successfully",
      });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteMessages };
