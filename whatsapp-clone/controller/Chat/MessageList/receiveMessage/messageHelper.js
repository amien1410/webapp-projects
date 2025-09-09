const { getStatusData } = require("./statusService");
const {
  isMessageStarred,
  isMessageDeleted,
  markMessageAsRead,
  getPollData,
} = require("./chatService");
const { getUserById } = require("./userService");
const moment = require("moment-timezone");
const { User, AllContact } = require("../../../../models");

const processMessageContent = async ({
  messages,
  user_id,
  conversationUsers,
  user_timezone,
  conversation_id,
}) => {
  const modifiedDataWithDate = [];
  let lastDate = null;

  const user_id_list = conversationUsers.map((u) => u.user_id.toString());

  for (const item of messages) {
    // Update who_seen the message ==================================================================================
    let who_seen_list = item.dataValues.who_seen_the_message
      ? item.dataValues.who_seen_the_message.split(",")
      : [];
    if (
      !item.dataValues.message_read &&
      !who_seen_list.includes(String(user_id))
    ) {
      await markMessageAsRead(
        conversation_id,
        item.message_id,
        user_id_list,
        who_seen_list,
        user_id
      );
    }

    // Construct full url ===================================================
    const message_url = `${process.env.baseUrl}${item.url}`;
    item.url = message_url != process.env.baseUrl ? message_url : "";

    // build thumbnail full url ==========================================
    if (item.message_type == "video") {
      // const thumbnail_url = `${process.env.baseUrl}${item.thumbnail}`;
      // item.thumbnail =
      //   thumbnail_url != process.env.baseUrl ? thumbnail_url : "";
      item.thumbnail = item.thumbnail;
    }

    const isDeleted = await isMessageDeleted(user_id, item.message_id);
    if (isDeleted) continue;

    const isStarred = await isMessageStarred(user_id, item.message_id);
    const statusData = await getStatusData(item.status_id);
    const senderData = await getUserById(item.senderId);

    let pollData = [];
    if (item.message_type == "poll") {
      pollData = await getPollData(item.message_id);
    }
    const messageDate = moment
      .tz(item.createdAt, user_timezone)
      .format("YYYY-MM-DD");

    if (lastDate !== messageDate) {
      modifiedDataWithDate.push({
        url: "",
        thumbnail: "",
        message_id: 0,
        message: item.dataValues.createdAt, // Use the date instead of `item.dataValues.createdAt`
        message_type: "date",
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
        createdAt: "",
        updatedAt: "",
        senderId: 0,
        conversation_id: 0,
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
        pollData: [],
      });
      lastDate = messageDate;
    }

    if (
      item.message_type == "member_added" ||
      item.message_type == "member_removed"
    ) {
      // Who Added the new member to group
      let adminDetails = await User.findOne({
        where: {
          user_id: item.message,
        },
        attributes: [
          "user_id",
          "phone_number",
          "first_name",
          "last_name",
          "user_name",
        ],
      });

      // New Member details

      let newUserDetails = await User.findOne({
        where: {
          user_id: item.senderId,
        },
        attributes: [
          "user_id",
          "phone_number",
          "first_name",
          "last_name",
          "user_name",
        ],
      });

      // Now check how  user saved their name in their device
      let adminUserName = await AllContact.findOne({
        where: {
          phone_number: adminDetails.phone_number,
          user_id,
        },
        attributes: ["full_name"],
      });

      // Now check how  user saved their name in their device
      let newUserName = await AllContact.findOne({
        where: {
          phone_number: newUserDetails.phone_number,
          user_id,
        },
        attributes: ["full_name"],
      });

      item.dataValues.message = `${
        adminDetails.user_id == user_id
          ? "You"
          : adminUserName
          ? adminUserName.full_name
          : adminDetails.user_name
      } ${item.message_type == "member_added" ? "added" : "removed"} ${
        newUserDetails.user_id == user_id
          ? "You"
          : newUserName
          ? newUserName.full_name
          : newUserDetails.user_name
      }`;
    }

    modifiedDataWithDate.push({
      ...item.dataValues,
      is_star_message: isStarred,
      statusData,
      myMessage: item.senderId === user_id,
      senderData,
      pollData,
    });
  }

  return modifiedDataWithDate;
};

module.exports = { processMessageContent };
