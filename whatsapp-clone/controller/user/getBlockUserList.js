const {
  User,
  Block,
  ConversationsUser,
  Conversation,
  AllContact,
} = require("../../models");

const getBlockUserList = async (req, res) => {
  try {
    const user_id = req.authData.user_id;

    const blockUserList = await Block.findAll({
      where: {
        user_id: user_id,
      },
      include: [
        // {
        //   model: User,
        // },
        {
          model: Conversation,
          include: [
            {
              model: ConversationsUser,
              include: [
                {
                  model: User,
                  attributes: [
                    "user_id",
                    "first_name",
                    "last_name",
                    "user_name",
                    "profile_image",
                    "phone_number",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Process the data to fetch user details from AllContact model
    let modifiedBlockUserList = [];
    for (let item of blockUserList) {
      let blockItem = item.toJSON();

      if (blockItem.Conversation.is_group === false) {
        let updatedUserList = await Promise.all(
          blockItem.Conversation.ConversationsUsers.filter(
            (convUser) => convUser.user_id !== user_id
          ).map(async (convUser) => {
            let user = convUser.User;
            let userDetails = await AllContact.findOne({
              where: {
                phone_number: user.phone_number,
                user_id: user_id,
              },
              attributes: ["full_name"],
            });

            if (userDetails) {
              user.first_name =
                userDetails.full_name.split(" ")[0] || user.first_name;
              user.last_name =
                userDetails.full_name.split(" ")[1] || user.last_name;
            }

            return user;
          })
        );
        delete blockItem.Conversation.ConversationsUsers;
        blockItem.Conversation.BlockedUserDetails = updatedUserList;
      } else {
        delete blockItem.Conversation.ConversationsUsers;
        blockItem.Conversation.BlockedUserDetails = [];
      }

      modifiedBlockUserList.push(blockItem);
    }

    res.status(200).json({
      success: true,
      message: "Blocked User List",
      blockUserList: modifiedBlockUserList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBlockUserList };
