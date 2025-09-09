const jwt = require("jsonwebtoken");
const { User, Block } = require("../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const logoutUser = async (req, res) => {
  try {
    const user_id = req.authData.user_id;

    const isLoggedOut = await User.update(
      {
        device_token: "",
        one_signal_player_id: "",
      },
      {
        where: {
          user_id,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "User Logged out",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { logoutUser };
