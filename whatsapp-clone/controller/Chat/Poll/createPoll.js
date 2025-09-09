const { PollOption, Chat, Conversation } = require("../../../models");
const { Op } = require("sequelize");
const { updateFieldIfDefined } = require("../../../reusable/updatedFields");
const EmitDataInGroup = require("../Group/EmitDataInGroup");
const { getPollData } = require("../MessageList/receiveMessage/chatService");

const createPoll = async (req, res) => {
  const { question, options, conversation_id } = req.body;

  const user_id = req.authData.user_id;

  if (!question) {
    return res
      .status(400)
      .json({ success: false, message: "question field is required" });
  }

  if (!conversation_id) {
    return res
      .status(400)
      .json({ success: false, message: "question field is required" });
  }

  if (!Array.isArray(options) || options.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Options must be a non-empty array!" });
  }

  try {
    let updateFields = {};
    updateFields.senderId = user_id;
    updateFieldIfDefined(updateFields, "message_type", "poll");
    updateFieldIfDefined(updateFields, "message", question);
    updateFieldIfDefined(updateFields, "conversation_id", conversation_id);
    updateFieldIfDefined(updateFields, "who_seen_the_message", user_id);

    const newMessage = await Chat.create(updateFields);

    // Update that conversation last message ==================================================================================
    await Conversation.update(
      {
        last_message: question,
        last_message_type: "poll",
        last_message_id: newMessage.dataValues.message_id,
      },
      {
        where: {
          conversation_id,
        },
      }
    );

    const pollOptions = options.map((option) => ({
      optionText: option,
      message_id: newMessage.message_id,
    }));

    await PollOption.bulkCreate(pollOptions);

    let pollData = await getPollData(newMessage.message_id);
    // Emit data to other user's ==================================================================================

    await EmitDataInGroup(conversation_id, "messageReceived", {
      url: "",
      thumbnail: "",
      message_id: newMessage.message_id,
      message: question, // Use the date instead of `item.dataValues.createdAt`
      message_type: "poll",
      who_seen_the_message: "",
      message_read: 0,
      video_time: "",
      audio_time: "",
      latitude: "",
      longitude: "",
      shared_contact_name: "",
      shared_contact_profile_image: "",
      shared_contact_number: "",
      forward_id: 0,
      reply_id: 0,
      status_id: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      senderId: user_id,
      conversation_id: conversation_id,
      delete_for_me: "",
      delete_from_everyone: false,
      is_star_message: false,
      myMessage: false,
      statusData: [],
      senderData: {
        profile_image: "",
        user_id: 0,
        user_name: "",
        first_name: "",
        last_name: "",
        phone_number: "",
      },
      pollData,
    });

    return res.status(200).json({
      message: "Poll created succesfully",
      success: true,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPoll };
