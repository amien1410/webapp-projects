const { PollVote } = require("../../../models");
const { updateFieldIfDefined } = require("../../../reusable/updatedFields");
const EmitDataInGroup = require("../Group/EmitDataInGroup");

const voteInPoll = async (req, res) => {
  const { conversation_id, poll_option_id, message_id } = req.body; // Assuming message_id is required for the poll
  const user_id = req.authData.user_id;

  if (!poll_option_id) {
    return res
      .status(400)
      .json({ success: false, message: "poll_option_id is required" });
  }
  if (!message_id) {
    return res
      .status(400)
      .json({ success: false, message: "message_id is required" });
  }

  try {
    // Check if the user has already voted in this poll
    const existingVote = await PollVote.findOne({
      where: { user_id, message_id },
    });

    if (existingVote) {
      // Update existing vote instead of deleting and creating a new one
      await existingVote.update({ poll_option_id });
    } else {
      // Create a new vote if it doesn't exist
      let updateFields = {};
      updateFieldIfDefined(updateFields, "user_id", user_id);
      updateFieldIfDefined(updateFields, "poll_option_id", poll_option_id);
      updateFieldIfDefined(updateFields, "message_id", message_id);

      await PollVote.create(updateFields);
    }

    // Emit update_data event to notify the member is added to group
    await EmitDataInGroup(conversation_id, "update_poll_vote", {
      message_id,
      poll_option_id,
      conversation_id,
      user_id,
    });

    return res.status(200).json({
      message: "Voted in poll successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { voteInPoll };
