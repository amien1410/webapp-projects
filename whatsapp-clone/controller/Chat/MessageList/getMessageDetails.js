const jwt = require("jsonwebtoken");
const { Chat, User, AllContact } = require("../../../models");
const { updateFieldIfDefined } = require("../../../reusable/updatedFields");
const checkRequiredFields = require("../../../reusable/checkRequiredFields");

const getMessageDetails = async (req, res) => {
  try {
    let { message_id } = req.body;
    
    const user_id = req.authData.user_id;

    // check which field is missing
    const fieldsToCheck = [{ name: "message_id", value: message_id }];

    const missingFieldError = checkRequiredFields(fieldsToCheck, res);

    if (missingFieldError) {
      return missingFieldError;
    }

    const resData = await Chat.findOne({
      where: {
        message_id: message_id,
      },
    });
    if (resData == null) {
      return res
        .status(400)
        .json({ success: false, message: "Message not found" });
    }

    const senderId = resData.dataValues.senderId;
    const user = await User.findOne({
      where: { user_id: senderId },
      attributes: [
        "user_id",
        "user_name",
        "profile_image",
        "first_name",
        "last_name",
        "phone_number",
      ],
    });
    // console.log(message_stared, "message_stared ======================");
    const senderData = user.get();

    console.log(senderData, "senderData");
    let userDetails = await AllContact.findOne({
      where: {
        phone_number: senderData.phone_number,
        user_id,
      },
      attributes: ["full_name"],
    });
    console.log(userDetails, "userDetails");

    if (userDetails) {
      senderData.first_name = userDetails.full_name.split(" ")[0];
      senderData.last_name = userDetails.full_name.split(" ")[1];
    }

    resData.dataValues.myMessage = senderId == user_id;

    resData.dataValues.senderData = senderData;
    return res.status(200).json({
      success: true,
      message: "Star message list",
      senderId,
      resData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMessageDetails };
