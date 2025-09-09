const jwt = require("jsonwebtoken");
const { User, Block, UserSocket, Chatlock } = require("../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const searchUser = async (req, res) => {
  let { user_name } = req.body;
  if (!user_name) {
    return res
      .status(400)
      .json({ success: false, message: "user_name field is required" });
  }
  try {
    // authtoken is required
    const authData = jwt.verify(req.authToken, jwtSecretKey);

    const resData = await User.findAll({
      where: {
        user_name: {
          [Op.like]: `${user_name}`,
        },
        user_id: {
          [Op.not]: authData.user_id,
        },
      },
      attributes: [
        "user_id",
        "bio",
        "user_name",
        "email_id",
        "profile_image",
        "device_token",
        "one_signal_player_id",
        // "voice_token",
      ],
    });

    let newData = await Promise.all(
      resData.map(async (e) => {
        // console.log(e.dataValues);
        // Check if the user is blocked or not
        const isBlocked = await Block.findOne({
          where: {
            [Op.or]: [
              { userId: authData.user_id, blockedUserId: e.dataValues.user_id },
              { userId: e.dataValues.user_id, blockedUserId: authData.user_id },
            ],
          },
        });

        const is_online = await UserSocket.findOne({
          where: { user_id: e.dataValues.user_id },
        });

        // Check chat is locked or not
        const chatLockData = await Chatlock.findOne({
          where: {
            user_id: authData.user_id,
            otheruser_id: e.dataValues.user_id,
          },
        });

        // set is_block value
        e.dataValues.is_block =
          isBlocked == null
            ? {
                block_id: 0,
                createdAt: "",
                updatedAt: "",
                userId: 0,
                blockedUserId: 0,
              }
            : isBlocked;
        e.dataValues.is_online = is_online == null ? false : true;
        e.dataValues.is_chat_lock = chatLockData == null ? false : true;

        return e;
      })
    );

    res.status(200).json({
      searchResult: newData,
    });
  } catch (error) {
    console.log(error);
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error.message });
  }
};

module.exports = { searchUser };
