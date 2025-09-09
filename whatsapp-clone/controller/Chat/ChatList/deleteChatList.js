const {
  DeletedChatList,
  StarMessage,
  ClearAllChat,
  Chat,
} = require("../../../models");

const deleteChatList = async (req, res) => {
  let { conversation_id } = req.body;
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  try {
    const user_id = req.authData.user_id;

    const isDeletedChatListed = await DeletedChatList.findOne({
      where: {
        user_id,
        conversation_id,
      },
    });

    if (isDeletedChatListed) {
      // If Chat is Allready deleted ==================================================================================
      return res.status(200).json({
        success: true,
        message: "Chat Deleted Successfully",
      });
    }

    // Get the latest message_id  ==================================================================================
    const singleChat = await Chat.findOne({
      where: {
        conversation_id,
      },
      order: [
        ["message_id", "DESC"], // Order by message_id in descending order
      ],
      limit: 1, // Limit the result to 1 row to see latest message
    });

    // To remove message from message_list add to deleteMessage ====================================
    if (singleChat) {
      // await DeleteMessage.create({
      //   user_id,
      //   message_id: singleChat.message_id,
      // });
      // Archive the user
      await ClearAllChat.create({
        user_id,
        message_id: singleChat.message_id,
        conversation_id,
      });
      await StarMessage.destroy({
        where: {
          user_id,
          conversation_id,
        },
      });
    }

    // DeletedChatList the user
    await DeletedChatList.create({
      user_id,
      conversation_id,
    });

    res.status(200).json({
      success: true,
      message: "Chat Deleted Successfully",
      // isDeletedChatListed: deletedChatListData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteChatList };
