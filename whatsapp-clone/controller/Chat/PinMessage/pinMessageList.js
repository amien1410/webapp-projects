const jwt = require("jsonwebtoken");
const {
  PinMessage,
  Chat,
  User,
  Conversation,
  ConversationsUser,
  AllContact,
  DeleteMessage,
} = require("../../../models");
const { updateFieldIfDefined } = require("../../../reusable/updatedFields");

const pinMessageList = async (req, res) => {
  try {
    let { conversation_id } = req.body;
    const user_id = req.authData.user_id;
    let updateFields = {};
    updateFieldIfDefined(updateFields, "conversation_id", conversation_id);

    let PinMessageList = await PinMessage.findAll({
      // where: {
      //   user_id: user_id,
      // },
      include: [
        {
          model: User,
          attributes: [
            "profile_image",
            "user_id",
            "phone_number",
            "first_name",
            "last_name",
            "user_name",
          ],
        },
        {
          model: Chat,
          where: updateFields,
          include: [
            // {
            //   model: User,
            //   attributes: [
            //     "profile_image",
            //     "user_id",
            //     "phone_number",
            //     "first_name",
            //     "last_name",
            //     "user_name",
            //   ],
            // },
            {
              model: Conversation,
              attributes: [
                "group_profile_image",
                "conversation_id",
                "is_group",
                "group_name",
              ],
            },
          ],
        },
      ],
      order: [["pin_message_id", "DESC"]],
    });

    let modifiedData = [];
    for (let item of PinMessageList) {
      item = item.get();
      // console.log("item.Chat.message_id", item.Chat.message_id);
      const isDeleted = await DeleteMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.Chat.message_id,
        },
      });

      if (isDeleted) {
        continue;
      }

      let userList = await ConversationsUser.findAll({
        where: {
          conversation_id: item.Chat.conversation_id,
        },
        include: [
          {
            model: User,
            attributes: [
              "profile_image",
              "user_id",
              "phone_number",
              "first_name",
              "last_name",
              "user_name",
            ],
          },
        ],
      });

      if (item.Chat.Conversation.is_group == false) {
        let updatedUserList = await Promise.all(
          userList
            .filter((convUser) => convUser.user_id !== user_id)
            .map(async (user) => {
              user = user.toJSON();
              // console.log(user);
              item.other_user_id = user.user_id;

              let userDetails = await AllContact.findOne({
                where: {
                  phone_number: user.User.phone_number,
                  user_id,
                },
                attributes: ["full_name"],
              });
              // console.log(userDetails, "userDetails");
              if (userDetails) {
                user.User.first_name =
                  userDetails.full_name.split(" ")[0] || user.User.first_name;
                user.User.last_name =
                  userDetails.full_name.split(" ")[1] || user.User.last_name;
              }
              return user.User; // Extract only the User attributes
            })
        );

        item.otherUserDetails = updatedUserList;
      } else {
        item.otherUserDetails = [];
        item.other_user_id = 0;
      }
      modifiedData.push(item);
    }

    return res.status(200).json({
      success: true,
      message: "Pin message list",
      PinMessageList: modifiedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pinMessageList };
