// This controller is only for message notification
const { User, Chat } = require("../models");
const { Op } = require("sequelize");
const capitalizeFirstLetter = require("./capitalizeFirstLetter");
const pushNotificationToDevice = require("./pushNotificationToDevice");

async function pushMessageNotification({
  senderId,
  receiverId,
  senderName,
  message,
  message_type,
  conversation_id,
  is_group,
  profile_image,
  big_picture,
}) {
  // console.log(
  //   senderId,
  //   receiverId,
  //   senderName,
  //   message,
  //   message_type,
  //   "======================================"
  // );

  const receiver = await getUserData(receiverId);

  if (!receiver) {
    console.error("receiver not found.");
    return;
  }

  const notificationData = {
    senderName: String(senderName),
    senderId: String(senderId),
    profile_image: String(
      profile_image.includes(process.env.baseUrl)
        ? profile_image
        : `${process.env.baseUrl}${profile_image}`
    ),
    conversation_id: String(conversation_id),
    is_block: String(false),
    is_group: String(`${is_group}`),
    notification_type: "message",
    messageType: String(message_type),
    big_picture,
  };
  // console.log(
  //   notificationData,
  //   "notificationData =-============================================"
  // );

  const data = {
    title: `${capitalizeFirstLetter(senderName)}`,
    body: `${capitalizeFirstLetter(message)}`,
  };

  if (message_type == "location") {
    data.body = `📌 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "image") {
    data.body = `📸 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "video") {
    data.body = `📽️ ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "document") {
    data.body = `📄 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "contact") {
    data.body = `📞 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "audio") {
    data.body = `🎤 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "gif") {
    data.body = `😈 ${capitalizeFirstLetter(message)}`;
  } else if (message_type == "link") {
    data.body = `🔗 ${capitalizeFirstLetter(message)}`;
  }

  // await sendRequest(data, messaging, receiver.dataValues.device_token);
  let notificationRes = await pushNotificationToDevice({
    one_signal_player_id: receiver.dataValues.one_signal_player_id,
    title: data.title,
    body: data.body,
    notificationData,
  });
}

async function getUserData(user_id) {
  const user = await User.findOne({ where: { user_id: user_id } });
  return user;
}

module.exports = pushMessageNotification;
