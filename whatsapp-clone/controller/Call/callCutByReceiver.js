const { Chat, Call, UserSocket, Conversation } = require("../../models");
const checkRequiredFields = require("../../reusable/checkRequiredFields");
const socketService = require("../../reusable/socketService");

const callCutByReceiver = async (req, res) => {
  let { conversation_id, message_id, caller_id } = req.body;

  // check which field is missing
  const fieldsToCheck = [
    { name: "conversation_id", value: conversation_id },
    { name: "message_id", value: message_id },
    { name: "caller_id", value: caller_id },
  ];
  console.log(fieldsToCheck, "fieldsToCheck");

  const missingFieldError = checkRequiredFields(fieldsToCheck, res);

  if (missingFieldError) {
    return missingFieldError;
  }

  try {
    const user_id = req.authData.user_id;

    await Conversation.update(
      {
        last_message: `0,0,1,${caller_id}`, //first position is for miss_call second call_accepted, thrid call_decline and forth caller_id
      },
      {
        where: {
          conversation_id,
        },
      }
    );
    // in 0,0,0 first position is for miss_call ==================================================================================
    const updatedMessage = await Chat.update(
      { message: "0,0,1" },
      {
        where: {
          message_id: message_id,
        },
      }
    );

    const updatedRow = await Call.update(
      { call_decline: "1" },
      {
        where: {
          message_id: message_id,
        },
      }
    );

    const receiverSocketIds = await UserSocket.findAll({
      where: { user_id: caller_id },
    });

    // Emit the event to the receiver's socket
    if (receiverSocketIds.length != 0) {
      receiverSocketIds.forEach((receiverSocketId) => {
        socketService
          .getIo()
          .to(receiverSocketId.dataValues.socketId)
          .emit("call_decline", {
            call_decline: true,
            conversation_id,
            message_id,
          });
      });
    }

    return res
      .status(200)
      .json({ message: "Call Declined Successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { callCutByReceiver };
