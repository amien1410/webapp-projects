const { Op } = require("sequelize");
const { ConversationsUser, Conversation } = require("../../models"); // adjust the path as needed

async function checkUserAreInTheConversation(user1Id, user2Id) {
  try {
    const user1Conversations = await ConversationsUser.findAll({
      where: {
        user_id: user1Id,
      },
      attributes: ["conversation_id"],
    });

    const user1ConversationIds = user1Conversations.map((cu) => {
      cu = cu.toJSON();
      return cu.conversation_id;
    });

    const commonConversations = await ConversationsUser.findAll({
      where: {
        user_id: user2Id,
        conversation_id: {
          [Op.in]: user1ConversationIds,
        },
      },
      attributes: ["conversation_id"],
    });

    for (const conversation of commonConversations) {
      const conversationObj = conversation.toJSON();
      const isGroupOrNot = await Conversation.findOne({
        where: {
          conversation_id: conversationObj.conversation_id,
          is_group: false,
        },
      });

      if (isGroupOrNot) {
        return conversationObj.conversation_id; // Return the conversation ID immediately if it's not a group
      }
    }

    return null; // Return null if no matching conversation is found
  } catch (error) {
    console.error("Error checking conversations:", error);
    throw error;
  }
}

module.exports = checkUserAreInTheConversation;
