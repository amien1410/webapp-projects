const jwt = require("jsonwebtoken");
const { Conversation, ConversationsUser } = require("../../../models");

const createGroup = async (req, res) => {
  let { group_name, conversation_id, public_group } = req.body;
  let files = req.files;

  try {
    // authtoken is required

    // if (files?.length == 0 && !conversation_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "files field is required for group profile image",
    //   });
    // }

    let udpatedFileds = {};

    // console.log("files", files);
    if (files?.length != 0) {
      udpatedFileds.group_profile_image = files[0].path;
    }
    if (group_name != undefined && group_name != "") {
      udpatedFileds.group_name = group_name;
    }
    if (public_group != undefined && public_group != "") {
      udpatedFileds.public_group = public_group;
    }
    if (conversation_id) {
      //this means user wants to change group Name or group profile ===============================================================
      let updatedData = await Conversation.update(udpatedFileds, {
        where: {
          conversation_id,
        },
      });

      let conversationDetails = await Conversation.findOne({
        where: {
          conversation_id,
        },
        attributes: ["group_name", "group_profile_image"],
      });

      return res.status(200).json({
        success: true,
        message: "Group Updated Successfully",
        conversation_id,
        conversationDetails,
      });
    }

    const user_id = req.authData.user_id;
    //this means user wants to create new conversation ===============================================================================================
    let conversationData = await Conversation.create({
      ...udpatedFileds,
      is_group: true,
    });

    conversation_id = conversationData.toJSON().conversation_id;

    // Now Add Sender user to conversation through conversationuser tabel ======================================================
    let userAdded = await ConversationsUser.create({
      conversation_id,
      user_id: user_id,
      is_admin: true,
    });

    let conversationDetails = await Conversation.findOne({
      where: {
        conversation_id,
      },
      attributes: ["group_name", "group_profile_image"],
    });

    return res.status(200).json({
      success: true,
      message: "Group Created Successfully",
      conversation_id,
      conversationDetails,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createGroup };
