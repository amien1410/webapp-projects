const jwt = require("jsonwebtoken");
const { Conversation, ConversationsUser } = require("../../../models");

const createGroupAdmin = async (req, res) => {
  const user_id = req.authData.user_id;
  let { new_user_id, conversation_id, remove_from_admin } = req.body;

  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }
  if (!new_user_id || new_user_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "new_user_id field is required" });
  }

  try {
    // First check user is admin or not ==================================================================================
    let isAdmin = await ConversationsUser.findOne({
      where: {
        conversation_id,
        user_id,
        is_admin: true,
      },
    });
    if (!isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Only group admin can make new group admin!",
      });
    }

    if (remove_from_admin || remove_from_admin == "true") {
      // console.log(remove_from_admin, "inside remove_from_admin");
      // if remove_from_admin is true
      let userRemovedFromAdmin = await ConversationsUser.update(
        {
          is_admin: false,
        },
        {
          where: {
            conversation_id,
            user_id: new_user_id,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "User Removed From Group Admin",
      });
    } else {
      // Now create admin ======================================================
      let userAdded = await ConversationsUser.update(
        {
          is_admin: true,
        },
        {
          where: {
            conversation_id,
            user_id: new_user_id,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Now User is Group Admin",
      });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createGroupAdmin };
