const { ConversationsUser } = require("../../../models");
const { Op } = require("sequelize");
const EmitDataInGroup = require("./EmitDataInGroup");

const exitFromGroup = async (req, res) => {
  const user_id = req.authData.user_id;
  let { conversation_id } = req.body;

  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  try {
    // Check if the user is an admin in the conversation
    const user = await ConversationsUser.findOne({
      where: { conversation_id, user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in the conversation",
      });
    }
    // console.log(user, "user.is_admin");

    // If the user is an admin
    if (user.is_admin) {
      // Check if there are other admins in the group
      const otherAdmins = await ConversationsUser.findAll({
        where: {
          conversation_id,
          is_admin: true,
          user_id: { [Op.ne]: user_id }, // Exclude the current admin
        },
      });

      if (otherAdmins.length === 0) {
        // No other admins, assign admin role to the next user based on createdAt
        const nextUser = await ConversationsUser.findOne({
          where: {
            conversation_id,
            user_id: { [Op.ne]: user_id }, // Exclude the current user
          },
          order: [["createdAt", "ASC"]],
        });

        if (nextUser) {
          await nextUser.update({ is_admin: true });
        }
      }
    }

    // Remove the user from the group
    await ConversationsUser.destroy({
      where: {
        conversation_id,
        user_id,
      },
    });

    // Emit one event to notify the member is removed from group
    await EmitDataInGroup(conversation_id, "update_data", {
      conversation_id: conversation_id,
      delete_from_everyone_id: [],
    });

    return res.status(200).json({
      success: true,
      message: "You have exited the group.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exitFromGroup };
