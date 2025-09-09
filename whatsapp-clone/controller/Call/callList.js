const {
  Call,
  User,
  ConversationsUser,
  Conversation,
  AllContact,
} = require("../../models");
const { Op } = require("sequelize");

const callList = async (req, res) => {
  try {
    // Get user_id from authData
    const user_id = req.authData.user_id;

    // Step 1: Fetch all conversation_ids for the user
    const userConversations = await ConversationsUser.findAll({
      where: { user_id: user_id },
      attributes: ["conversation_id"],
    });

    // Extract conversation_ids into an array
    const conversationIds = userConversations.map(
      (conversation) => conversation.conversation_id
    );

    // Step 2: Fetch all calls for the fetched conversation_ids
    const conversationsWithCalls = await Call.findAll({
      where: { conversation_id: { [Op.in]: conversationIds } },
      include: [
        {
          model: Conversation,
          attributes: [
            "conversation_id",
            "is_group",
            "group_name",
            "group_profile_image",
          ],
        },
        {
          model: User,
          attributes: [
            "user_id",
            "phone_number",
            "profile_image",
            "user_name",
            "first_name",
            "last_name",
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    let callListData = [];
    for (let callData of conversationsWithCalls) {
      callData = callData.toJSON();
      // console.log(typeof callData.Conversation.is_group, "typeof is_group");

      if (callData.Conversation.is_group == false) {
        const otherUser = await ConversationsUser.findOne({
          where: {
            conversation_id: callData.conversation_id,
            user_id: { [Op.ne]: user_id },
          },
          attributes: [],
          include: [
            {
              model: User,
              attributes: [
                "user_id",
                "phone_number",
                "profile_image",
                "user_name",
                "first_name",
                "last_name",
              ],
            },
          ],
        });
        // console.log(
        //   otherUser?.dataValues?.User?.phone_number,
        //   "otherUser?.dataValues?.User?.phone_number"
        // );
        let userDetails = await AllContact.findOne({
          where: {
            phone_number: otherUser?.dataValues?.User?.phone_number, // sender phone number
            user_id: user_id,
          },
          attributes: ["full_name"],
        });

        callData.User = otherUser.User;
        if (userDetails) {
          // console.log(
          //   userDetails.dataValues.full_name,
          //   "userDetails.dataValues.full_name"
          // );
          callData.User.first_name =
            userDetails.dataValues.full_name.split(" ")[0];
          callData.User.last_name =
            userDetails.dataValues.full_name.split(" ")[1] || "";
        }
      }
      callListData.push(callData);
    }

    // Return the conversation with calls
    return res.status(200).json({ callList: callListData, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { callList };
