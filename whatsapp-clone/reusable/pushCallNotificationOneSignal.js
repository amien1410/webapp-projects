const axios = require("axios");
const capitalizeFirstLetter = require("./capitalizeFirstLetter");

async function pushCallNotificationOneSignal(notificationData) {
  if (!notificationData.one_signal_player_id) return
  
  let message = {
    app_id: process.env.ONESIGNAL_APPID, // Include the app_id here
    include_player_ids: [notificationData.one_signal_player_id],
    data: notificationData, // Common data for both missed call and regular call
    large_icon: notificationData.sender_profile_image,
    small_icon: "mipmap/ic_launcher",
    // priority: 10,
    // android_sound: "default",
    // collapse_id: `call_${notificationData.senderId}_${notificationData.conversation_id}`, // Unique collapse ID for the call notifications
  };

  // Conditional logic for setting contents and headings
  if (notificationData.missed_call == true) {
    // Missed call scenariop
    message.contents = {
      en:
        notificationData.call_type == "audio_call"
          ? "Missed Voice call"
          : "Missed Video call",
    };
    message.headings = {
      en: capitalizeFirstLetter(notificationData.senderName),
    };
  } else {
    // message.android_channel_id = "b174e31b-a337-4235-a42f-ecfd379498d6";
    // Regular call scenario
    message.contents = {
      en:
        notificationData.call_type == "audio_call"
          ? "Voice call"
          : "Video call",
    };

    message.headings = {
      en: `${capitalizeFirstLetter(notificationData.senderName)} is Calling`,
    };
    message.buttons = [
      {
        id: "accept",
        text: "Accept",
        // icon: `${process.env.baseUrl}/uploads/accept.png`,
      },
      {
        id: "decline",
        text: "Decline",
        // icon: `${process.env.baseUrl}/uploads/decline.png`,
      },
    ];
  }

  // Send notification using OneSignal
  return await sendRequest(message);
}

async function sendRequest(message) {
  try {
    // const response = await client.createNotification(message);
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      message,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );
    console.log(
      "Successfully sent notifications:========================================================="
    );

    return true;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return false;
  }
}

module.exports = pushCallNotificationOneSignal;
