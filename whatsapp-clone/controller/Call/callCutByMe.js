const {
  User,
  Chat,
  Call,
  ConversationsUser,
  Conversation,
  AllContact,
} = require("../../models");
const { Op } = require("sequelize");

const pushCallNotificationOneSignal = require("../../reusable/pushCallNotificationOneSignal");

const callCutByMe = async (req, res) => {
  let { conversation_id, call_type, message_id, call_id } = req.body;
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }
  if (!call_type || call_type == "") {
    return res
      .status(400)
      .json({ success: false, message: "call_type field is required" });
  }

  try {
    const user_id = req.authData.user_id;

    // To find receiver User Id
    let ConversationsUserList = await ConversationsUser.findAll({
      where: {
        conversation_id,
      },
      include: [
        {
          model: User,
          // attributes: [
          //   "user_id",
          //   "device_token",
          //   "phone_number",
          //   "profile_image",
          // ],
          where: {
            device_token: {
              [Op.ne]: "", // device_token should not be an empty string
            },
          },
        },
      ],
    });

    let newConversationData = await Conversation.findOne({
      where: { conversation_id },
    });

    // // Save Call Details to database
    await Conversation.update(
      {
        last_message: `1,0,0,${user_id}`, //first position is for miss_call second call_accepted, thrid call_decline and forth caller_id
        last_message_type: call_type,
      },
      {
        where: {
          conversation_id,
        },
      }
    );

    const updatedMessage = await Chat.update(
      { message: "1,0,0" },
      {
        where: {
          message_id: message_id,
        },
      }
    );

    const updatedRow = await Call.update(
      { missed_call: "1" },
      {
        where: {
          message_id: message_id,
        },
      }
    );

    // Filter out the user with the specific user_id
    const filteredConversationsUserList = ConversationsUserList.filter(
      (user) => user.toJSON().User.user_id !== user_id
    );

    // console.log(filteredConversationsUserList, "filteredConversationsUserList");

    for (const user of filteredConversationsUserList) {
      let userData = user.toJSON();
      // console.log(userData.User.device_token, "userData.User.device_token");
      let receiverId = filteredConversationsUserList
        .find((user) => user.toJSON().User.user_id != user_id)
        .toJSON().User.user_id;
      // console.log(receiverId, "receiver data");

      let receiverUser = await User.findOne({
        where: {
          user_id: receiverId,
        },
      });

      let notificationData = {};

      if (newConversationData.dataValues.is_group) {
        notificationData.senderId = user_id;
        notificationData.receiver_token = userData.User.device_token;
        notificationData.one_signal_player_id =
          userData.User.one_signal_player_id;
        notificationData.senderName = newConversationData.dataValues.group_name;
        notificationData.sender_profile_image = String(
          newConversationData.dataValues.group_profile_image.includes(
            process.env.baseUrl
          )
            ? newConversationData.dataValues.group_profile_image
            : `${process.env.baseUrl}${newConversationData.dataValues.group_profile_image}`
        );
        newConversationData.dataValues.group_profile_image;
        notificationData.is_group = newConversationData.dataValues.is_group;
        notificationData.call_type = call_type;
        notificationData.missed_call = true;
        notificationData.room_id = "";
        notificationData.receiver_profile_image = receiverUser?.profile_image;
        notificationData.receiver_phone_number = receiverUser.phone_number;
        notificationData.receiverId = receiverId;
        notificationData.sender_phone_number = "";
        notificationData.message_id = message_id;
        notificationData.call_id = call_id;
        notificationData.conversation_id = conversation_id;
      } else {
        let senderData = ConversationsUserList.filter(
          (user) => user.toJSON().User.user_id == user_id
        )[0].toJSON();
        // console.log(senderData.User.phone_number, "senderData");

        let userDetails = await AllContact.findOne({
          where: {
            phone_number: senderData.User.phone_number, // sender phone number
            user_id: receiverId, // receiver id
          },
          attributes: ["full_name"],
        });
        // console.log(receiverUser, "receiverUser");
        // console.log(
        //   userData.User,
        //   "==========================================="
        // );
        notificationData.senderId = user_id;
        notificationData.receiver_token = userData.User.device_token;
        notificationData.one_signal_player_id =
          userData.User.one_signal_player_id;
        notificationData.call_type = call_type;
        notificationData.missed_call = true;
        notificationData.sender_phone_number = userData.User.phone_number;
        notificationData.senderName =
          userDetails?.full_name ||
          `${senderData.User.first_name} ${senderData.User?.last_name}`;
        notificationData.sender_profile_image = String(
          senderData.User.profile_image.includes(process.env.baseUrl)
            ? senderData.User.profile_image
            : `${process.env.baseUrl}${senderData.User.profile_image}`
        );
        notificationData.is_group = newConversationData.dataValues.is_group;
        notificationData.room_id = "";
        notificationData.sender_first_name = userData.User?.last_name;
        notificationData.receiver_profile_image = receiverUser?.profile_image;
        notificationData.receiver_phone_number = receiverUser.phone_number;
        notificationData.receiverId = receiverId;
        notificationData.message_id = message_id;
        notificationData.call_id = call_id;
        notificationData.conversation_id = conversation_id;
      }

      pushCallNotificationOneSignal(notificationData);
      // console.log(notificationData);
    }

    return res
      .status(200)
      .json({ message: "Cut Call Successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { callCutByMe };
