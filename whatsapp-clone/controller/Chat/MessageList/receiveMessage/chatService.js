const {
  Chat,
  ClearAllChat,
  DeleteMessage,
  ConversationsUser,
  StarMessage,
  Block,
  PollOption,
  PollVote,
} = require("../../../../models");
const { Op } = require("sequelize");
const EmitDataInGroup = require("../../Group/EmitDataInGroup");

const getMessages = async ({
  user_id,
  conversation_id,
  message_id,
  page,
  per_page_message,
}) => {
  const clearAllChatRes = await ClearAllChat.findOne({
    where: { user_id, conversation_id },
    order: [["updatedAt", "DESC"]],
  });
  const isBlocked = await Block.findOne({
    where: {
      user_id: user_id,
      conversation_id,
    },
  });

  let updatedFiled = {};
  // Handle cleared chat case
  if (clearAllChatRes) {
    updatedFiled.message_id = {
      [Op.gt]: clearAllChatRes.dataValues.message_id,
    };
  }

  // Handle block case
  if (isBlocked) {
    updatedFiled.message_id = {
      ...updatedFiled.message_id, // Keep existing conditions if any
      [Op.lte]: isBlocked.dataValues.message_id_before_block, // Add condition for messages before block
    };
  }

  // If message_id is provided, merge the condition with the previous one
  if (message_id) {
    updatedFiled.message_id = {
      ...updatedFiled.message_id, // Retain existing conditions
      [Op.gt]: message_id, // Add the new condition for message_id
    };
  }

  const totalMessages = await Chat.count({
    where: { ...updatedFiled, conversation_id },
  });

  const limit = Number(per_page_message);
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalMessages / limit);

  const messages = await Chat.findAll({
    where: { ...updatedFiled, conversation_id },
    order: [["message_id", "DESC"]],
    limit: message_id == 0 ? limit : 10000,
    offset,
  });

  const conversationUsers = await ConversationsUser.findAll({
    where: { conversation_id },
  });

  return { messages: messages.reverse(), totalPages, conversationUsers };
};

const markMessageAsRead = async (
  conversation_id,
  message_id,
  user_id_list,
  who_seen_list,
  user_id
) => {
  // if (!who_seen_list.includes(String(user_id))) {
  who_seen_list.push(user_id.toString());
  // }

  await Chat.update(
    { who_seen_the_message: who_seen_list.join(",") },
    { where: { conversation_id, message_id } }
  );

  const allSeen = user_id_list.every((uid) => who_seen_list.includes(uid));
  if (allSeen) {
    await Chat.update({ message_read: 1 }, { where: { message_id } });
    // Emit one event to notify the member is removed from group
    await EmitDataInGroup(conversation_id, "update_message_read", {
      message_id: message_id,
    });
  }
};

const getPollData = async (message_id) => {
  return await PollOption.findAll({
    where: { message_id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: {
      model: PollVote,
      attributes: ["user_id", "updatedAt"],
    },
  });
};

const isMessageStarred = async (user_id, message_id) => {
  return !!(await StarMessage.findOne({ where: { user_id, message_id } }));
};

const isMessageDeleted = async (user_id, message_id) => {
  return !!(await DeleteMessage.findOne({ where: { user_id, message_id } }));
};

module.exports = {
  getMessages,
  markMessageAsRead,
  isMessageStarred,
  isMessageDeleted,
  getPollData,
};
